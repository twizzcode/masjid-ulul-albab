import type { Metadata } from "next"

import { AdminDashboard } from "@/components/admin-dashboard"

export const metadata: Metadata = {
  title: "Dashboard Admin | Masjid Jami' Ulul Albab",
}

export default function AdminPage() {
  return <AdminDashboard />
}
