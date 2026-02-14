import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { stripe } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url));
    }

    const url = new URL(req.url);
    const designId = url.searchParams.get("designId");

    if (!designId) {
      return NextResponse.json({ error: "Design ID required" }, { status: 400 });
    }

    const design = await prisma.design.findUnique({ where: { id: designId } });
    if (!design || design.userId !== session.user.id) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    if (design.isPaid) {
      return NextResponse.redirect(new URL(`/designs/${designId}/links`, req.url));
    }

    const amount = parseInt(process.env.DESIGN_UNLOCK_PRICE || "999"); // cents

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Unlock Product Links - ${design.name}`,
              description: "Get affiliate links for all products in your balcony design",
            },
            unit_amount: amount,
          },
          quantity: 1,
        },
      ],
      metadata: {
        designId: design.id,
        userId: session.user.id,
      },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/designs/${designId}/links?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/designs/${designId}?canceled=true`,
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        userId: session.user.id,
        designId: design.id,
        amount,
        stripeSessionId: checkoutSession.id,
        status: "pending",
      },
    });

    return NextResponse.redirect(checkoutSession.url!, 303);
  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
