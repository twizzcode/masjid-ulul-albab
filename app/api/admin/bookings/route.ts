import {
  listAdminBookings,
  type AdminBookingView,
} from "@/lib/admin-booking-data"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

const PAGE_SIZE = 10

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user.role !== "ADMIN") {
    return Response.json({ message: "Akses ditolak." }, { status: 403 })
  }

  const params = new URL(request.url).searchParams
  const view = params.get("view") ?? "active"
  const month = params.get("month") ?? ""
  const search = params.get("search")?.trim() ?? ""
  const page = Number(params.get("page") ?? "1")

  if (
    (view !== "active" && view !== "archive") ||
    (month !== "" && !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) ||
    search.length > 50 ||
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 10_000
  ) {
    return Response.json({ message: "Parameter tidak valid." }, { status: 400 })
  }

  const result = await listAdminBookings({
    view: view as AdminBookingView,
    month: month || undefined,
    search,
    page,
    pageSize: PAGE_SIZE,
  })
  return Response.json(result)
}
