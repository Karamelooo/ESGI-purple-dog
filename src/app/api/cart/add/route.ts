
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { adId } = await req.json();

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = parseInt(session.user.id);

    // Transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
        const ad = await tx.ad.findUnique({
            where: { id: adId }
        });

        if (!ad) throw new Error("Ad not found");
        if (ad.status !== 'PENDING' && ad.status !== 'ACTIVE') throw new Error("Ad not available");
        if (ad.type === 'AUCTION') throw new Error("Cannot add auction to cart");

        // Check reservation
        if (ad.reservedUntil && ad.reservedUntil > new Date() && ad.reservedById !== userId) {
            throw new Error("Item is currently reserved by another user");
        }

        // Reserve for 10 minutes
        const reservedUntil = new Date();
        reservedUntil.setMinutes(reservedUntil.getMinutes() + 10);

        const updatedAd = await tx.ad.update({
            where: { id: adId },
            data: {
                reservedUntil,
                reservedById: userId
            }
        });

        return updatedAd;
    });

    return NextResponse.json(result);

  } catch (error: unknown) {
    console.error("[CART_ADD_ERROR]", error);
    const message = error instanceof Error ? error.message : "Internal Error";
    return new NextResponse(message, { status: 400 });
  }
}
