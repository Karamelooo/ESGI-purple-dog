'use server'

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function placeBid(adId: number, amount: number) {
    const session = await auth();
    if (!session?.user) return { message: "Vous devez être connecté pour enchérir." };

    if (session.user.role !== 'PRO') {
        return { message: "Seuls les professionnels peuvent enchérir." };
        // Requirement: "Seul les utilisateur ayant un rôle PRO peuvent enchérir ou faire un achat immédiat."
        // Let me re-read requirements. "Tout particulier souhaitant vendre...". "Les professionnels peuvent acheter et vendre."
        // "Un système de vente aux enchères... accessible uniquement aux acheteurs professionnels."
        // Yes, only PRO.
    }

    const ad = await prisma.ad.findUnique({
        where: { id: adId },
        include: { bids: { orderBy: { amount: 'desc' }, take: 1 } }
    });

    if (!ad) return { message: "Annonce introuvable." };
    if (ad.type !== 'AUCTION') return { message: "Ce n'est pas une enchère." };
    if (ad.status !== 'ACTIVE') return { message: "L'enchère n'est pas active." };

    const currentPrice = ad.price ?? 0; // Current highest bid or starting price
    const minIncrement = 10; // Simple rule: 10€ increment

    if (amount < currentPrice + minIncrement) {
        return { message: `L'enchère doit être d'au moins ${currentPrice + minIncrement} €.` };
    }

    // Create Bid
    await prisma.bid.create({
        data: {
            amount,
            adId,
            userId: Number(session.user.id),
        }
    });

    // Update Ad Price
    await prisma.ad.update({
        where: { id: adId },
        data: { price: amount }
    });

    revalidatePath(`/ad/${adId}`);
    return { message: "Enchère placée avec succès !" };
}

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
