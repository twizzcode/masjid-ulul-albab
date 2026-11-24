import assert from "node:assert/strict"

import { buildEventIndex } from "@/components/reui/event-calendar/event-calendar-lib"
import { splitBookingOccurrences as getOccurrences } from "@/components/peminjaman-calendar"

const timeZone = "Asia/Jakarta"
const start = new Date("2026-11-13T15:00:00+07:00")
const midnight = new Date("2026-11-14T00:00:00+07:00")
const end = new Date("2026-11-14T17:00:00+07:00")
const range = { start, end: new Date("2026-11-16T00:00:00+07:00") }

const event = { id: "booking", title: "Booking", start, end }
const index = buildEventIndex([event], range, {
  timeZone,
  weekStartsOn: 1,
  getOccurrences,
})
assert.deepEqual(
  [...index.byDay.values()].flatMap(({ timed }) =>
    timed.map(({ startMin, endMin }) => [startMin, endMin])
  ),
  [
    [900, 1440],
    [0, 1020],
  ]
)
assert.equal(
  buildEventIndex([{ ...event, end: midnight }], range, {
    timeZone,
    weekStartsOn: 1,
    getOccurrences,
  }).byDay.size,
  1
)

const longer = buildEventIndex(
  [{ ...event, end: new Date("2026-11-15T17:00:00+07:00") }],
  range,
  { timeZone, weekStartsOn: 1, getOccurrences }
)
assert.deepEqual(
  [...longer.byDay.values()].flatMap(({ timed }) =>
    timed.map(({ startMin, endMin }) => [startMin, endMin])
  ),
  [
    [900, 1440],
    [0, 1440],
    [0, 1020],
  ]
)
