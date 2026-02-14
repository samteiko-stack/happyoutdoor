import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Find the design and verify ownership
    const design = await prisma.design.findUnique({
      where: { id },
    });

    if (!design) {
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    if (design.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Mark as paid (preview mode)
    const updated = await prisma.design.update({
      where: { id },
      data: { isPaid: true },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Preview unlock error:", error);
    return NextResponse.json(
      { error: "Failed to unlock preview" },
      { status: 500 }
    );
  }
}
