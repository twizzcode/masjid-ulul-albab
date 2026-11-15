import assert from "node:assert/strict"

import { createRateLimitKey, getClientAddress } from "../lib/rate-limit"

assert.equal(
  getClientAddress(
    new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.7, 10.0.0.1" },
    })
  ),
  "203.0.113.7"
)
assert.equal(
  getClientAddress(
    new Request("https://example.com", {
      headers: {
        "cf-connecting-ip": "198.51.100.4",
        "x-forwarded-for": "203.0.113.7",
      },
    })
  ),
  "198.51.100.4"
)
assert.equal(
  createRateLimitKey("aspiration", "203.0.113.7", "secret"),
  createRateLimitKey("aspiration", "203.0.113.7", "secret")
)
assert.notEqual(
  createRateLimitKey("aspiration", "203.0.113.7", "secret"),
  createRateLimitKey("aspiration", "203.0.113.8", "secret")
)

console.log("Rate limit checks: OK")
