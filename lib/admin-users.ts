import { asc, eq, ilike } from "drizzle-orm"

import { db } from "@/lib/db"
import { user } from "@/lib/db/schema"

export type AdminUser = {
  id: string
  name: string
  email: string
  image: string | null
  createdAt: string
}

export type SearchUser = AdminUser & {
  isAdmin: boolean
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeZone: "Asia/Jakarta",
})

function mapUser(record: typeof user.$inferSelect): AdminUser {
  return {
    id: record.id,
    name: record.name,
    email: record.email,
    image: record.image,
    createdAt: dateFormatter.format(record.createdAt),
  }
}

export async function listAdmins() {
  const records = await db
    .select()
    .from(user)
    .where(eq(user.role, "ADMIN"))
    .orderBy(asc(user.name))

  return records.map(mapUser)
}

export async function searchUsersByEmail(query: string) {
  const pattern = `%${query.replace(/[\\%_]/g, (char) => `\\${char}`)}%`

  const records = await db
    .select()
    .from(user)
    .where(ilike(user.email, pattern))
    .orderBy(asc(user.email))
    .limit(10)

  return records.map<SearchUser>((record) => ({
    ...mapUser(record),
    isAdmin: record.role === "ADMIN",
  }))
}

export async function promoteUserToAdmin(id: string) {
  const [updated] = await db
    .update(user)
    .set({ role: "ADMIN", updatedAt: new Date() })
    .where(eq(user.id, id))
    .returning()

  return updated ? mapUser(updated) : undefined
}
