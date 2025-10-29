import { format } from "date-fns";
import { id } from "date-fns/locale";

interface BookingNotificationData {
	bookingId: string;
	eventName: string;
	organizerName: string;
	contactName: string;
	contactPhone: string;
	location: string;
	startDate: Date;
	endDate: Date;
	letterUrl: string;
	adminId: string;
}

/**
 * Generate simple verification token
 * Format: base64(adminId:timestamp:bookingId)
 */
export function generateVerificationToken(adminId: string, bookingId: string): string {
	const timestamp = Date.now();
	const payload = `${adminId}:${timestamp}:${bookingId}`;
	return Buffer.from(payload).toString("base64");
}

/**
 * Generate WhatsApp approval/rejection links
 */
export function generateVerificationLinks(adminId: string, bookingId: string) {
	const token = generateVerificationToken(adminId, bookingId);
	const baseUrl = process.env.NEXT_PUBLIC_API_URL || "https://masjidululalbab.my.id";

	return {
		approveUrl: `${baseUrl}/api/admin/bookings/verify/${bookingId}?action=approve&token=${token}`,
		rejectUrl: `${baseUrl}/api/admin/bookings/verify/${bookingId}?action=reject&token=${token}`,
	};
}

/**
 * Generate WhatsApp message for admin notification
 */
export function generateAdminWhatsAppMessage(data: BookingNotificationData): string {
	const { approveUrl, rejectUrl } = generateVerificationLinks(data.adminId, data.bookingId);

	const locationName = data.location === "aula-lantai-1" ? "Aula Lantai 1" : "Aula Lantai 2";

	const message = `
🔔 *PENGAJUAN PEMINJAMAN TEMPAT BARU*

📋 *Detail Peminjaman:*
• Nama Kegiatan: ${data.eventName}
• Penyelenggara: ${data.organizerName}
• Lokasi: ${locationName}

👤 *Narahubung:*
• Nama: ${data.contactName}
• Kontak: ${data.contactPhone}

📅 *Jadwal:*
• Mulai: ${format(data.startDate, "EEEE, dd MMMM yyyy - HH:mm", { locale: id })} WIB
• Selesai: ${format(data.endDate, "EEEE, dd MMMM yyyy - HH:mm", { locale: id })} WIB

📄 *Surat Peminjaman:*
${data.letterUrl}

━━━━━━━━━━━━━━━━━
⚡ *VERIFIKASI CEPAT:*

✅ Setujui:
${approveUrl}

❌ Tolak:
${rejectUrl}

_Klik link di atas untuk verifikasi langsung_
	`.trim();

	return encodeURIComponent(message);
}

/**
 * Generate full WhatsApp URL to send message to admin
 */
export function getAdminWhatsAppUrl(
	adminPhone: string,
	data: BookingNotificationData
): string {
	const message = generateAdminWhatsAppMessage(data);
	// Format phone: 62xxx (without +)
	const formattedPhone = adminPhone.replace(/\D/g, "").replace(/^0/, "62");
	return `https://wa.me/${formattedPhone}?text=${message}`;
}

/**
 * Generate WhatsApp message for user notification (after approval/rejection)
 */
export function generateUserNotificationMessage(
	eventName: string,
	status: "approved" | "rejected",
	rejectionReason?: string
): string {
	if (status === "approved") {
		return encodeURIComponent(`
✅ *Peminjaman Disetujui*

Halo! Peminjaman tempat untuk kegiatan *${eventName}* telah disetujui.

Silakan persiapkan kegiatan Anda dengan baik. Jika ada pertanyaan, hubungi admin.

Terima kasih! 🙏
		`.trim());
	}

	return encodeURIComponent(`
❌ *Peminjaman Ditolak*

Mohon maaf, peminjaman tempat untuk kegiatan *${eventName}* ditolak.

${rejectionReason ? `Alasan: ${rejectionReason}` : ""}

Silakan ajukan kembali dengan waktu atau lokasi yang berbeda.

Terima kasih atas pengertiannya 🙏
	`.trim());
}
