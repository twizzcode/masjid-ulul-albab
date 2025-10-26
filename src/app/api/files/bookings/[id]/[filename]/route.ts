import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { r2Client, R2_BUCKET_NAME } from "@/lib/r2";

/**
 * Proxy endpoint untuk serve PDF dari R2
 * Mengatasi masalah CORS dan "file berbahaya"
 * 
 * Usage: /api/files/bookings/[id]/[filename]
 */
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; filename: string }> }
) {
	try {
		// Get session untuk security
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: bookingId, filename } = await params;

		// Verify booking exists dan user has access
		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			select: {
				id: true,
				userId: true,
				letterUrl: true,
			},
		});

		if (!booking) {
			return NextResponse.json({ error: "Booking not found" }, { status: 404 });
		}

		// Check access: user is owner OR user is admin
		const isOwner = booking.userId === session.user.id;
		
		// Check if user is admin
		const user = await prisma.user.findUnique({
			where: { id: session.user.id },
			select: { role: true },
		});
		const isAdmin = user?.role === "ADMIN";

		if (!isOwner && !isAdmin) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Construct R2 key
		const key = `bookings/${bookingId}/${filename}`;

		// Get file from R2
		const command = new GetObjectCommand({
			Bucket: R2_BUCKET_NAME,
			Key: key,
		});

		const response = await r2Client.send(command);

		if (!response.Body) {
			return NextResponse.json({ error: "File not found" }, { status: 404 });
		}

		// Convert stream to buffer
		const chunks: Uint8Array[] = [];
		for await (const chunk of response.Body as any) {
			chunks.push(chunk);
		}
		const buffer = Buffer.concat(chunks);

		// Return file with proper headers
		return new NextResponse(buffer, {
			headers: {
				"Content-Type": "application/pdf",
				"Content-Disposition": "inline", // View in browser, not download
				"Cache-Control": "public, max-age=31536000", // Cache 1 year
				"Content-Length": buffer.length.toString(),
				// Security headers
				"X-Content-Type-Options": "nosniff",
				"X-Frame-Options": "SAMEORIGIN",
			},
		});
	} catch (error) {
		console.error("Get file error:", error);
		return NextResponse.json(
			{ error: "Failed to get file" },
			{ status: 500 }
		);
	}
}
