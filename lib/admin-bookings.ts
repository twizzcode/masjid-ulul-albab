import { TZDate } from "@date-fns/tz"
import { format } from "date-fns"
import { id as localeId } from "date-fns/locale"

export function isBookingArchived(endAt: string, now: number) {
  return new Date(endAt).getTime() < now
}

export function matchesBookingId(id: string, search: string) {
  return id.toLowerCase().includes(search.trim().toLowerCase())
}

/** Month key of a booking's schedule in Jakarta time, e.g. "2026-11". */
export function getBookingMonth(endAt: string) {
  return format(new TZDate(new Date(endAt), "Asia/Jakarta"), "yyyy-MM")
}

export function formatBookingMonth(month: string) {
  return format(new Date(`${month}-01T00:00:00`), "MMMM yyyy", {
    locale: localeId,
  })
}
