'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getRequiredIncrement } from "@/lib/actions-rules"; 


async function createNotification(userId: number, message: string, link: string) {
    if (!userId) return;

    await prisma.notification.create({
        data: {
            userId: userId,
            message: message,
            link: link,
            read: false,
        }
    });
}





export async function placeBid(prevState: any, formData: FormData) { 
    
    try {
        const amountInput = formData.get('amount');
        const adIdInput = formData.get('adId'); 
        
        if (amountInput == null || adIdInput == null) {
             throw new Error("Données de formulaire incomplètes. Veuillez réessayer.");
        }
        
        const bidAmount = parseFloat(String(amountInput));
        const adId = Number(adIdInput); 
        
        // VALIDATION du nombre
        if (isNaN(bidAmount) || bidAmount <= 0) {
            throw new Error("Veuillez saisir un montant d'enchère valide (un nombre positif).");
        }
        
        // --- 2. Validation de l'Utilisateur ---
        const session = await auth();
        
        if (!session?.user || !session.user.id) {
            throw new Error("Vous devez être connecté pour enchérir.");
        }
        const currentUserId = Number(session.user.id);

        if (session.user.role !== 'PRO') {
            throw new Error("Seuls les professionnels peuvent enchérir.");
        }

        // --- 3. Récupération et Validation de l'Annonce ---
        const ad = await prisma.ad.findUnique({
            where: { id: adId },
            // Récupère la meilleure enchère pour la validation et la notification de l'ancien enchérisseur
            include: { 
                bids: { 
                    orderBy: { amount: 'desc' }, 
                    take: 1 
                } 
            }
        });

        if (!ad) {
            throw new Error("Annonce introuvable.");
        }
        if (ad.type !== 'AUCTION' || ad.status !== 'ACTIVE') {
            throw new Error("Cette enchère n'est pas active ou n'est pas une enchère.");
        }
        
        // La date de fin doit exister pour une enchère active
        if (!ad.endDate) {
             throw new Error("La date de fin de l'enchère n'est pas définie.");
        }
        
        const previousBestBidderId = ad.bids?.[0]?.userId;
        
        if (previousBestBidderId && currentUserId === previousBestBidderId) {
             throw new Error("Vous êtes déjà le meilleur enchérisseur.");
        }

        // --- 4. Validation des Paliers CdC (utilise la fonction importée) ---
        const currentPrice = ad.price ?? 0;
        const requiredIncrement = getRequiredIncrement(currentPrice);
        const minimumRequiredBid = currentPrice + requiredIncrement;

        if (bidAmount < minimumRequiredBid) {
            throw new Error(`L'enchère doit être d'au moins ${minimumRequiredBid} € (palier de ${requiredIncrement} €).`);
        }
        
        const difference = bidAmount - currentPrice; 
        
        if (difference % requiredIncrement !== 0) {
            throw new Error(`Votre augmentation doit être un multiple de ${requiredIncrement} €. (${difference.toFixed(2)} € proposé).`);
        }
        
        // --- Création de l'enregistrement de l'enchère (bid) ---
        await prisma.bid.create({
            data: {
                amount: bidAmount,
                adId,
                userId: currentUserId,
            }
        });

        
        
        const now = new Date();
        const ONE_HOUR_MS = 60 * 60 * 1000;
        const TWO_HOURS_MS = 2 * 60 * 60 * 1000; 
        
        let newEndDate = ad.endDate; 
        let isExtended = false; // Drapeau pour la notification
        
        // Si le temps restant est inférieur à 1 heure (60 minutes)
        if (ad.endDate.getTime() - now.getTime() < ONE_HOUR_MS) {
            newEndDate = new Date(now.getTime() + TWO_HOURS_MS); 
            isExtended = true;
            console.log(`[H-1 Trigger] Prolongation de l'enchère : nouvelle date de fin à ${newEndDate.toLocaleString()}`);
        }
        
        // Mise à jour du Prix de l'Annonce et de la Date de Fin
        await prisma.ad.update({
            where: { id: adId },
            data: { 
                price: bidAmount,
                endDate: newEndDate
            }
        });

        const adLink = `/ad/${adId}`;

        
        
        // A) Notification à l'ancien meilleur enchérisseur (s'il y en avait un)
        if (previousBestBidderId && previousBestBidderId !== currentUserId) {
            const message = `⚠️ Vous avez été surenchéri sur l'annonce "${ad.title}". Le nouveau prix est ${bidAmount} €.`;
            await createNotification(previousBestBidderId, message, adLink);
        }

        // B) Notification au vendeur (l'utilisateur qui a posté l'annonce)
        const sellerMessage = isExtended
            ? `🎉 Nouvelle enchère à ${bidAmount} € sur votre annonce "${ad.title}". L'enchère a été prolongée de 2 heures.`
            : `🎉 Nouvelle enchère à ${bidAmount} € sur votre annonce "${ad.title}".`;
            
        await createNotification(ad.userId, sellerMessage, adLink);

        revalidatePath(adLink);
        return { success: true, message: "Enchère placée avec succès !" };

    } catch (error) {
        let errorMessage = "Une erreur inconnue est survenue.";
        if (error instanceof Error) {
            errorMessage = error.message;
        } else if (typeof error === 'string') {
            errorMessage = error;
        }

        console.error("Erreur lors de l'enchère:", errorMessage);
        
        return { 
            success: false, 
            message: errorMessage
        };
    }
}

/**
 * Gère l'achat immédiat pour les annonces de type SALE.
 */
export async function buyNow(adId: number) {
    const session = await auth();
    if (!session?.user) return { message: "Connectez-vous pour acheter." };
    if (session.user.role !== 'PRO') return { message: "Réservé aux pros." };

    const ad = await prisma.ad.findUnique({ where: { id: adId } });
    if (!ad) return { message: "Introuvable." };
    if (ad.type !== 'SALE') return { message: "Pas en vente directe." };
    if (ad.status !== 'ACTIVE') return { message: "Déjà vendu ou inactif." };

    await prisma.ad.update({
        where: { id: adId },
        data: {
            status: 'SOLD',
            buyerId: Number(session.user.id),
        }
    });

    revalidatePath(`/ad/${adId}`);
    return { message: "Achat confirmé !" };
}

