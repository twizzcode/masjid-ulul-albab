import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { eq } from "drizzle-orm"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { financeTransaction } from "@/lib/db/schema"
import { parseFinanceInput } from "@/lib/finance-input"

async function requireAdmin(request: Request) {
  const origin = request.headers.get("origin")
  if (origin !== new URL(request.url).origin) return false
  const session = await auth.api.getSession({ headers: await headers() })
  return session?.user.role === "ADMIN"
}

function refreshFinancePages() {
  revalidatePath("/keuangan")
  revalidatePath("/admin/keuangan")
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
  const input = parseFinanceInput(body)
  if (!input) {
    return Response.json(
      { message: "Data transaksi belum lengkap atau tidak valid." },
      { status: 400 }
    )
  }

  try {
    const [updated] = await db
      .update(financeTransaction)
      .set({
        occurredOn: input.date,
        title: input.title,
        category: input.category,
        type: input.type,
        amount: input.amount,
        updatedAt: new Date(),
      })
      .where(eq(financeTransaction.id, (await params).id))
      .returning({ id: financeTransaction.id })
    if (!updated) {
      return Response.json(
        { message: "Transaksi tidak ditemukan." },
        { status: 404 }
      )
    }
    refreshFinancePages()
    return Response.json({ id: updated.id })
  } catch (error) {
    console.error("Gagal mengubah transaksi keuangan", error)
    return Response.json(
      { message: "Transaksi gagal diubah." },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return Response.json({ message: "Akses ditolak." }, { status: 403 })
  }

  try {
    const [deleted] = await db
      .delete(financeTransaction)
      .where(eq(financeTransaction.id, (await params).id))
      .returning({ id: financeTransaction.id })
    if (!deleted) {
      return Response.json(
        { message: "Transaksi tidak ditemukan." },
        { status: 404 }
      )
    }
    refreshFinancePages()
    return new Response(null, { status: 204 })
  } catch (error) {
    console.error("Gagal menghapus transaksi keuangan", error)
    return Response.json(
      { message: "Transaksi gagal dihapus." },
      { status: 500 }
    )
  }
}
