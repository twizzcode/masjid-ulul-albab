import assert from "node:assert/strict"

import { POST } from "../app/api/aspirasi/route"

const endpoint = "http://localhost:3000/api/aspirasi"

const malformed = await POST(
  new Request(endpoint, { method: "POST", body: "bukan-json" })
)
assert.equal(malformed.status, 400)

const shortMessage = await POST(
  new Request(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      anonymous: true,
      category: "saran",
      message: "pendek",
    }),
  })
)
assert.equal(shortMessage.status, 400)

const crossOrigin = await POST(
  new Request(endpoint, {
    method: "POST",
    headers: { origin: "https://example.com" },
    body: "{}",
  })
)
assert.equal(crossOrigin.status, 403)

console.log("Pemeriksaan validasi aspirasi lulus.")
