import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AdminBookingDetail } from "@/components/admin-booking-detail"
import { countPendingBookings, getAdminBooking } from "@/lib/admin-booking-data"

type Props = {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const booking = await getAdminBooking((await params).id)

  return {
    title: booking ? `Detail ${booking.id}` : "Peminjaman tidak ditemukan",
    description: booking
      ? `Detail peminjaman ${booking.activity} di ${booking.venue}.`
      : "Data peminjaman tidak ditemukan.",
  }
}

export default async function AdminPeminjamanDetailPage({ params }: Props) {
  const [booking, pendingCount] = await Promise.all([
    getAdminBooking((await params).id),
    countPendingBookings(),
  ])

  if (!booking) notFound()

  return <AdminBookingDetail booking={booking} pendingCount={pendingCount} />
}
