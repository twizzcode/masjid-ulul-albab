import { config } from "dotenv"
import { defineConfig } from "drizzle-kit"

config({ path: ".env.local" })

const url = process.env.DATABASE_URL

export default defineConfig({
  dialect: "postgresql",
  out: "./drizzle",
  schema: "./lib/db/schema.ts",
  ...(url ? { dbCredentials: { url } } : {}),
})
