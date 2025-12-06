import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";

export async function POST(request: NextRequest) {
  try {
    await requireAuth();

    const body = await request.json();
    const { location, startDate, endDate, excludeBookingId } = body;

    if (!location || !startDate || !endDate) {
      return NextResponse.json(
        { error: "Location, startDate, and endDate are required" },
        { status: 400 }
      );
    }

    const requestStart = new Date(startDate);
    const requestEnd = new Date(endDate);

    // Find conflicting bookings:
    // 1. Same location
    // 2. Status is approved or pending (not rejected)
    // 3. Time range overlaps
    // 4. Not the booking being edited (if excludeBookingId is provided)
    const conflictingBooking = await prisma.booking.findFirst({
      where: {
        location: location,
        status: {
          in: ["approved", "pending"],
        },
        ...(excludeBookingId && {
          id: {
            not: excludeBookingId,
          },
        }),
        OR: [
          // Case 1: Existing booking starts during requested time
          {
            startDate: {
              gte: requestStart,
              lt: requestEnd,
            },
          },
          // Case 2: Existing booking ends during requested time
          {
            endDate: {
              gt: requestStart,
              lte: requestEnd,
            },
          },
          // Case 3: Existing booking completely covers requested time
          {
            AND: [
              {
                startDate: {
                  lte: requestStart,
                },
              },
              {
                endDate: {
                  gte: requestEnd,
                },
              },
            ],
          },
        ],
      },
      select: {
        id: true,
        eventName: true,
        organizerName: true,
        startDate: true,
        endDate: true,
        status: true,
      },
    });

    if (conflictingBooking) {
      return NextResponse.json({
        available: false,
        isAvailable: false,
        message: `${location === "aula-lantai-1" ? "Aula Lantai 1" : "Aula Lantai 2"} sudah dibooking untuk waktu tersebut`,
        conflictingBooking: {
          eventName: conflictingBooking.eventName,
          organizerName: conflictingBooking.organizerName,
          startDate: conflictingBooking.startDate,
          endDate: conflictingBooking.endDate,
          status: conflictingBooking.status,
        },
      });
    }

    return NextResponse.json({
      available: true,
      isAvailable: true,
      message: "Jadwal tersedia",
    });
  } catch (error) {
    console.error("Check availability error:", error);

    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 }
    );
  }
}
