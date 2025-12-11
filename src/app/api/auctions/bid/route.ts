
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const session = await auth();
    const { adId, amount } = await req.json();

    if (!session || !session.user || !session.user.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userId = parseInt(session.user.id);

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.stripeCustomerId) {
       return new NextResponse("Payment method required", { status: 402 }); // Payment Required
    }

    // Check if user has a valid payment method
    const paymentMethods = await stripe.paymentMethods.list({
      customer: user.stripeCustomerId,
      type: 'card',
    });

    if (paymentMethods.data.length === 0) {
        return new NextResponse("No valid payment method found", { status: 402 });
    }

    const ad = await prisma.ad.findUnique({
      where: { id: adId },
      include: { bids: { orderBy: { amount: 'desc' }, take: 1 } }
    });

    if (!ad) {
      return new NextResponse("Ad not found", { status: 404 });
    }

    if (ad.type !== 'AUCTION') {
        return new NextResponse("Not an auction", { status: 400 });
    }

    if (ad.endDate && new Date(ad.endDate) < new Date()) {
        return new NextResponse("Auction ended", { status: 400 });
    }

    const currentHighestBid = ad.bids[0]?.amount || ad.price || 0;
    
    if (amount <= currentHighestBid) {
        return new NextResponse("Bid must be higher than current price", { status: 400 });
    }

    const bid = await prisma.bid.create({
      data: {
        amount: parseFloat(amount),
        userId,
        adId,
      }
    });

    return NextResponse.json(bid);
  } catch (error) {
    console.error("[BID_ERROR]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
