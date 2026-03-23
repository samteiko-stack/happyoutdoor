import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const design = await prisma.design.findUnique({
      where: { id },
      include: { template: true },
    });

    if (!design) {
      console.error(`Design not found: ${id}`);
      return NextResponse.json({ error: "Design not found" }, { status: 404 });
    }

    const userRole = (session.user as { role: string }).role;
    if (design.userId !== session.user.id && userRole !== "ADMIN") {
      console.error(`Unauthorized: design.userId=${design.userId}, session.user.id=${session.user.id}`);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(design);
  } catch (error) {
    console.error("GET design error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const existing = await prisma.design.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const design = await prisma.design.update({
      where: { id },
      data: {
        name: body.name ?? existing.name,
        balconyWidthCm: body.balconyWidthCm ?? existing.balconyWidthCm,
        balconyHeightCm: body.balconyHeightCm ?? existing.balconyHeightCm,
        layoutData: body.layoutData
          ? typeof body.layoutData === "string"
            ? body.layoutData
            : JSON.stringify(body.layoutData)
          : existing.layoutData,
      },
    });

    return NextResponse.json(design);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const existing = await prisma.design.findUnique({ where: { id } });
    if (!existing || existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.design.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
