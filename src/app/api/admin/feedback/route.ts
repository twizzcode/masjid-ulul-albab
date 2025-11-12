import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get("filter") || "all"; // all, read, unread
    const month = searchParams.get("month"); // Format: YYYY-MM

    const whereClause: Record<string, unknown> = {};

    // Filter by read status
    if (filter === "read") {
      whereClause.isRead = true;
    } else if (filter === "unread") {
      whereClause.isRead = false;
    }

    // Filter by month
    if (month && month !== "all") {
      const [year, monthNum] = month.split("-").map(Number);
      const startDate = new Date(year, monthNum - 1, 1); // First day of month
      const endDate = new Date(year, monthNum, 0, 23, 59, 59, 999); // Last day of month
      
      whereClause.createdAt = {
        gte: startDate,
        lte: endDate,
      };
    }

    const feedbacks = await prisma.feedback.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: [
        { isRead: 'asc' }, // Unread first
        { createdAt: 'desc' }, // Newest first
      ],
    });

    return NextResponse.json({
      feedbacks,
      total: feedbacks.length,
    });
  } catch (error) {
    console.error("Fetch feedbacks error:", error);
    
    if (error instanceof Error && (error.message === "Unauthorized" || error.message.includes("Forbidden"))) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch feedbacks" },
      { status: 500 }
    );
  }
}
