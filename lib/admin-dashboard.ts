import { TZDate } from "@date-fns/tz"
import {
  addDays,
  addMonths,
  format,
  startOfDay,
  startOfMonth,
  subMonths,
} from "date-fns"
import { id as localeId } from "date-fns/locale"
import { and, count, desc, eq, gte, inArray, lt, sql } from "drizzle-orm"

import {
  ROOM_NAMES,
  type BookingRoom,
  type BookingStatus,
} from "@/lib/bookings"
import { db } from "@/lib/db"
import { aspiration, booking, user } from "@/lib/db/schema"

export type DashboardBooking = {
  id: string
  activity: string
  requester: string | null
  venue: string
  schedule: string
  status: BookingStatus
}

export type DashboardMonth = {
  key: string
  label: string
  approved: number
  pending: number
}

export type DashboardData = {
  dateLabel: string
  pendingBookings: number
  monthBookings: number
  monthApproved: number
  todayBookings: number
  totalUsers: number
  newUsers: number
  totalAspirations: number
  months: DashboardMonth[]
  recentBookings: DashboardBooking[]
}

const inJakarta = (date: Date) => new TZDate(date, "Asia/Jakarta")

function formatSchedule(startAt: Date, endAt: Date) {
  const start = inJakarta(startAt)
  const end = inJakarta(endAt)
  const sameDay = format(start, "yyyy-MM-dd") === format(end, "yyyy-MM-dd")
  const date = format(start, "d MMM yyyy", { locale: localeId })

  return `${date}, ${format(start, "HH.mm")}–${sameDay ? "" : `${format(end, "d MMM yyyy", { locale: localeId })}, `}${format(end, "HH.mm")}`
}

export async function getAdminDashboard(): Promise<DashboardData> {
  const now = inJakarta(new Date())
  const monthStart = startOfMonth(now)
  const nextMonth = addMonths(monthStart, 1)
  const dayStart = startOfDay(now)
  const nextDay = addDays(dayStart, 1)
  const chartStart = startOfMonth(subMonths(now, 5))

  const [
    [pending],
    [monthCounts],
    [todayCount],
    [totalUsers],
    [newUsers],
    [totalAspirations],
    chartRecords,
    recentRecords,
  ] = await Promise.all([
    db
      .select({ value: count() })
      .from(booking)
      .where(and(eq(booking.status, "PENDING"), gte(booking.endAt, now))),
    db
      .select({
        total: count(),
        approved: sql<number>`count(*) filter (where ${booking.status} = 'APPROVED')::int`,
      })
      .from(booking)
      .where(
        and(gte(booking.startAt, monthStart), lt(booking.startAt, nextMonth))
      ),
    db
      .select({ value: count() })
      .from(booking)
      .where(
        and(
          gte(booking.startAt, dayStart),
          lt(booking.startAt, nextDay),
          inArray(booking.status, ["PENDING", "APPROVED"])
        )
      ),
    db.select({ value: count() }).from(user),
    db
      .select({ value: count() })
      .from(user)
      .where(gte(user.createdAt, monthStart)),
    db.select({ value: count() }).from(aspiration),
    db
      .select({
        month: sql<string>`to_char(${booking.startAt} AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM')`,
        approved: sql<number>`count(*) filter (where ${booking.status} = 'APPROVED')::int`,
        pending: sql<number>`count(*) filter (where ${booking.status} = 'PENDING')::int`,
      })
      .from(booking)
      .where(
        and(gte(booking.startAt, chartStart), lt(booking.startAt, nextMonth))
      )
      .groupBy(
        sql`to_char(${booking.startAt} AT TIME ZONE 'Asia/Jakarta', 'YYYY-MM')`
      ),
    db
      .select({
        id: booking.id,
        eventName: booking.eventName,
        organizer: booking.organizer,
        room: booking.room,
        startAt: booking.startAt,
        endAt: booking.endAt,
        status: booking.status,
      })
      .from(booking)
      .orderBy(desc(booking.createdAt))
      .limit(5),
  ])

  const months: DashboardMonth[] = Array.from({ length: 6 }, (_, index) => {
    const month = addMonths(chartStart, index)
    const key = format(month, "yyyy-MM")
    const record = chartRecords.find((item) => item.month === key)
    return {
      key,
      label: format(month, "MMM", { locale: localeId }),
      approved: Number(record?.approved ?? 0),
      pending: Number(record?.pending ?? 0),
    }
  })

  return {
    dateLabel: format(now, "EEEE, d MMMM yyyy", { locale: localeId }),
    pendingBookings: Number(pending?.value ?? 0),
    monthBookings: Number(monthCounts?.total ?? 0),
    monthApproved: Number(monthCounts?.approved ?? 0),
    todayBookings: Number(todayCount?.value ?? 0),
    totalUsers: Number(totalUsers?.value ?? 0),
    newUsers: Number(newUsers?.value ?? 0),
    totalAspirations: Number(totalAspirations?.value ?? 0),
    months,
    recentBookings: recentRecords.map((record) => ({
      id: record.id,
      activity: record.eventName,
      requester: record.organizer,
      venue: ROOM_NAMES[record.room as BookingRoom] ?? record.room,
      schedule: formatSchedule(record.startAt, record.endAt),
      status: record.status as BookingStatus,
    })),
  }
}
