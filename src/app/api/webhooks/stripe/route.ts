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
    const userId = session.metadata?.userId;

    if (designId && userId) {
      const admin = createAdminClient();

      const { data: design } = await admin
        .from("designs")
        .select("user_id")
        .eq("id", designId)
        .single();

      if (!design || design.user_id !== userId) {
        console.error("Webhook rejected: design/user mismatch", { designId, userId });
        return NextResponse.json({ error: "Invalid metadata" }, { status: 400 });
      }

      await admin
        .from("designs")
        .update({ is_paid: true })
        .eq("id", designId)
        .eq("user_id", userId);

      await admin
        .from("payments")
        .update({ status: "completed" })
        .eq("stripe_session_id", session.id)
        .eq("user_id", userId);

      console.log(`Design ${designId} unlocked for user ${userId}`);
    }
  }

  return NextResponse.json({ received: true });
}
