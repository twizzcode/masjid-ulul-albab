import { headers } from "next/headers"

import { promoteUserToAdmin } from "@/lib/admin-users"
import { auth } from "@/lib/auth"

async function requireAdmin(request: Request) {
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin) return null
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.role === "ADMIN" ? session : null
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return Response.json({ message: "Akses ditolak." }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: "Data tidak valid." }, { status: 400 })
  }

  const role =
    body && typeof body === "object" && "role" in body ? body.role : null
  if (role !== "ADMIN") {
    return Response.json({ message: "Peran tidak valid." }, { status: 400 })
  }

  try {
    const user = await promoteUserToAdmin((await params).id)

    if (!user) {
      return Response.json(
        { message: "Pengguna tidak ditemukan." },
        { status: 404 }
      )
    }

    return Response.json({ user })
  } catch (error) {
    console.error("Gagal menjadikan pengguna admin", error)
    return Response.json(
      { message: "Pengguna gagal dijadikan admin." },
      { status: 500 }
    )
  }
}
