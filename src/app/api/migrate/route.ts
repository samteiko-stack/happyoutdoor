import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    // Try to query the database to see if tables exist
    const result = await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "name" TEXT,
        "passwordHash" TEXT NOT NULL,
        "role" TEXT DEFAULT 'USER',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Category" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT UNIQUE NOT NULL,
        "icon" TEXT,
        "sortOrder" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Product" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "categoryId" TEXT,
        "description" TEXT,
        "price" DOUBLE PRECISION DEFAULT 0,
        "affiliateLink" TEXT,
        "imageUrl" TEXT,
        "topViewImageUrl" TEXT,
        "modelUrl" TEXT,
        "widthCm" INTEGER DEFAULT 50,
        "heightCm" INTEGER DEFAULT 50,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS "Template" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "balconyWidthCm" INTEGER NOT NULL,
        "balconyHeightCm" INTEGER NOT NULL,
        "layoutData" TEXT NOT NULL,
        "isPublished" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS "Design" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "templateId" TEXT,
        "balconyWidthCm" INTEGER NOT NULL,
        "balconyHeightCm" INTEGER NOT NULL,
        "layoutData" TEXT NOT NULL,
        "isPaid" BOOLEAN DEFAULT false,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
        FOREIGN KEY ("templateId") REFERENCES "Template"("id") ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS "Payment" (
        "id" TEXT PRIMARY KEY,
        "userId" TEXT NOT NULL,
        "designId" TEXT NOT NULL,
        "amount" INTEGER NOT NULL,
        "stripeSessionId" TEXT UNIQUE NOT NULL,
        "status" TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
        FOREIGN KEY ("designId") REFERENCES "Design"("id") ON DELETE CASCADE
      );
    `);
    
    return NextResponse.json({
      success: true,
      message: "Database tables created successfully",
      result,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message,
    }, { status: 500 });
  }
}
