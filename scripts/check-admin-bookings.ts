import assert from "node:assert/strict"

import { isBookingArchived, matchesBookingId } from "../lib/admin-bookings"
import { ADMIN_BOOKINGS, getAdminBooking } from "../lib/admin-booking-data"

const now = new Date("2026-11-14T12:00:00+07:00").getTime()

assert.equal(isBookingArchived("2026-11-10T16:00:00+07:00", now), true)
assert.equal(isBookingArchived("2026-11-15T08:00:00+07:00", now), false)
assert.equal(matchesBookingId("PMJ-0264", "0264"), true)
assert.equal(matchesBookingId("PMJ-0264", "0259"), false)
assert.equal(getAdminBooking("PMJ-0264")?.letterName, "surat-peminjaman-ukki.pdf")
assert.equal(getAdminBooking("PMJ-9999"), undefined)
assert.equal(new Set(ADMIN_BOOKINGS.map((booking) => booking.id)).size, ADMIN_BOOKINGS.length)

console.log("Admin booking filters: OK")
