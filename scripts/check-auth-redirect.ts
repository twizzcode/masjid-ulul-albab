import assert from "node:assert/strict"

import { getSafeCallbackURL } from "../lib/auth-redirect"

assert.equal(getSafeCallbackURL("/peminjaman#form-peminjaman"), "/peminjaman#form-peminjaman")
assert.equal(getSafeCallbackURL("//example.com"), "/")
assert.equal(getSafeCallbackURL("/\\example.com"), "/")
assert.equal(getSafeCallbackURL("https://example.com"), "/")
assert.equal(getSafeCallbackURL(undefined), "/")

console.log("Auth redirect validation: OK")
