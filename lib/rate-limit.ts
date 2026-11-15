import { createHmac } from "node:crypto"

import { and, lte, ne, sql } from "drizzle-orm"

type RateLimitOptions = {
  scope: string
  limit: number
  windowMs: number
}

export function getClientAddress(request: Request) {
  return (
    request.headers.get("cf-connecting-ip")?.trim() ||
    request.headers.get("x-real-ip")?.trim() ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    "unknown"
  ).slice(0, 100)
}

export function createRateLimitKey(
  scope: string,
  subject: string,
  secret = process.env.BETTER_AUTH_SECRET
) {
  if (!secret) throw new Error("BETTER_AUTH_SECRET belum diisi")
  return `${scope}:${createHmac("sha256", secret).update(subject).digest("hex")}`
}

export async function consumeRateLimit(
  subject: string,
  { scope, limit, windowMs }: RateLimitOptions
) {
  const [{ db }, { apiRateLimit }] = await Promise.all([
    import("@/lib/db"),
    import("@/lib/db/schema"),
  ])
  const key = createRateLimitKey(scope, subject)
  const nextReset = new Date(Date.now() + windowMs)
  const [[result]] = await Promise.all([
    db
      .insert(apiRateLimit)
      .values({ key, count: 1, resetAt: nextReset })
      .onConflictDoUpdate({
        target: apiRateLimit.key,
        set: {
          count: sql`case when ${apiRateLimit.resetAt} <= now() then 1 else ${apiRateLimit.count} + 1 end`,
          resetAt: sql`case when ${apiRateLimit.resetAt} <= now() then ${nextReset} else ${apiRateLimit.resetAt} end`,
        },
      })
      .returning({ count: apiRateLimit.count, resetAt: apiRateLimit.resetAt }),
    db
      .delete(apiRateLimit)
      .where(
        and(lte(apiRateLimit.resetAt, new Date()), ne(apiRateLimit.key, key))
      ),
  ])

  const count = Number(result.count)
  return {
    allowed: count <= limit,
    remaining: Math.max(0, limit - count),
    retryAfterSeconds: Math.max(
      1,
      Math.ceil((result.resetAt.getTime() - Date.now()) / 1000)
    ),
  }
}
