import { TZDate } from "@date-fns/tz"

import { BOOKING_ROOMS, BOOKING_STATUSES } from "@/lib/db/schema"

export type BookingRoom = (typeof BOOKING_ROOMS)[number]
export type BookingStatus = (typeof BOOKING_STATUSES)[number]
export const MAX_BOOKING_CALENDAR_RANGE_MS = 62 * 24 * 60 * 60 * 1000

export const ROOM_NAMES: Record<BookingRoom, string> = {
  "aula-lantai-1": "Aula Masjid Lantai 1",
  "ruang-solat-lantai-2": "Ruang Solat Lantai 2",
  "pelataran-masjid": "Pelataran Masjid",
  "lapangan-parkir": "Lapangan Parkir",
}

export function isBookingRoom(value: unknown): value is BookingRoom {
  return (
    typeof value === "string" && BOOKING_ROOMS.includes(value as BookingRoom)
  )
}

export function canUserModifyBooking(status: BookingStatus) {
  return status === "PENDING"
}

export function parseJakartaDateTime(date: unknown, time: unknown) {
  if (
    typeof date !== "string" ||
    typeof time !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
    !/^\d{2}:\d{2}$/.test(time)
  ) {
    return null
  }

  const [year, month, day] = date.split("-").map(Number)
  const [hour, minute] = time.split(":").map(Number)
  const value = new TZDate(year, month - 1, day, hour, minute, "Asia/Jakarta")

  return Number.isNaN(value.getTime()) ||
    value.getFullYear() !== year ||
    value.getMonth() !== month - 1 ||
    value.getDate() !== day ||
    value.getHours() !== hour ||
    value.getMinutes() !== minute
    ? null
    : new Date(value.getTime())
}

export function intervalsOverlap(
  firstStart: Date,
  firstEnd: Date,
  secondStart: Date,
  secondEnd: Date
) {
  return firstStart < secondEnd && firstEnd > secondStart
}

export function isBookingCalendarRange(start: Date, end: Date) {
  return (
    !Number.isNaN(start.getTime()) &&
    !Number.isNaN(end.getTime()) &&
    end > start &&
    end.getTime() - start.getTime() <= MAX_BOOKING_CALENDAR_RANGE_MS
  )
}

export function getPostgresErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== "object") return undefined
  if ("code" in error && typeof error.code === "string") return error.code
  return "cause" in error ? getPostgresErrorCode(error.cause) : undefined
}
