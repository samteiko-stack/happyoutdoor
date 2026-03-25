import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string }).role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const templates = await prisma.template.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { designs: true } } },
    });
    return NextResponse.json(templates);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string }).role?.toUpperCase() !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const template = await prisma.template.create({
      data: {
        name: body.name || "New Template",
        description: body.description || null,
        balconyWidthCm: body.balconyWidthCm || 300,
        balconyHeightCm: body.balconyHeightCm || 200,
        layoutData: body.layoutData || "[]",
        isPublished: body.isPublished ?? false,
      },
    });
    return NextResponse.json(template, { status: 201 });
  } catch (error: any) {
    console.error("Template creation error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
