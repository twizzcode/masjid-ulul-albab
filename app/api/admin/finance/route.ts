import { headers } from "next/headers"
import { revalidatePath } from "next/cache"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { financeTransaction } from "@/lib/db/schema"
import { parseFinanceInput } from "@/lib/finance-input"

async function requireAdmin(request: Request) {
  const origin = request.headers.get("origin")
  if (origin !== new URL(request.url).origin) return null
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.role === "ADMIN" ? session : null
}

export async function POST(request: Request) {
  const session = await requireAdmin(request)
  if (!session) {
    return Response.json({ message: "Akses ditolak." }, { status: 403 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ message: "Data tidak valid." }, { status: 400 })
  }
  const input = parseFinanceInput(body)
  if (!input) {
    return Response.json(
      { message: "Data transaksi belum lengkap atau tidak valid." },
      { status: 400 }
    )
  }

  try {
    const [created] = await db
      .insert(financeTransaction)
      .values({
        occurredOn: input.date,
        title: input.title,
        category: input.category,
        type: input.type,
        amount: input.amount,
        createdBy: session.user.id,
      })
      .returning({ id: financeTransaction.id })
    revalidatePath("/keuangan")
    revalidatePath("/admin/keuangan")
    return Response.json({ id: created.id }, { status: 201 })
  } catch (error) {
    console.error("Gagal menambah transaksi keuangan", error)
    return Response.json(
      { message: "Transaksi gagal disimpan." },
      { status: 500 }
    )
  }
}
