import { headers } from "next/headers"

import { searchUsersByEmail } from "@/lib/admin-users"
import { auth } from "@/lib/auth"

async function requireAdmin(request: Request) {
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin) return null
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.role === "ADMIN" ? session : null
}

export async function GET(request: Request) {
  if (!(await requireAdmin(request))) {
    return Response.json({ message: "Akses ditolak." }, { status: 403 })
  }

  const query = new URL(request.url).searchParams.get("email")?.trim() ?? ""
  if (query.length < 3) {
    return Response.json(
      { message: "Masukkan minimal 3 karakter email." },
      { status: 400 }
    )
  }

  try {
    const users = await searchUsersByEmail(query)
    return Response.json({ users })
  } catch (error) {
    console.error("Gagal mencari pengguna", error)
    return Response.json(
      { message: "Pencarian pengguna gagal." },
      { status: 500 }
    )
  }
}
