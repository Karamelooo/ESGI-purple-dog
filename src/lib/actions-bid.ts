'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

import { getRequiredIncrement } from "@/lib/actions-rules"; 

//notif des ebchères en temps réel
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

    const ad = await prisma.ad.findUnique({
        where: { id: adId },
        select: {
            id: true,
            type: true,
            status: true,
            userId: true,
            title: true,
            price: true,
        },
    });
    if (!ad) return { message: "Introuvable." };
    if (ad.type !== 'SALE') return { message: "Pas en vente directe." };
    if (ad.status !== 'ACTIVE') return { message: "Déjà vendu ou inactif." };
    if (ad.userId === Number(session.user.id)) return { message: "Vous ne pouvez pas acheter votre propre annonce." };

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


//notif de cloture des enchères expirées
export async function closeExpiredAuctions() {
    console.log("Démarrage de la tâche de clôture des enchères expirées...");
    
    // 1. Trouver toutes les annonces actives de type AUCTION dont la date de fin est passée
    const expiredAds = await prisma.ad.findMany({
        where: {
            type: 'AUCTION',
            status: 'ACTIVE',
            endDate: {
                lt: new Date(), 
            },
        },
        include: {
            // Récupérer la meilleure enchère s'il y en a une
            bids: {
                orderBy: { amount: 'desc' },
                take: 1,
            },
            user: true, // Le vendeur (user)
        },
    });

    if (expiredAds.length === 0) {
        console.log("Aucune enchère expirée trouvée.");
        return { success: true, message: "Aucune enchère à clôturer." };
    }

    console.log(`Clôture de ${expiredAds.length} enchère(s)...`);

    for (const ad of expiredAds) {
        const winningBid = ad.bids[0]; // La meilleure enchère, ou undefined
        const adLink = `/ad/${ad.id}`;

        if (winningBid) {
            // 2. CAS 1: GAGNANT TROUVÉ (SOLD)
            const winnerId = winningBid.userId;

            // Mise à jour de l'annonce
            await prisma.ad.update({
                where: { id: ad.id },
                data: {
                    status: 'SOLD',
                    buyerId: winnerId, // Attribuer l'acheteur
                },
            });

            // 💡 NOTIFICATION DE FIN D'ENCHÈRE (Gagnant)
            const winnerMessage = `🥳 Félicitations ! Vous avez remporté l'enchère pour "${ad.title}" au prix de ${winningBid.amount} €.`;
            await createNotification(winnerId, winnerMessage, adLink);

            // 💡 NOTIFICATION DE FIN D'ENCHÈRE (Vendeur - Vendu)
            const sellerMessage = `✅ Votre annonce "${ad.title}" a été clôturée et vendue à ${winningBid.amount} €.`;
            await createNotification(ad.userId, sellerMessage, adLink);

            revalidatePath(adLink);

        } else {
            // 3. CAS 2: AUCUNE ENCHÈRE PLACÉE (EXPIRED)
            await prisma.ad.update({
                where: { id: ad.id },
                data: {
                    status: 'EXPIRED', // L'annonce n'a pas trouvé preneur
                },
            });

            // 💡 NOTIFICATION DE FIN D'ENCHÈRE (Vendeur - Expiré)
            const sellerMessage = `❌ Votre annonce "${ad.title}" est expirée sans aucune offre.`;
            await createNotification(ad.userId, sellerMessage, adLink);
            
            revalidatePath(adLink);
        }
    }

    return { success: true, message: `${expiredAds.length} enchère(s) clôturée(s) avec succès.` };
}

/*export async function submitOfferForSale(adId: number, amount: number) {
    const session = await auth();

    if (!session?.user || !session.user.id) {
        return { success: false, message: "Non authentifié" };
    }

    const userId = Number(session.user.id);
    
    // Le CdC stipule que seuls les Pros peuvent acheter/enchérir, nous conservons cette vérification.
    if (session.user.role !== 'PRO') {
        return { success: false, message: "Seuls les professionnels peuvent soumettre une offre de prix." };
    }

    if (amount <= 0 || isNaN(amount)) {
        return { success: false, message: "Veuillez saisir un montant d'offre valide." };
    }

    try {
        const ad = await prisma.ad.findUnique({
            where: { id: adId },
            select: { 
                userId: true, 
                type: true, 
                status: true,
                title: true,
                price: true
            }
        });

        if (!ad) {
            return { success: false, message: "Annonce introuvable." };
        }
        // Cette fonction ne concerne que les annonces en vente directe actives.
        if (ad.type !== 'SALE' || ad.status !== 'ACTIVE') {
            return { success: false, message: "Cette annonce n'accepte pas d'offres de prix actuellement." };
        }
        if (ad.userId === userId) {
            return { success: false, message: "Vous ne pouvez pas faire d'offre sur votre propre annonce." };
        }
        
        // --- Enregistrement de l'offre (Bid) ---
        // Le cast 'as any' est ajouté pour éviter les problèmes de typage persistants de Prisma
        await (prisma as any).bid.create({
            data: {
                amount: amount,
                adId: adId,
                userId: userId,
                // On peut ajouter un flag ici si vous voulez distinguer les offres sur SALE des enchères AUCTION
                // Par exemple: type: 'OFFER' (si vous ajoutez un champ type à votre modèle Bid)
            },
        });

        const adLink = `/ad/${adId}`;
        
        // Notification au vendeur (Particulier)
        const sellerMessage = `🔔 Nouvelle offre de ${amount} € reçue sur votre annonce "${ad.title}". Consultez votre tableau de bord.`;
        await createNotification(ad.userId, sellerMessage, adLink);

        // Revalidation pour que le dashboard du vendeur se mette à jour
        revalidatePath(adLink);
        revalidatePath('/dashboard/ads');
        
        return { success: true, message: "Votre offre a été soumise au vendeur. Il peut l'accepter ou la refuser." };

    } catch (error) {
        console.error("Erreur lors de la soumission de l'offre:", error);
        return { success: false, message: "Erreur serveur lors de la soumission de l'offre." };
    }
}

*/