import { headers } from "next/headers"

import { listAdminAspirations } from "@/lib/admin-aspirations"
import { auth } from "@/lib/auth"

export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user.role !== "ADMIN") {
    return Response.json({ message: "Akses ditolak." }, { status: 403 })
  }

  const params = new URL(request.url).searchParams
  const search = params.get("search")?.trim() ?? ""
  const page = Number(params.get("page") ?? "1")
  if (
    search.length > 100 ||
    !Number.isSafeInteger(page) ||
    page < 1 ||
    page > 10_000
  ) {
    return Response.json({ message: "Parameter tidak valid." }, { status: 400 })
  }

  return Response.json(await listAdminAspirations({ search, page }))
}
