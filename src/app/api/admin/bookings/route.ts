import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

// GET all bookings (admin only - includes all statuses)
export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type"); // 'ongoing' or 'archived'

    const now = new Date();
    
    const whereCondition: Record<string, unknown> = status ? { status } : {};

    // Filter berdasarkan type
    if (type === "ongoing") {
      // Berlaku/Ongoing: endDate >= now (belum selesai)
      whereCondition.endDate = { gte: now };
    } else if (type === "archived") {
      // Arsip: endDate < now (sudah selesai)
      whereCondition.endDate = { lt: now };
    }

    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ bookings });
  } catch (error) {
    console.error("Fetch admin bookings error:", error);
    
    if (error instanceof Error && (error.message === "Unauthorized" || error.message.includes("Forbidden"))) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
