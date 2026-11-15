import assert from "node:assert/strict"

import { getTableColumns, getTableName } from "drizzle-orm"

import { account, session, user, verification } from "../lib/db/schema"

assert.equal(getTableName(user), "users")
assert.equal(getTableName(account), "accounts")
assert.equal(getTableName(session), "session")
assert.equal(getTableName(verification), "verifications")

assert.equal(getTableColumns(user).emailVerified.name, "emailVerified")
assert.equal(getTableColumns(account).providerId.name, "providerId")
assert.equal(getTableColumns(session).userId.name, "userId")
assert.equal(getTableColumns(verification).expiresAt.name, "expiresAt")

console.log("Auth schema mapping: OK")
