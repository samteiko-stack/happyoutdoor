import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("GET /api/admin/products error:", error);
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session || (session.user as { role?: string }).role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      name,
      categoryId,
      description,
      price,
      affiliateLink,
      imageUrl,
      topViewImageUrl,
      modelUrl,
      widthCm,
      heightCm,
    } = body;

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const product = await prisma.product.create({
      data: {
        name,
        categoryId: categoryId || null,
        description: description ?? null,
        price: price ?? 0,
        affiliateLink: affiliateLink ?? null,
        imageUrl: imageUrl ?? null,
        topViewImageUrl: topViewImageUrl ?? null,
        modelUrl: modelUrl ?? null,
        widthCm: widthCm ?? 50,
        heightCm: heightCm ?? 50,
      },
      include: { category: true },
    });

    return NextResponse.json(product, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
