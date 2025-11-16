import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { getAdminWhatsAppUrl } from "@/lib/whatsapp-helpers";
import {
  sanitizeString,
  sanitizePhoneNumber,
  validateDateRange,
  validateFile,
  bookingCreateSchema,
} from "@/lib/validation";

export async function POST(req: NextRequest) {
	try {
		// Get session from auth
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized. Please login first." },
				{ status: 401 }
			);
		}

		// Parse multipart form data
		const formData = await req.formData();

		const rawContactName = formData.get("contactName") as string;
		const rawContactPhone = formData.get("contactPhone") as string;
		const rawOrganizerName = formData.get("organizerName") as string;
		const rawEventName = formData.get("eventName") as string;
		const rawLocation = formData.get("location") as string;
		const rawStartDate = formData.get("startDate") as string;
		const rawEndDate = formData.get("endDate") as string;
		const letterFile = formData.get("letterFile") as File | null;

		// Validasi required fields
		if (
			!rawContactName ||
			!rawContactPhone ||
			!rawOrganizerName ||
			!rawEventName ||
			!rawLocation ||
			!rawStartDate ||
			!rawEndDate ||
			!letterFile
		) {
			return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
		}

		// Sanitize text inputs to prevent XSS
		const contactName = sanitizeString(rawContactName);
		const organizerName = sanitizeString(rawOrganizerName);
		const eventName = sanitizeString(rawEventName);
		const location = sanitizeString(rawLocation);

		// Validate phone number
		const phoneValidation = sanitizePhoneNumber(rawContactPhone);
		if (!phoneValidation.isValid) {
			return NextResponse.json(
				{ error: phoneValidation.error },
				{ status: 400 }
			);
		}
		const contactPhone = phoneValidation.sanitized;

		// Validate using Zod schema
		const validation = bookingCreateSchema.safeParse({
			contactName,
			contactPhone,
			organizerName,
			eventName,
			location,
			startDate: rawStartDate,
			endDate: rawEndDate,
		});

		if (!validation.success) {
			const errors = validation.error.errors.map((err) => err.message).join(", ");
			return NextResponse.json({ error: errors }, { status: 400 });
		}

		// Validate file
		const fileValidation = validateFile(letterFile, {
			maxSize: 2 * 1024 * 1024, // 2MB
			allowedTypes: ["application/pdf"],
		});

		if (!fileValidation.isValid) {
			return NextResponse.json({ error: fileValidation.error }, { status: 400 });
		}

		// Validate date range
		const dateValidation = validateDateRange(rawStartDate, rawEndDate);
		if (!dateValidation.isValid) {
			return NextResponse.json({ error: dateValidation.error }, { status: 400 });
		}

		const start = dateValidation.start!;
		const end = dateValidation.end!;

		// Cek konflik jadwal
		const conflictingBooking = await prisma.booking.findFirst({
			where: {
				location,
				status: {
					in: ["pending", "approved"],
				},
				OR: [
					{
						AND: [{ startDate: { lte: start } }, { endDate: { gte: start } }],
					},
					{
						AND: [{ startDate: { lte: end } }, { endDate: { gte: end } }],
					},
					{
						AND: [{ startDate: { gte: start } }, { endDate: { lte: end } }],
					},
				],
			},
		});

		if (conflictingBooking) {
			return NextResponse.json(
				{
					error: "Schedule conflict. The selected time slot is already booked.",
					conflictingBooking: {
						eventName: conflictingBooking.eventName,
						startDate: conflictingBooking.startDate,
						endDate: conflictingBooking.endDate,
					},
				},
				{ status: 409 }
			);
		}

		// Create booking FIRST to get the ID
		const booking = await prisma.booking.create({
			data: {
				contactName,
				contactPhone,
				organizerName,
				eventName,
				location,
				startDate: start,
				endDate: end,
				letterUrl: "", // Temporary, will update after upload
				letterFileName: letterFile.name,
				userId: session.user.id,
				status: "pending",
			},
		});

		// Upload file to R2 with booking ID as folder
		try {
			const fileExtension = letterFile.name.split(".").pop();
			const uniqueId = nanoid(10);
			const timestamp = Date.now();
			// Structure: bookings/{bookingId}/letter-{timestamp}-{random}.pdf
			const fileName = `bookings/${booking.id}/letter-${timestamp}-${uniqueId}.${fileExtension}`;

			const arrayBuffer = await letterFile.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			const uploadCommand = new PutObjectCommand({
				Bucket: R2_BUCKET_NAME,
				Key: fileName,
				Body: buffer,
				ContentType: "application/pdf",
				ContentDisposition: "inline", // Allow inline viewing instead of forcing download
				CacheControl: "public, max-age=31536000", // Cache for 1 year
				Metadata: {
					bookingId: booking.id,
					originalName: letterFile.name,
					uploadedBy: session.user.id,
					uploadedAt: new Date().toISOString(),
				},
			});

			await r2Client.send(uploadCommand);

			const letterUrl = `${R2_PUBLIC_URL}/${fileName}`;

			// Update booking with letterUrl
			const updatedBooking = await prisma.booking.update({
				where: { id: booking.id },
				data: { letterUrl },
			});

			// Get first admin for WhatsApp notification
			const admin = await prisma.user.findFirst({
				where: { role: "ADMIN" },
				select: { id: true },
			});

			// Generate WhatsApp notification link (optional - untuk development)
			let whatsappUrl: string | undefined;
			if (admin && process.env.ADMIN_WHATSAPP_NUMBER) {
				whatsappUrl = getAdminWhatsAppUrl(process.env.ADMIN_WHATSAPP_NUMBER, {
					bookingId: booking.id,
					eventName,
					organizerName,
					contactName,
					contactPhone,
					location,
					startDate: start,
					endDate: end,
					letterUrl,
					adminId: admin.id,
				});
			}

			return NextResponse.json(
				{
					success: true,
					message: "Booking created successfully",
					booking: {
						id: updatedBooking.id,
						eventName: updatedBooking.eventName,
						status: updatedBooking.status,
						createdAt: updatedBooking.createdAt,
					},
					// Optional: return WhatsApp URL untuk testing
					...(whatsappUrl && { whatsappNotificationUrl: whatsappUrl }),
				},
				{ status: 201 }
			);
		} catch (uploadError) {
			console.error("File upload error:", uploadError);
			
			// Delete the booking if upload fails
			await prisma.booking.delete({
				where: { id: booking.id },
			});

			return NextResponse.json(
				{ error: "Gagal mengupload file. Silakan coba lagi." },
				{ status: 500 }
			);
		}
	} catch (error) {
		console.error("Create booking error:", error);
		return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
	}
}

// GET - Ambil semua booking user
export async function GET(req: NextRequest) {
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

    // Get type parameter from URL
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type"); // 'ongoing' or 'past'

    const now = new Date();
    
    const whereCondition: Record<string, unknown> = {
      userId: session.user.id,
    };

    // Filter berdasarkan type
    if (type === "ongoing") {
      // Berlangsung: endDate >= now (belum selesai)
      whereCondition.endDate = { gte: now };
    } else if (type === "past") {
      // Selesai: endDate < now (sudah selesai)
      whereCondition.endDate = { lt: now };
    }

    const bookings = await prisma.booking.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({ bookings }, { status: 200 });
  } catch (error) {
    console.error("Get bookings error:", error);
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
