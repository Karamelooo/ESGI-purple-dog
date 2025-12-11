
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import prisma from '@/lib/prisma';
import Stripe from 'stripe';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get("Stripe-Signature") as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Erreur inconnue";
    return new NextResponse(`Webhook Error: ${errorMessage}`, { status: 400 });
  }



  if (event.type === 'setup_intent.succeeded') {
    const setupIntent = event.data.object as Stripe.SetupIntent;
    // We could mark user as "payment method verified" here if we had a flag for it.
    // For now, checks are done at bid time using Stripe API to see if valid PM exists.

  }

  if (event.type === 'payment_intent.succeeded') {
    const paymentIntent = event.data.object as Stripe.PaymentIntent;
    const adId = paymentIntent.metadata.adId;

    if (adId) {
      await prisma.ad.update({
        where: { id: parseInt(adId) },
        data: { status: 'SOLD' }
      });
    }
  }

  return new NextResponse(null, { status: 200 });
}
