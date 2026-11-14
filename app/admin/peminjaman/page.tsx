import type { Metadata } from "next"

import { AdminBookings } from "@/components/admin-bookings"

export const metadata: Metadata = {
  title: "Peminjaman | Admin Masjid Jami' Ulul Albab",
}

export default function AdminPeminjamanPage() {
  return <AdminBookings />
}
