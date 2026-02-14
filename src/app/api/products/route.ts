import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      include: { category: true },
      orderBy: { name: "asc" },
    });
    return NextResponse.json(products);
  } catch {
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
