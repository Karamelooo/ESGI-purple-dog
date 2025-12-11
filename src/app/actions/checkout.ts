'use server';

import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCommissionRate } from "@/lib/commission";

export type CheckoutState = {
    success: boolean;
    message?: string;
    step?: number;
};

// ...
export async function getDeliveryPlatforms() {
    return await prisma.deliveryPlatform.findMany({
        where: { isActive: true }
    });
}

export async function getUserPaymentMethods() {
    const session = await auth();
    if (!session?.user) return [];

    const user = await prisma.user.findUnique({
        where: { id: Number(session.user.id) }
    });

    if (!user?.stripeCustomerId) return [];

    const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripeCustomerId,
        type: 'card',
    });

    return paymentMethods.data.map(pm => ({
        id: pm.id,
        brand: pm.card?.brand || 'unknown',
        last4: pm.card?.last4 || '****',
        expMonth: pm.card?.exp_month,
        expYear: pm.card?.exp_year,
    }));
}

// Helper for DB updates
async function completeOrder(
    ad: any,
    user: any,
    deliverySlug: string,
    paymentIntentId: string,
    totalAmount: number,
    commissionAmount: number,
    addressDetails: { address: string, city: string, zipCode: string, phone: string }
) {
    return await prisma.$transaction(async (tx) => {
        // Create Delivery Record
        const deliveryPlatform = await tx.deliveryPlatform.findUnique({ where: { slug: deliverySlug } });

        await tx.delivery.create({
            data: {
                adId: ad.id,
                status: 'PENDING',
                carrier: deliveryPlatform?.name || deliverySlug,
                trackingNumber: null,
                address: addressDetails.address,
                city: addressDetails.city,
                zipCode: addressDetails.zipCode,
                phone: addressDetails.phone
            }
        });

        // Create Transaction
        await tx.transaction.create({
            data: {
                amount: totalAmount,
                commissionAmount: commissionAmount,
                type: 'PAIEMENT',
                status: 'COMPLETED',
                stripePaymentId: paymentIntentId,
                adId: ad.id
            }
        });

        // Update Ad
        await tx.ad.update({
            where: { id: ad.id },
            data: {
                status: 'SOLD',
                buyerId: user.id,
                reservedUntil: null,
                reservedById: null
            }
        });
    });
}

export async function processCheckout(adId: number, formData: FormData) {
    const session = await auth();
    if (!session?.user) return { success: false, message: "Non connecté" };

    const userId = Number(session.user.id);

    const deliverySlug = formData.get('deliverySlug') as string;
    const paymentMethodId = formData.get('paymentMethodId') as string;

    // Delivery Details
    const address = formData.get('address') as string;
    const city = formData.get('city') as string;
    const zipCode = formData.get('zipCode') as string;
    const phone = formData.get('phone') as string;

    if (!deliverySlug || !address || !city || !zipCode) {
        return { success: false, message: "Veuillez remplir toutes les informations de livraison." };
    }

    if (!paymentMethodId) {
        return { success: false, message: "Veuillez sélectionner un moyen de paiement." };
    }

    try {
        // 1. Validate Ad & User
        const ad = await prisma.ad.findUnique({ where: { id: adId }, include: { user: true } });
        if (!ad) throw new Error("Annonce introuvable");

        // Security checks
        const isReservedByMe = ad.reservedById === userId && ad.reservedUntil && ad.reservedUntil > new Date();
        if (!isReservedByMe) {
            if (ad.status === 'SOLD') throw new Error("Annonce déjà vendue.");
            if (ad.reservedById && ad.reservedById !== userId && ad.reservedUntil && ad.reservedUntil > new Date()) {
                throw new Error("Réservé par quelqu'un d'autre.");
            }
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.stripeCustomerId) throw new Error("Aucun moyen de paiement configuré.");

        // 2. Calculate Totals
        const commissionRate = await getCommissionRate(ad.categoryId, 'BUYER');
        const commissionAmount = (ad.price || 0) * commissionRate;
        const shippingCost = deliverySlug === 'hand-delivery' ? 0 : 15.90;
        const totalAmount = (ad.price || 0) + commissionAmount + shippingCost;

        // 3. Process Payment
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(totalAmount * 100),
            currency: 'eur',
            customer: user.stripeCustomerId!,
            payment_method: paymentMethodId,
            confirm: true,
            return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/purchases`,
            metadata: {
                adId: ad.id.toString(),
                userId: userId.toString(),
                type: 'DIRECT_PURCHASE',
                itemPrice: (ad.price || 0).toString(),
                commission: commissionAmount.toString(),
                shipping: shippingCost.toString()
            }
        });

        // HANDLE 3DS / ACTION REQUIRED
        if (paymentIntent.status === 'requires_action' || paymentIntent.status === 'requires_confirmation') {
            return {
                success: false,
                requiresAction: true,
                clientSecret: paymentIntent.client_secret,
                paymentIntentId: paymentIntent.id
            };
        }

        if (paymentIntent.status !== 'succeeded') {
            throw new Error(`Le paiement a échoué (Status: ${paymentIntent.status}).`);
        }

        // 4. Finalize Order
        await completeOrder(ad, user, deliverySlug, paymentIntent.id, totalAmount, commissionAmount, { address, city, zipCode, phone });

    } catch (e: any) {
        return { success: false, message: e.message };
    }

    revalidatePath('/dashboard/purchases');
    redirect('/dashboard/purchases');
}

export async function finalizeCheckout(
    paymentIntentId: string,
    adId: number,
    deliverySlug: string,
    addressDetails: { address: string, city: string, zipCode: string, phone: string }
) {
    const session = await auth();
    if (!session?.user) return { success: false, message: "Non connecté" };
    const userId = Number(session.user.id);

    try {
        const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

        if (paymentIntent.status !== 'succeeded') {
            return { success: false, message: "Le paiement n'est pas validé." };
        }

        const ad = await prisma.ad.findUnique({ where: { id: adId }, include: { user: true } });
        if (!ad) throw new Error("Annonce introuvable");
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) throw new Error("User introuvable");

        const commissionRate = await getCommissionRate(ad.categoryId, 'BUYER');
        const commissionAmount = (ad.price || 0) * commissionRate;
        const shippingCost = deliverySlug === 'hand-delivery' ? 0 : 15.90;
        const totalAmount = (ad.price || 0) + commissionAmount + shippingCost;

        await completeOrder(ad, user, deliverySlug, paymentIntent.id, totalAmount, commissionAmount, addressDetails);

    } catch (e: any) {
        return { success: false, message: e.message };
    }

    revalidatePath('/dashboard/purchases');
    redirect('/dashboard/purchases');
}
