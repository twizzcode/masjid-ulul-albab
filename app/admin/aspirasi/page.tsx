import type { Metadata } from "next"

import { AdminAspirations } from "@/components/admin-aspirations"
import { listAdminAspirations } from "@/lib/admin-aspirations"

export const metadata: Metadata = {
  title: "Aspirasi",
  description: "Kelola saran dan masukan jamaah.",
}

export default async function AdminAspirasiPage() {
  const initialPage = await listAdminAspirations()
  return <AdminAspirations initialPage={initialPage} />
}
