import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string }).role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.balconyWidthCm !== undefined && { balconyWidthCm: body.balconyWidthCm }),
        ...(body.balconyHeightCm !== undefined && { balconyHeightCm: body.balconyHeightCm }),
        ...(body.layoutData !== undefined && { layoutData: body.layoutData }),
        ...(body.isPublished !== undefined && { isPublished: body.isPublished }),
        ...(body.thumbnailUrl && { thumbnailUrl: body.thumbnailUrl }),
      },
    });

    return NextResponse.json(template);
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
    if (!session || (session.user as { role?: string }).role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    await prisma.template.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
