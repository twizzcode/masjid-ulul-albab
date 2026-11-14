import { drizzle } from "drizzle-orm/neon-http"

import * as schema from "@/lib/db/schema"

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL belum diisi")
}

export const db = drizzle(process.env.DATABASE_URL, { schema })
