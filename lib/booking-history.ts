import { TZDate } from "@date-fns/tz"
import { count, desc, eq } from "drizzle-orm"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

import {
  ROOM_NAMES,
  type BookingRoom,
  type BookingStatus,
} from "@/lib/bookings"
import { db } from "@/lib/db"
import { booking } from "@/lib/db/schema"
import { r2PublicUrl } from "@/lib/r2"

export type BookingHistoryItem = {
  id: string
  eventName: string
  organizer: string | null
  contactName: string
  whatsapp: string | null
  room: string
  startAt: string
  endAt: string
  submittedAt: string
  status: BookingStatus
  letterName: string | null
  letterUrl: string | null
  confirmationUrl: string | null
}

const formatDateTime = (date: Date) =>
  format(new TZDate(date, "Asia/Jakarta"), "EEEE, d MMMM yyyy · HH.mm 'WIB'", {
    locale: localeId,
  })

const formatDate = (date: Date) =>
  format(new TZDate(date, "Asia/Jakarta"), "EEEE, d MMMM yyyy", {
    locale: localeId,
  })

const formatTime = (date: Date) =>
  format(new TZDate(date, "Asia/Jakarta"), "HH:mm")

function getConfirmationUrl(record: typeof booking.$inferSelect) {
  const adminNumber = process.env.ADMIN_WHATSAPP_NUMBER?.replace(/\D/g, "")
  if (!adminNumber) return null

  const siteUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000"
  const room = ROOM_NAMES[record.room as BookingRoom] ?? record.room
  const message = `Assalamualaikum Admin,

Saya mengajukan peminjaman fasilitas Masjid Ulul Albab dengan detail sebagai berikut:

*Detail Peminjaman*
• ID: ${record.id}
• Nama Kegiatan: ${record.eventName}
• Penyelenggara: ${record.organizer ?? "Tidak dicantumkan"}
• Lokasi: ${room}
• Tanggal: ${formatDate(record.startAt)}
• Waktu: ${formatTime(record.startAt)} - ${formatTime(record.endAt)} WIB

*Narahubung*
• Nama: ${record.contactName}
• No. HP: ${record.whatsapp ?? "Tidak dicantumkan"}

*Surat Peminjaman*
${record.letterKey ? "Sudah dilampirkan dalam sistem" : "Tanpa surat"}

Mohon untuk dapat diproses lebih lanjut. Detail lengkap dan verifikasi:

${new URL(`/admin/peminjaman/${encodeURIComponent(record.id)}`, siteUrl).toString()}

Terima kasih atas perhatiannya.

Wassalamualaikum Wr. Wb.`

  return `https://wa.me/${adminNumber}?text=${encodeURIComponent(message)}`
}

export async function listBookingHistory(
  userId: string,
  { page = 1, pageSize = 10 }: { page?: number; pageSize?: number } = {}
) {
  const where = eq(booking.userId, userId)
  const [records, [result]] = await Promise.all([
    db
      .select()
      .from(booking)
      .where(where)
      .orderBy(desc(booking.createdAt), desc(booking.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(booking).where(where),
  ])

  return {
    bookings: records.map<BookingHistoryItem>((record) => ({
      id: record.id,
      eventName: record.eventName,
      organizer: record.organizer,
      contactName: record.contactName,
      whatsapp: record.whatsapp,
      room: ROOM_NAMES[record.room as BookingRoom] ?? record.room,
      startAt: formatDateTime(record.startAt),
      endAt: formatDateTime(record.endAt),
      submittedAt: formatDateTime(record.createdAt),
      status: record.status as BookingStatus,
      letterName: record.letterName,
      letterUrl: record.letterKey ? r2PublicUrl(record.letterKey) : null,
      confirmationUrl: getConfirmationUrl(record),
    })),
    total: Number(result?.value ?? 0),
  }
}
