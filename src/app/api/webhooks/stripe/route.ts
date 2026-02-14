import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = req.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const designId = session.metadata?.designId;
    const userId = session.metadata?.userId;

    if (designId && userId) {
      // Update design as paid
      await prisma.design.update({
        where: { id: designId },
        data: { isPaid: true },
      });

      // Update payment status
      await prisma.payment.updateMany({
        where: {
          stripeSessionId: session.id,
        },
        data: { status: "completed" },
      });

      console.log(`Design ${designId} unlocked for user ${userId}`);
    }
  }

  return NextResponse.json({ received: true });
}
