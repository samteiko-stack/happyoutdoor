import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const designs = await prisma.design.findMany({
      where: { userId: session.user.id },
      include: { template: true },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json(designs);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { name, balconyWidthCm, balconyHeightCm, layoutData, templateId } = body;

    console.log("Creating design:", { userId: session.user.id, name, balconyWidthCm, balconyHeightCm });

    const design = await prisma.design.create({
      data: {
        userId: session.user.id,
        name: name || "My Balcony Design",
        balconyWidthCm: balconyWidthCm || 300,
        balconyHeightCm: balconyHeightCm || 200,
        layoutData: typeof layoutData === "string" ? layoutData : JSON.stringify(layoutData || []),
        templateId: templateId || null,
      },
    });

    console.log("Design created successfully:", design.id);

    return NextResponse.json(design, { status: 201 });
  } catch (error) {
    console.error("Error creating design:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
