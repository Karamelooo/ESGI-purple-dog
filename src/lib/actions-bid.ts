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





// ... imports
import { stripe } from "@/lib/stripe";
import { redirect } from 'next/navigation';

// ... existing code ...

export type BidState = {
    amount?: number;
    adId?: number;
    success?: boolean;
    message?: string;
} | null;

export async function placeBid(prevState: BidState, formData: FormData) { 
    
    try {
        // ... existing inputs retrieval
        const amountInput = formData.get('amount');
        const adIdInput = formData.get('adId'); 
        
        if (amountInput == null || adIdInput == null) {
             throw new Error("Données de formulaire incomplètes. Veuillez réessayer.");
        }
        
        const bidAmount = parseFloat(String(amountInput));
        const adId = Number(adIdInput); 
        
        if (isNaN(bidAmount) || bidAmount <= 0) {
            throw new Error("Veuillez saisir un montant d'enchère valide (un nombre positif).");
        }
        
        const session = await auth();
        
        if (!session?.user || !session.user.id) {
            throw new Error("Vous devez être connecté pour enchérir.");
        }
        const currentUserId = Number(session.user.id);

        if (session.user.role !== 'PRO') {
            throw new Error("Seuls les professionnels peuvent enchérir.");
        }

        // STRIPE CHECK
        const user = await prisma.user.findUnique({ where: { id: currentUserId }});
        if (!user?.stripeCustomerId) {
             // In a real app we might redirect, but here we throw error telling them to go to settings
             return { success: false, message: "Veuillez ajouter un moyen de paiement dans votre profil avant d'enchérir." };
        }
        const paymentMethods = await stripe.paymentMethods.list({ customer: user.stripeCustomerId, type: 'card' });
        if (paymentMethods.data.length === 0) {
             return { success: false, message: "Veuillez ajouter une carte bancaire valide dans votre profil." };
        }

        // ... existing ad validation logic ...
        const ad = await prisma.ad.findUnique({
            where: { id: adId },
            include: { 
                bids: { 
                    orderBy: { amount: 'desc' }, 
                    take: 1 
                } 
            }
        });

        if (!ad) throw new Error("Annonce introuvable.");
        if (ad.type !== 'AUCTION' || ad.status !== 'ACTIVE') throw new Error("Enchère non active.");
        if (!ad.endDate) throw new Error("Date de fin manquante.");
        
        const previousBestBidderId = ad.bids?.[0]?.userId;
        if (previousBestBidderId && currentUserId === previousBestBidderId) {
             throw new Error("Vous êtes déjà le meilleur enchérisseur.");
        }

        const currentPrice = ad.bids[0]?.amount ?? ad.price ?? 0; // Use highest bid or start price
        const requiredIncrement = getRequiredIncrement(currentPrice);
        const minimumRequiredBid = currentPrice + requiredIncrement;

        if (bidAmount < minimumRequiredBid) {
            throw new Error(`L'enchère doit être d'au moins ${minimumRequiredBid} € (palier de ${requiredIncrement} €).`);
        }
        
        // ... (Optional: Palier check logic might need adjustment if currentPrice depends on bids) ...
        // Keeping original logic structure but simplified for brevity in this view
        
        await prisma.bid.create({
            data: {
                amount: bidAmount,
                adId,
                userId: currentUserId,
            }
        });

        // Time extension logic
        const now = new Date();
        const ONE_HOUR_MS = 60 * 60 * 1000;
        const TWO_HOURS_MS = 2 * 60 * 60 * 1000; 
        
        let newEndDate = ad.endDate; 
        let isExtended = false;
        
        if (ad.endDate.getTime() - now.getTime() < ONE_HOUR_MS) {
            newEndDate = new Date(now.getTime() + TWO_HOURS_MS); 
            isExtended = true;
        }
        
        // Update Ad Price (Current Price) to reflect new highest bid
        await prisma.ad.update({
            where: { id: adId },
            data: { 
                price: bidAmount, // Updating displayed price
                endDate: newEndDate
            }
        });

        const adLink = `/ad/${adId}`;
        
        // Notifications
        if (previousBestBidderId && previousBestBidderId !== currentUserId) {
            await createNotification(previousBestBidderId, `⚠️ Surenchère sur "${ad.title}". Nouveau prix: ${bidAmount} €.`, adLink);
        }
        await createNotification(ad.userId, isExtended ? `🎉 Nouvelle enchère (${bidAmount} €) et prolongation !` : `🎉 Nouvelle enchère (${bidAmount} €).`, adLink);

        revalidatePath(adLink);
        return { success: true, message: "Enchère placée avec succès !" };

    } catch (error: unknown) {
        console.error("Erreur enchère:", error);
        const errorMessage = error instanceof Error ? error.message : "Erreur inconnue.";
        return { success: false, message: errorMessage };
    }
}

/**
 * Ajoute au panier (Réservation de 10 minutes)
 */
export async function buyNow(adId: number) {
    const session = await auth();
    if (!session?.user) return { message: "Connectez-vous pour acheter." };
    // if (session.user.role !== 'PRO') return { message: "Réservé aux pros." }; // Removal check if needed or keep

    const userId = Number(session.user.id);
    const now = new Date();

    try {
        await prisma.$transaction(async (tx) => {
            const ad = await tx.ad.findUnique({ where: { id: adId } });
            if (!ad) throw new Error("Introuvable.");
            if (ad.type !== 'SALE') throw new Error("Pas en vente directe.");
            if (ad.status !== 'ACTIVE' && ad.status !== 'PENDING') throw new Error("Non disponible.");
            
            // Verify user exists to prevent FK error (stale session)
            const userExists = await tx.user.findUnique({ where: { id: userId } });
            if (!userExists) throw new Error("Utilisateur introuvable. Veuillez vous reconnecter.");
            
            // Reservation check
            if (ad.reservedUntil && ad.reservedUntil > now && ad.reservedById !== userId) {
                throw new Error("Cet article est réservé par un autre utilisateur.");
            }

            // Set reservation
            const reservedUntil = new Date(now.getTime() + 10 * 60000); // 10 minutes
            await tx.ad.update({
                where: { id: adId },
                data: {
                    reservedUntil,
                    reservedById: userId,
                    // status: 'PENDING' // Optional: Change status to PENDING so others don't see it as purely ACTIVE?
                }
            });
        });
    } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Erreur inconnue";
        return { message };
    }

    revalidatePath(`/ad/${adId}`);
    return { message: "Article ajouté au panier (réservé 10 min). Allez dans 'Mes Achats' pour payer." };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function confirmPurchase(adId: number, prevState: any, formData: FormData) {
    const session = await auth();
    if (!session?.user) return { success: false, message: "Non connecté" };
    
    const userId = Number(session.user.id);
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (!user?.stripeCustomerId) return { success: false, message: "Aucun moyen de paiement." };
    
    // Check Stripe PM
    const paymentMethods = await stripe.paymentMethods.list({ customer: user.stripeCustomerId, type: 'card' });
    if (paymentMethods.data.length === 0) return { success: false, message: "Ajoutez une carte bancaire." };

    try {
        await prisma.$transaction(async (tx) => {
             const ad = await tx.ad.findUnique({ where: { id: adId } });
             if (!ad) throw new Error("Annonce introuvable");
             
             // Check if reserved by user
             if (ad.reservedById !== userId && (!ad.reservedUntil || ad.reservedUntil < new Date())) {
                 // If reservation expired or not reserved by this user, check if free
                 if (ad.status === 'SOLD') throw new Error("Déjà vendu.");
                 if (ad.reservedUntil && ad.reservedUntil > new Date() && ad.reservedById !== userId) throw new Error("Réservé par un autre.");
             }

             // Charge Stripe
             const paymentIntent = await stripe.paymentIntents.create({
                 amount: Math.round((ad.price || 0) * 100),
                 currency: 'eur',
                 customer: user.stripeCustomerId!,
                 payment_method: paymentMethods.data[0].id,
                 off_session: true,
                 confirm: true,
             });

             await tx.ad.update({
                 where: { id: adId },
                 data: {
                     status: 'SOLD',
                     buyerId: userId,
                     reservedUntil: null,
                     reservedById: null
                 }
             });
        });
        
        revalidatePath('/dashboard/purchases');
        return { success: true, message: "Paiement validé !" };
        
    } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Erreur inconnue";
        return { success: false, message: "Echec paiement: " + errorMessage };
    }
}


//notif de cloture des enchères expirées
export async function closeExpiredAuctions() {
    console.log("Démarrage de la tâche de clôture des enchères expirées...");
    
    const now = new Date();
    // 1. Trouver toutes les annonces actives de type AUCTION dont la date de fin est passée
    const expiredAds = await prisma.ad.findMany({
        where: {
            type: 'AUCTION',
            // status: 'ACTIVE', // Or PENDING. Let's capture both to be safe against manual status changes
            status: { in: ['ACTIVE', 'PENDING'] },
            endDate: {
                lte: now, 
            },
        },
        include: {
            bids: {
                orderBy: { amount: 'desc' },
                take: 1,
            },
            user: true, // Le vendeur
        },
    });

    if (expiredAds.length === 0) {
        return { success: true, message: "Aucune enchère à clôturer." };
    }

    console.log(`Clôture de ${expiredAds.length} enchère(s)...`);

    for (const ad of expiredAds) {
        const winningBid = ad.bids[0];
        const adLink = `/ad/${ad.id}`;

        if (winningBid) {
            // 2. CAS 1: GAGNANT TROUVÉ
            const winnerId = winningBid.userId;

            // TENTATIVE DE PAIEMENT STRIPE
            let paymentStatus = 'FAILED';
            try {
                const winner = await prisma.user.findUnique({ where: { id: winnerId } });
                if (winner && winner.stripeCustomerId) {
                     const paymentMethods = await stripe.paymentMethods.list({ customer: winner.stripeCustomerId, type: 'card' });
                     if (paymentMethods.data.length > 0) {
                          await stripe.paymentIntents.create({
                                amount: Math.round(winningBid.amount * 100),
                                currency: 'eur',
                                customer: winner.stripeCustomerId,
                                payment_method: paymentMethods.data[0].id,
                                off_session: true,
                                confirm: true,
                                metadata: {
                                    adId: ad.id.toString(),
                                    userId: winnerId.toString(),
                                    type: 'AUCTION_WIN'
                                }
                          });
                          paymentStatus = 'PAID';
                     }
                }
            } catch (e: unknown) {
                console.error(`Erreur paiement enchère ${ad.id}:`, e);
                // On continue quand même pour marquer comme vendu, ou on marque comme "PAYMENT_FAILED"?
                // Pour l'instant, disons qu'on marque VENDU mais on notifie l'échec?
                // Le CdC dit "est débité". Si échec, peut-être REJECTED ou PENDING_PAYMENT?
                // Restons simple: SOLD (l'admin gérera les impayés)
            }

            await prisma.ad.update({
                where: { id: ad.id },
                data: {
                    status: 'SOLD',
                    buyerId: winnerId, 
                },
            });

            // NOTIFICATIONS
            const winnerMessage = paymentStatus === 'PAID' 
                ? `🥳 Vous avez remporté "${ad.title}" ! Votre carte a été débitée de ${winningBid.amount} €.`
                : `🥳 Vous avez remporté "${ad.title}" ! Le paiement automatique a échoué, merci de régulariser.`;
                
            await createNotification(winnerId, winnerMessage, adLink);

            const sellerMessage = paymentStatus === 'PAID'
                ? `✅ Votre annonce "${ad.title}" est vendue et payée (${winningBid.amount} €).`
                : `✅ Votre annonce "${ad.title}" est vendue (${winningBid.amount} €) (Paiement en attente/échec).`;
                
            await createNotification(ad.userId, sellerMessage, adLink);

            revalidatePath(adLink);

        } else {
            // 3. CAS 2: AUCUNE ENCHÈRE
            await prisma.ad.update({
                where: { id: ad.id },
                data: { status: 'EXPIRED' },
            });

            const sellerMessage = `❌ Votre annonce "${ad.title}" est expirée sans aucune offre.`;
            await createNotification(ad.userId, sellerMessage, adLink);
            
            revalidatePath(adLink);
        }
    }

    return { success: true, message: `${expiredAds.length} enchère(s) traitée(s).` };
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