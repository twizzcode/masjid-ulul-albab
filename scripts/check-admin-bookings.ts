import assert from "node:assert/strict"

import { isBookingArchived, matchesBookingId, getBookingMonth, formatBookingMonth } from "../lib/admin-bookings"

const now = new Date("2026-11-14T12:00:00+07:00").getTime()

assert.equal(isBookingArchived("2026-11-10T16:00:00+07:00", now), true)
assert.equal(isBookingArchived("2026-11-15T08:00:00+07:00", now), false)
assert.equal(matchesBookingId("PMJ-0264", "0264"), true)
assert.equal(matchesBookingId("PMJ-0264", "0259"), false)
assert.equal(getBookingMonth("2026-11-30T17:30:00.000Z"), "2026-12")
assert.equal(formatBookingMonth("2026-11"), "November 2026")

console.log("Admin booking filters: OK")
