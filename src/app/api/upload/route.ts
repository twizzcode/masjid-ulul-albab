// src/app/api/upload/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME, R2_PUBLIC_URL } from "@/lib/r2";
import { requireAuth } from "@/lib/auth-helpers";
import { nanoid } from "nanoid";
import prisma from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // 1. Check authentication
    const session = await requireAuth();

    // 2. Get file from form data
    const formData = await request.formData();
    const file = formData.get("letterFile") as File;
    const bookingId = formData.get("bookingId") as string;

    if (!file) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // 3. Validate file type (PDF or images)
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Only PDF and image files (JPG, PNG) are allowed" },
        { status: 400 }
      );
    }

    // 4. Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size must be less than 5MB" },
        { status: 400 }
      );
    }

	// If bookingId is provided, this is an update - delete old file
	if (bookingId) {
		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
		});

		if (booking && booking.letterFileName) {
			try {
				const deleteCommand = new DeleteObjectCommand({
					Bucket: R2_BUCKET_NAME,
					Key: `bookings/${booking.letterFileName}`, // letterFileName already contains the path from bookings/
				});
				await r2Client.send(deleteCommand);
			} catch (error) {
				console.error("Error deleting old file from R2:", error);
			}
		}
	}

	// 5. Generate unique filename
	const fileExtension = file.name.split(".").pop();
	const uniqueId = nanoid(10);
	const timestamp = Date.now();
	// If bookingId provided, use folder structure
	const fileName = bookingId 
		? `${bookingId}/letter-${timestamp}-${uniqueId}.${fileExtension}`
		: `${timestamp}-${uniqueId}.${fileExtension}`;
	const fullKey = `bookings/${fileName}`;

	// 6. Convert file to buffer
	const arrayBuffer = await file.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);

	// 7. Upload to R2
	const uploadCommand = new PutObjectCommand({
		Bucket: R2_BUCKET_NAME,
		Key: fullKey,
		Body: buffer,
		ContentType: file.type,
		Metadata: {
			originalName: file.name,
			uploadedBy: session.user.id,
			uploadedAt: new Date().toISOString(),
			...(bookingId && { bookingId }),
		},
	});

	await r2Client.send(uploadCommand);

	// 8. Generate public URL
	const fileUrl = `${R2_PUBLIC_URL}/${fullKey}`;

	// 9. Update booking if bookingId is provided
	if (bookingId) {
		await prisma.booking.update({
			where: { id: bookingId },
			data: {
				letterUrl: fileUrl,
				letterFileName: fileName, // Save only the relative path from bookings/
			},
		});
	}    // 10. Return success response
    return NextResponse.json({
      success: true,
      file: {
        url: fileUrl,
        fileName: fileName,
        originalName: file.name,
        size: file.size,
        type: file.type,
      },
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 }
    );
  }
}