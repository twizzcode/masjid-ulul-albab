import { and, count, desc, eq, ilike, or, type SQL } from "drizzle-orm"

import { db } from "@/lib/db"
import { aspiration } from "@/lib/db/schema"

export type AdminAspiration = {
  id: string
  sender: string
  isAnonymous: boolean
  message: string
  createdAt: string
  submittedAt: string
}

export type AdminAspirationPage = {
  aspirations: AdminAspiration[]
  total: number
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
})

function escapeLike(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`)
}

export async function listAdminAspirations({
  search = "",
  page = 1,
  pageSize = 10,
}: {
  search?: string
  page?: number
  pageSize?: number
} = {}): Promise<AdminAspirationPage> {
  const conditions: SQL[] = []
  if (search) {
    const pattern = `%${escapeLike(search)}%`
    const matchesAnonymousLabel = "anonim".includes(
      search.toLocaleLowerCase("id-ID")
    )
    const match = or(
      ilike(aspiration.name, pattern),
      ilike(aspiration.message, pattern),
      ...(matchesAnonymousLabel ? [eq(aspiration.isAnonymous, true)] : [])
    )
    if (match) conditions.push(match)
  }
  const where = conditions.length ? and(...conditions) : undefined
  const [records, [result]] = await Promise.all([
    db
      .select()
      .from(aspiration)
      .where(where)
      .orderBy(desc(aspiration.createdAt), desc(aspiration.id))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ value: count() }).from(aspiration).where(where),
  ])

  return {
    aspirations: records.map((record) => ({
      id: record.id,
      sender: record.isAnonymous ? "Anonim" : (record.name ?? "Tanpa nama"),
      isAnonymous: record.isAnonymous,
      message: record.message,
      createdAt: record.createdAt.toISOString(),
      submittedAt: dateFormatter.format(record.createdAt),
    })),
    total: Number(result?.value ?? 0),
  }
}
