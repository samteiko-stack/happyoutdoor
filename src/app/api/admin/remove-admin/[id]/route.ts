import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Prevent removing yourself
    if (id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot remove yourself" },
        { status: 400 }
      );
    }

    // Check if user exists and is admin
    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.role !== "admin") {
      return NextResponse.json(
        { error: "User is not an admin" },
        { status: 400 }
      );
    }

    // Change role to user instead of deleting (safer)
    await prisma.user.update({
      where: { id },
      data: { role: "user" },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove admin error:", error);
    return NextResponse.json(
      { error: "Failed to remove admin" },
      { status: 500 }
    );
  }
}
