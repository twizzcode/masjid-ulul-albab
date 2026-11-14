import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { AdminBookingDetail } from "@/components/admin-booking-detail"
import { ADMIN_BOOKINGS, getAdminBooking } from "@/lib/admin-booking-data"

type Props = {
  params: Promise<{ id: string }>
}

export function generateStaticParams() {
  return ADMIN_BOOKINGS.map((booking) => ({ id: booking.id }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const booking = getAdminBooking((await params).id)

  return {
    title: booking
      ? `${booking.id} | Admin Masjid Jami' Ulul Albab`
      : "Peminjaman tidak ditemukan | Admin Masjid Jami' Ulul Albab",
  }
}

export default async function AdminPeminjamanDetailPage({ params }: Props) {
  const booking = getAdminBooking((await params).id)

  if (!booking) notFound()

  return <AdminBookingDetail booking={booking} />
}
