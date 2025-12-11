import { auth } from "@/auth";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import CheckoutFlow from "@/components/checkout-flow";
import { getDeliveryPlatforms, getUserPaymentMethods } from "@/app/actions/checkout";
import { getCommissionRate } from "@/lib/commission";

export default async function CheckoutPage({ params }: { params: { adId: string } }) {
    // Async params in Next.js 15
    const { adId } = await params;
    const session = await auth();

    if (!session?.user) {
        redirect(`/auth/signin?callbackUrl=/checkout/${adId}`);
    }

    const userId = Number(session.user.id);
    const id = parseInt(adId);

    const ad = await prisma.ad.findUnique({
        where: { id: id },
        include: { user: true }
    });

    if (!ad) notFound();

    // Verify if user can checkout this ad
    // Must be reserved by user OR (Sold to user but delivery pending? No, this is for payment)
    const isReservedByMe = ad.reservedById === userId && ad.reservedUntil && new Date(ad.reservedUntil) > new Date();

    // For direct purchase of "SALE" items not yet reserved, we might auto-reserve or allow. 
    // But typically we require reservation first via 'Add to cart'.
    // If not reserved by me, and status is ACTIVE, check if we can hijack it? 
    // Better to stick to "Must be in cart" flow for consistency with "Validating command".

    if (!isReservedByMe) {
        // If item is AUCTION and WON by user, it's also a checkout flow.
        const isWonAuction = ad.type === 'AUCTION' && ad.status === 'SOLD' && ad.buyerId === userId;

        // However, won auctions are usually auto-paid? The prompt says "auto-payment failed" logic exists.
        // If auto-payment failed, we might need manual checkout.
        // For now, let's assume this page is primarily for "SALE" items in "PENDING/RESERVED" state.

        if (!isWonAuction && ad.status !== 'ACTIVE') { // Allow ACTIVE if we want to support direct buy without explicit cart step?
            return (
                <div className="container mx-auto py-20 text-center">
                    <h1 className="text-2xl font-bold mb-4">Cet article n'est pas disponible pour le paiement.</h1>
                    <p>Il a peut-être expiré ou été réservé par un autre utilisateur.</p>
                </div>
            );
        }
    }

    const deliveryPlatforms = await getDeliveryPlatforms();
    const paymentMethods = await getUserPaymentMethods();


    // ...

    const adDetails = {
        ...ad,
        price: ad.price ?? 0,
        images: ad.images ?? []
    };

    const commissionRate = await getCommissionRate(ad.categoryId, 'BUYER');

    return (
        <div className="container mx-auto py-8">
            <h1 className="text-3xl font-bold mb-8 text-center">Finaliser ma commande</h1>
            <CheckoutFlow
                ad={adDetails}
                deliveryPlatforms={deliveryPlatforms}
                commissionRate={commissionRate}
                paymentMethods={paymentMethods}
            />
        </div>
    );
}
