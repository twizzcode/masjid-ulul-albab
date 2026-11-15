import type { Metadata } from "next"

import { AdminUsers } from "@/components/admin-users"
import { listAdmins } from "@/lib/admin-users"

export const metadata: Metadata = {
  title: "Pengguna",
  description: "Kelola pengguna dan administrator masjid.",
}

export default async function AdminPenggunaPage() {
  const admins = await listAdmins()

  return <AdminUsers admins={admins} />
}
