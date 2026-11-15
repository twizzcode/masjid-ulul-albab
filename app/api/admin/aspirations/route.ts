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
  if (search.length > 100) {
    return Response.json({ message: "Parameter tidak valid." }, { status: 400 })
  }

  return Response.json(await listAdminAspirations({ search }))
}
