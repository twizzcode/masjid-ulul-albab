import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

import { AdminNavCountsProvider } from "@/components/admin-nav-counts-provider"
import { countAdminAspirations } from "@/lib/admin-aspirations"
import { countPendingBookings } from "@/lib/admin-booking-data"
import { auth } from "@/lib/auth"

export const metadata: Metadata = {
  title: {
    default: "Dashboard",
    template: "%s | Admin Masjid Jami' Ulul Albab",
  },
  description: "Panel administrasi Masjid Jami' Ulul Albab UNNES.",
  robots: { index: false, follow: false, nocache: true },
}

export default async function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const session = await auth.api.getSession({ headers: await headers() })

  if (!session) redirect("/login?callbackURL=/admin")
  if (session.user.role !== "ADMIN") redirect("/")

  const [waitingBookings, aspirations] = await Promise.all([
    countPendingBookings(),
    countAdminAspirations(),
  ])

  return (
    <AdminNavCountsProvider initialCounts={{ waitingBookings, aspirations }}>
      {children}
    </AdminNavCountsProvider>
  )
}
