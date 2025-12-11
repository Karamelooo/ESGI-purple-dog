'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getRequiredIncrement } from "@/lib/actions-rules";
import { stripe } from "@/lib/stripe";
import { redirect } from 'next/navigation';

// Type definition for Notification logic (implicit in snippet)
// Assuming standard Prisma types or separate file.

// --- Helper Functions ---

// Notif des enchères en temps réel
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

// --- Types ---

export type BidState = {
    amount?: number;
    adId?: number;
    success?: boolean;
    message?: string;
} | null;

// --- Actions ---

export async function placeBid(prevState: BidState, formData: FormData) {

    try {
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
        const user = await prisma.user.findUnique({ where: { id: currentUserId } });
        if (!user?.stripeCustomerId) {
            return { success: false, message: "Veuillez ajouter un moyen de paiement dans votre profil avant d'enchérir." };
        }
        const paymentMethods = await stripe.paymentMethods.list({ customer: user.stripeCustomerId, type: 'card' });
        if (paymentMethods.data.length === 0) {
            return { success: false, message: "Veuillez ajouter une carte bancaire valide dans votre profil." };
        }

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
        // Prevent bidding on own ad
        if (ad.userId === currentUserId) {
            throw new Error("Vous ne pouvez pas enchérir sur votre propre annonce.");
        }

        const currentPrice = ad.bids[0]?.amount ?? ad.price ?? 0;
        const requiredIncrement = getRequiredIncrement(currentPrice);
        const minimumRequiredBid = currentPrice + requiredIncrement;

        if (bidAmount < minimumRequiredBid) {
            throw new Error(`L'enchère doit être d'au moins ${minimumRequiredBid} € (palier de ${requiredIncrement} €).`);
        }

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

        // Update Ad Price & End Date
        await prisma.ad.update({
            where: { id: adId },
            data: {
                price: bidAmount,
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
    // if (session.user.role !== 'PRO') return { message: "Réservé aux pros." };

    // --- CONFLICT RESOLUTION START ---
    // We merged the definition of userId/now with the validation logic inside the transaction.
    const userId = Number(session.user.id);
    const now = new Date();
    // --- CONFLICT RESOLUTION END ---

    try {
        await prisma.$transaction(async (tx) => {
            const ad = await tx.ad.findUnique({ where: { id: adId } });

            if (!ad) throw new Error("Introuvable.");
            if (ad.type !== 'SALE') throw new Error("Pas en vente directe.");
            if (ad.status !== 'ACTIVE' && ad.status !== 'PENDING') throw new Error("Non disponible (déjà vendu ou inactif).");

            // Self-purchase check (Merged from origin/main logic)
            if (ad.userId === userId) throw new Error("Vous ne pouvez pas acheter votre propre annonce.");

            // Verify user exists to prevent FK error
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
                    // status: 'PENDING' // Optional
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



// notif de cloture des enchères expirées
export async function closeExpiredAuctions() {


    const now = new Date();
    // 1. Trouver toutes les annonces actives de type AUCTION dont la date de fin est passée
    const expiredAds = await prisma.ad.findMany({
        where: {
            type: 'AUCTION',
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
