import type { Metadata } from "next"

import { AdminDashboard } from "@/components/admin-dashboard"
import { getAdminDashboard } from "@/lib/admin-dashboard"

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Ringkasan operasional Masjid Jami' Ulul Albab UNNES.",
}

export default async function AdminPage() {
  const data = await getAdminDashboard()
  return <AdminDashboard data={data} />
}
