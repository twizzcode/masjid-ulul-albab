import { TZDate } from "@date-fns/tz"
import {
  and,
  count,
  desc,
  eq,
  gte,
  ilike,
  lt,
  sql,
  type SQL,
} from "drizzle-orm"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { cache } from "react"

import {
  ROOM_NAMES,
  type BookingStatus as DbBookingStatus,
} from "@/lib/bookings"
import { db } from "@/lib/db"
import { booking } from "@/lib/db/schema"
import { r2PublicUrl } from "@/lib/r2"

export type BookingStatus = "Menunggu" | "Disetujui" | "Ditolak"

export type Booking = {
  id: string
  activity: string
  requester: string | null
  contactName: string
  whatsapp: string | null
  venue: string
  schedule: string
  endAt: string
  submittedAt: string
  status: BookingStatus
  letterName: string | null
  letterSize: string | null
  letterUploadedAt: string | null
  letterUrl: string | null
}

export type AdminBookingView = "active" | "archive"

export type AdminBookingPage = {
  bookings: Booking[]
  total: number
  activeCount: number
  archiveCount: number
  pendingCount: number
  archiveMonths: string[]
}

const STATUS_LABELS: Record<DbBookingStatus, BookingStatus> = {
  PENDING: "Menunggu",
  APPROVED: "Disetujui",
  REJECTED: "Ditolak",
}

const inJakarta = (date: Date) => new TZDate(date, "Asia/Jakarta")

function formatSchedule(startAt: Date, endAt: Date) {
  const start = inJakarta(startAt)
  const end = inJakarta(endAt)
  const startText = format(start, "d MMMM yyyy, HH.mm", { locale: localeId })
  const endText =
    format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")
      ? format(end, "HH.mm", { locale: localeId })
      : format(end, "d MMMM yyyy, HH.mm", { locale: localeId })
  return `${startText}–${endText}`
}

function formatBytes(bytes: number) {
  return bytes < 1024 * 1024
    ? `${Math.ceil(bytes / 1024)} KB`
    : `${(bytes / (1024 * 1024)).toLocaleString("id-ID", { maximumFractionDigits: 1 })} MB`
}

function mapBooking(record: typeof booking.$inferSelect): Booking {
  return {
    id: record.id,
    activity: record.eventName,
    requester: record.organizer,
    contactName: record.contactName,
    whatsapp: record.whatsapp,
    venue: ROOM_NAMES[record.room as keyof typeof ROOM_NAMES],
    schedule: formatSchedule(record.startAt, record.endAt),
    endAt: record.endAt.toISOString(),
    submittedAt: format(inJakarta(record.createdAt), "d MMMM yyyy, HH.mm", {
      locale: localeId,
    }),
    status: STATUS_LABELS[record.status as DbBookingStatus],
    letterName: record.letterName,
    // Impor data lama tidak menyertakan ukuran file; 1 adalah penanda "tidak diketahui".
    letterSize:
      record.letterSize && record.letterSize > 1
        ? formatBytes(record.letterSize)
        : null,
    letterUploadedAt: record.letterKey
      ? format(inJakarta(record.createdAt), "d MMMM yyyy, HH.mm", {
          locale: localeId,
        })
      : null,
    letterUrl: record.letterKey ? r2PublicUrl(record.letterKey) : null,
  }
}

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`)
}

function jakartaMonthRange(month: string) {
  const [year, monthNumber] = month.split("-").map(Number)
  return {
    start: new Date(
      new TZDate(year, monthNumber - 1, 1, 0, 0, 0, "Asia/Jakarta").getTime()
    ),
    end: new Date(
      new TZDate(year, monthNumber, 1, 0, 0, 0, "Asia/Jakarta").getTime()
    ),
  }
}

export async function listAdminBookings({
  view = "active",
  month,
  search = "",
}: {
  view?: AdminBookingView
  month?: string
  search?: string
} = {}): Promise<AdminBookingPage> {
  const now = new Date()
  const conditions: SQL[] = [
    view === "archive" ? lt(booking.endAt, now) : gte(booking.endAt, now),
  ]

  if (view === "archive" && month && /^\d{4}-\d{2}$/.test(month)) {
    const range = jakartaMonthRange(month)
    conditions.push(
      gte(booking.endAt, range.start),
      lt(booking.endAt, range.end)
    )
  }
  if (search) conditions.push(ilike(booking.id, `%${escapeLike(search)}%`))

  const where = and(...conditions)
  const monthKey = sql<string>`to_char(${booking.endAt} AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM')`
  const [records, [filtered], [counts], monthRows] = await Promise.all([
    db
      .select()
      .from(booking)
      .where(where)
      .orderBy(
        ...(view === "active"
          ? [sql`case when ${booking.status} = 'PENDING' then 0 else 1 end`]
          : []),
        desc(booking.createdAt),
        desc(booking.id)
      ),
    db.select({ value: count() }).from(booking).where(where),
    db
      .select({
        active: sql<number>`count(*) filter (where ${booking.endAt} >= ${now})::int`,
        archive: sql<number>`count(*) filter (where ${booking.endAt} < ${now})::int`,
        pending: sql<number>`count(*) filter (where ${booking.status} = 'PENDING' and ${booking.endAt} >= ${now})::int`,
      })
      .from(booking),
    db
      .select({ month: monthKey })
      .from(booking)
      .where(lt(booking.endAt, now))
      .groupBy(monthKey)
      .orderBy(desc(monthKey)),
  ])

  return {
    bookings: records.map(mapBooking),
    total: Number(filtered?.value ?? 0),
    activeCount: Number(counts?.active ?? 0),
    archiveCount: Number(counts?.archive ?? 0),
    pendingCount: Number(counts?.pending ?? 0),
    archiveMonths: monthRows.map(({ month: value }) => value),
  }
}

export const getAdminBooking = cache(async (id: string) => {
  const [record] = await db
    .select()
    .from(booking)
    .where(eq(booking.id, id))
    .limit(1)
  return record ? mapBooking(record) : undefined
})

export async function countPendingBookings() {
  const now = new Date()
  const [result] = await db
    .select({ value: count() })
    .from(booking)
    .where(and(eq(booking.status, "PENDING"), gte(booking.endAt, now)))
  return Number(result?.value ?? 0)
}
