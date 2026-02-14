import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { email, name } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 400 }
      );
    }

    // Create admin user with a temporary password (they should change it)
    const tempPassword = Math.random().toString(36).slice(-10);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    const newAdmin = await prisma.user.create({
      data: {
        email,
        name: name || null,
        password: hashedPassword,
        role: "admin",
      },
    });

    // TODO: Send email with temporary password
    console.log(`New admin created: ${email} with temp password: ${tempPassword}`);

    return NextResponse.json({
      id: newAdmin.id,
      email: newAdmin.email,
      name: newAdmin.name,
      role: newAdmin.role,
    });
  } catch (error) {
    console.error("Add admin error:", error);
    return NextResponse.json(
      { error: "Failed to add admin" },
      { status: 500 }
    );
  }
}
