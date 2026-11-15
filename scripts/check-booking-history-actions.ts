import assert from "node:assert/strict"

import { canUserModifyBooking } from "../lib/bookings"

assert.equal(canUserModifyBooking("PENDING"), true)
assert.equal(canUserModifyBooking("APPROVED"), false)
assert.equal(canUserModifyBooking("REJECTED"), false)

console.log("Booking history action checks: OK")
