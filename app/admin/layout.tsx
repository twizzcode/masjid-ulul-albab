import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { Metadata } from "next"

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

  return children
}
