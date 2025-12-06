import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized. Please login first." },
				{ status: 401 }
			);
		}

		const { id } = await params;

		const booking = await prisma.booking.findUnique({
			where: { id },
			include: {
				user: {
					select: {
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

		// Verify ownership (user can only view their own bookings)
		if (booking.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Forbidden. You can only view your own bookings." },
				{ status: 403 }
			);
		}

		return NextResponse.json({ booking }, { status: 200 });
	} catch (error) {
		console.error("Get booking detail error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch booking" },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized. Please login first." },
				{ status: 401 }
			);
		}

		const { id } = await params;

		const booking = await prisma.booking.findUnique({
			where: { id },
		});

		if (!booking) {
			return NextResponse.json(
				{ error: "Booking not found" },
				{ status: 404 }
			);
		}

		// Verify ownership
		if (booking.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Forbidden. You can only delete your own bookings." },
				{ status: 403 }
			);
		}

		// Only allow deleting pending bookings
		if (booking.status !== "pending") {
			return NextResponse.json(
				{ error: "Cannot delete booking that is already approved or rejected." },
				{ status: 400 }
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
			} catch (error) {
				console.error("Error deleting file from R2:", error);
				// Continue with booking deletion even if file deletion fails
			}
		}

		// Delete the booking
		await prisma.booking.delete({
			where: { id },
		});

		return NextResponse.json(
			{ message: "Booking deleted successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Delete booking error:", error);
		return NextResponse.json(
			{ error: "Failed to delete booking" },
			{ status: 500 }
		);
	}
}

export async function PATCH(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized. Please login first." },
				{ status: 401 }
			);
		}

		const { id } = await params;
		const body = await req.json();

		const booking = await prisma.booking.findUnique({
			where: { id },
		});

		if (!booking) {
			return NextResponse.json(
				{ error: "Booking not found" },
				{ status: 404 }
			);
		}

		// Verify ownership
		if (booking.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Forbidden. You can only edit your own bookings." },
				{ status: 403 }
			);
		}

		// Only allow editing pending bookings
		if (booking.status !== "pending") {
			return NextResponse.json(
				{ error: "Cannot edit booking that is already approved or rejected." },
				{ status: 400 }
			);
		}

		// Update the booking
		const updatedBooking = await prisma.booking.update({
			where: { id },
			data: {
				contactName: body.contactName,
				contactPhone: body.contactPhone,
				organizerName: body.organizerName,
				eventName: body.eventName,
				location: body.location,
				startDate: new Date(body.startDate),
				endDate: new Date(body.endDate),
				// If new letter file is uploaded, it will be updated via separate upload endpoint
			},
		});

		return NextResponse.json(
			{ booking: updatedBooking, message: "Booking updated successfully" },
			{ status: 200 }
		);
	} catch (error) {
		console.error("Update booking error:", error);
		return NextResponse.json(
			{ error: "Failed to update booking" },
			{ status: 500 }
		);
	}
}
