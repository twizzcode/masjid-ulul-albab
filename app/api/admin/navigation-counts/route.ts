import { headers } from "next/headers"

import { countAdminAspirations } from "@/lib/admin-aspirations"
import { countPendingBookings } from "@/lib/admin-booking-data"
import { auth } from "@/lib/auth"

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user.role !== "ADMIN") {
    return Response.json({ message: "Akses ditolak." }, { status: 403 })
  }

  const [waitingBookings, aspirations] = await Promise.all([
    countPendingBookings(),
    countAdminAspirations(),
  ])

  return Response.json(
    { waitingBookings, aspirations },
    { headers: { "Cache-Control": "no-store" } }
  )
}
