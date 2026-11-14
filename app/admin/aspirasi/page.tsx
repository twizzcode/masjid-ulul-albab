import type { Metadata } from "next"
import { desc } from "drizzle-orm"

import {
  AdminAspirations,
  type AdminAspiration,
} from "@/components/admin-aspirations"
import { db } from "@/lib/db"
import { aspiration } from "@/lib/db/schema"

export const metadata: Metadata = {
  title: "Aspirasi | Admin Masjid Jami' Ulul Albab",
}

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  dateStyle: "long",
  timeStyle: "short",
  timeZone: "Asia/Jakarta",
})

export default async function AdminAspirasiPage() {
  const records = await db
    .select()
    .from(aspiration)
    .orderBy(desc(aspiration.createdAt))

  const aspirations: AdminAspiration[] = records.map((record) => ({
    id: record.id,
    sender: record.isAnonymous ? "Anonim" : (record.name ?? "Tanpa nama"),
    isAnonymous: record.isAnonymous,
    message: record.message,
    createdAt: record.createdAt.toISOString(),
    submittedAt: dateFormatter.format(record.createdAt),
  }))

  return <AdminAspirations aspirations={aspirations} />
}
