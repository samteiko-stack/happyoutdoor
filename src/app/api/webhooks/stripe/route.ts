import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
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

    if (designId) {
      const admin = createAdminClient();

      await admin.from("designs").update({ is_paid: true }).eq("id", designId);

      await admin
        .from("payments")
        .update({ status: "completed" })
        .eq("stripe_session_id", session.id);

      console.log(`Design ${designId} unlocked`);
    }
  }

  return NextResponse.json({ received: true });
}
