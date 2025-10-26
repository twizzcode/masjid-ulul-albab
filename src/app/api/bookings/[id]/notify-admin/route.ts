import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

// Admin WhatsApp number - should be in env variables
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP_NUMBER || "6281234567890";

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		// Get current session
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		const { id: bookingId } = await params;

		// Fetch booking details
		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
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
			return NextResponse.json({ error: "Booking not found" }, { status: 404 });
		}

		// Verify that the booking belongs to the current user
		if (booking.userId !== session.user.id) {
			return NextResponse.json({ error: "Forbidden" }, { status: 403 });
		}

		// Only allow notification for pending bookings
		if (booking.status !== "pending") {
			return NextResponse.json(
				{ error: "Can only send notification for pending bookings" },
				{ status: 400 }
			);
		}

		// Get location name
		const locationNames: Record<string, string> = {
			masjid: "Masjid",
			"gedung-serbaguna": "Gedung Serbaguna",
			"ruang-rapat": "Ruang Rapat",
		};
		const locationName = locationNames[booking.location] || booking.location;

		// Format dates
		const startDate = format(
			new Date(booking.startDate),
			"EEEE, dd MMMM yyyy",
			{ locale: idLocale }
		);
		const startTime = format(new Date(booking.startDate), "HH:mm", {
			locale: idLocale,
		});
		const endTime = format(new Date(booking.endDate), "HH:mm", {
			locale: idLocale,
		});

		// Generate dashboard link with booking ID filter
		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
		const dashboardLink = `${baseUrl}/admin/peminjaman?bookingId=${bookingId}`;

		// Create WhatsApp message
		const message = `Assalamualaikum Admin,

Saya mengajukan peminjaman fasilitas Masjid Ulul Albab dengan detail sebagai berikut:

📋 *Detail Peminjaman*
• Nama Kegiatan: ${booking.eventName}
• Penyelenggara: ${booking.organizerName}
• Lokasi: ${locationName}
• Tanggal: ${startDate}
• Waktu: ${startTime} - ${endTime} WIB

👤 *Narahubung*
• Nama: ${booking.contactName}
• No. HP: ${booking.contactPhone}

📎 *Surat Peminjaman*
Sudah dilampirkan dalam sistem

Mohon untuk dapat diproses lebih lanjut. Untuk melihat detail lengkap dan melakukan verifikasi, silakan klik link berikut:

🔗 ${dashboardLink}

Terima kasih atas perhatiannya.

Wassalamualaikum Wr. Wb.`;

		// Generate WhatsApp URL
		const whatsappUrl = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;

		return NextResponse.json({
			success: true,
			whatsappUrl,
		});
	} catch (error) {
		console.error("Notify admin error:", error);
		return NextResponse.json(
			{ error: "Failed to generate notification" },
			{ status: 500 }
		);
	}
}
