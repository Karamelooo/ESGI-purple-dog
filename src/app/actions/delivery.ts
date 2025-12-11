'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function confirmReceipt(adId: number) {
    const session = await auth();
    if (!session?.user) return { success: false, message: "Non connecté" };

    const userId = Number(session.user.id);

    try {
        const ad = await prisma.ad.findUnique({
            where: { id: adId },
            include: { delivery: true }
        });

        if (!ad) throw new Error("Annonce introuvable");
        if (ad.buyerId !== userId) throw new Error("Vous n'êtes pas l'acheteur de cet article.");

        // Update Delivery Status
        // Note: In a real world, this would trigger Stripe payout transfer to seller.
        await prisma.delivery.update({
            where: { adId: adId },
            data: { status: 'DELIVERED' }
        });

        revalidatePath('/dashboard/purchases');
        return { success: true, message: "Réception confirmée. Le vendeur va être payé." };

    } catch (e: any) {
        return { success: false, message: e.message };
    }
}
