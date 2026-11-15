import type { Metadata } from "next"

import { AdminBookings } from "@/components/admin-bookings"
import { listAdminBookings } from "@/lib/admin-booking-data"

export const metadata: Metadata = {
  title: "Peminjaman",
  description: "Kelola pengajuan dan riwayat peminjaman tempat masjid.",
}

export default async function AdminPeminjamanPage() {
  const initialPage = await listAdminBookings()
  return <AdminBookings initialPage={initialPage} />
}
