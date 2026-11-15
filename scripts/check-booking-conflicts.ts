import assert from "node:assert/strict"

import {
  intervalsOverlap,
  isBookingCalendarRange,
  parseJakartaDateTime,
} from "../lib/bookings"

const at = (value: string) => new Date(value)

assert.equal(
  intervalsOverlap(
    at("2026-11-15T13:00:00+07:00"),
    at("2026-11-15T15:00:00+07:00"),
    at("2026-11-15T15:00:00+07:00"),
    at("2026-11-15T19:00:00+07:00")
  ),
  false
)
assert.equal(
  intervalsOverlap(
    at("2026-11-15T13:00:00+07:00"),
    at("2026-11-15T15:00:00+07:00"),
    at("2026-11-15T14:59:00+07:00"),
    at("2026-11-15T19:00:00+07:00")
  ),
  true
)
assert.equal(
  parseJakartaDateTime("2026-11-15", "13:00")?.toISOString(),
  "2026-11-15T06:00:00.000Z"
)
assert.equal(parseJakartaDateTime("2026-02-30", "13:00"), null)
assert.equal(
  isBookingCalendarRange(
    at("2026-11-01T00:00:00+07:00"),
    at("2027-01-02T00:00:00+07:00")
  ),
  true
)
assert.equal(
  isBookingCalendarRange(
    at("2026-11-01T00:00:00+07:00"),
    at("2027-01-03T00:00:01+07:00")
  ),
  false
)
assert.equal(isBookingCalendarRange(new Date("invalid"), new Date()), false)

console.log("Booking interval checks: OK")
