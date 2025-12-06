import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import {
  validateId,
  bookingStatusUpdateSchema,
  sanitizeString,
} from "@/lib/validation";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2";

// GET single booking (admin only)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    // Validate ID format
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.error },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ booking }, { status: 200 });
  } catch (error) {
    console.error("Get booking detail error:", error);
    
    if (error instanceof Error && (error.message === "Unauthorized" || error.message.includes("Forbidden"))) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to fetch booking" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require admin access
    const { session } = await requireAdmin();
    
    const resolvedParams = await params;
    const bookingId = resolvedParams.id;

    // Validate ID format
    const idValidation = validateId(bookingId);
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.error },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status: rawStatus, rejectionReason: rawRejectionReason } = body;

    // Sanitize inputs
    const status = rawStatus ? sanitizeString(rawStatus) : null;
    const rejectionReason = rawRejectionReason ? sanitizeString(rawRejectionReason) : undefined;

    // Validate using Zod schema
    const validation = bookingStatusUpdateSchema.safeParse({
      status,
      ...(rejectionReason && { rejectionReason }),
    });

    if (!validation.success) {
      const errors = validation.error.errors.map((err) => err.message).join(", ");
      return NextResponse.json(
        { error: errors },
        { status: 400 }
      );
    }

    // Check if booking exists first
    const existingBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    });

    if (!existingBooking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Update booking status
    const booking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: validation.data.status,
        rejectionReason: validation.data.status === "rejected" ? validation.data.rejectionReason : null,
        approvedBy: validation.data.status === "approved" ? session.user.id : null,
        approvedAt: validation.data.status === "approved" ? new Date() : null,
      },
      include: {
        user: true,
      },
    });

    return NextResponse.json({
      success: true,
      booking,
    });
  } catch (error) {
    console.error("Update booking status error:", error);
    
    if (error instanceof Error && (error.message === "Unauthorized" || error.message.includes("Forbidden"))) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  }
}

// DELETE booking (admin only)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdmin();

    const { id } = await params;

    // Validate ID format
    const idValidation = validateId(id);
    if (!idValidation.isValid) {
      return NextResponse.json(
        { error: idValidation.error },
        { status: 400 }
      );
    }

    // Get booking first to access letterFileName
    const booking = await prisma.booking.findUnique({
      where: { id },
    });

    if (!booking) {
      return NextResponse.json(
        { error: "Booking not found" },
        { status: 404 }
      );
    }

    // Delete file from R2 if exists
    if (booking.letterFileName) {
      try {
        const deleteCommand = new DeleteObjectCommand({
          Bucket: R2_BUCKET_NAME,
          Key: `bookings/${booking.letterFileName}`,
        });
        await r2Client.send(deleteCommand);
        console.log(`Deleted file from R2: bookings/${booking.letterFileName}`);
      } catch (error) {
        console.error("Error deleting file from R2:", error);
        // Continue with booking deletion even if file deletion fails
      }
    }

    // Delete the booking from database
    await prisma.booking.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Booking deleted successfully",
    });
  } catch (error) {
    console.error("Delete booking error:", error);
    
    if (error instanceof Error && (error.message === "Unauthorized" || error.message.includes("Forbidden"))) {
      return NextResponse.json(
        { error: error.message },
        { status: 403 }
      );
    }

    return NextResponse.json(
      { error: "Failed to delete booking" },
      { status: 500 }
    );
  }
}
