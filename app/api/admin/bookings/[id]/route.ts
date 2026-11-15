import { and, eq, isNull } from "drizzle-orm"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { getPostgresErrorCode } from "@/lib/bookings"
import { db } from "@/lib/db"
import { booking } from "@/lib/db/schema"
import { deleteR2Object, getR2Object, putR2Object } from "@/lib/r2"

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

  const status =
    body && typeof body === "object" && "status" in body ? body.status : null
  if (status !== "APPROVED" && status !== "REJECTED") {
    return Response.json({ message: "Status tidak valid." }, { status: 400 })
  }

  try {
    const [updated] = await db
      .update(booking)
      .set({ status, updatedAt: new Date() })
      .where(eq(booking.id, (await params).id))
      .returning({ id: booking.id })

    if (!updated) {
      return Response.json({ message: "Peminjaman tidak ditemukan." }, { status: 404 })
    }
  } catch (error) {
    if (getPostgresErrorCode(error) === "23P01") {
      return Response.json(
        { message: "Peminjaman tidak dapat disetujui karena jadwal sudah terisi." },
        { status: 409 }
      )
    }
    console.error("Gagal mengubah status peminjaman", error)
    return Response.json({ message: "Status gagal diubah." }, { status: 500 })
  }

  return Response.json({ status })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await requireAdmin(request))) {
    return Response.json({ message: "Akses ditolak." }, { status: 403 })
  }

  const id = (await params).id
  const [record] = await db
    .select({ letterKey: booking.letterKey })
    .from(booking)
    .where(eq(booking.id, id))
    .limit(1)

  if (!record) {
    return Response.json({ message: "Peminjaman tidak ditemukan." }, { status: 404 })
  }

  const letterKey = record.letterKey
  let backup: Uint8Array | null = null

  if (letterKey) {
    try {
      backup = await getR2Object(letterKey)
      await deleteR2Object(letterKey)
    } catch (error) {
      console.error("Gagal menghapus surat peminjaman dari R2", error)
      return Response.json(
        { message: "Surat gagal dihapus dari penyimpanan. Data belum dihapus." },
        { status: 502 }
      )
    }
  }

  try {
    const [deleted] = await db
      .delete(booking)
      .where(
        and(
          eq(booking.id, id),
          letterKey ? eq(booking.letterKey, letterKey) : isNull(booking.letterKey)
        )
      )
      .returning({ id: booking.id })

    if (!deleted) throw new Error("Row berubah saat proses penghapusan")
  } catch (error) {
    if (letterKey && backup) {
      try {
        await putR2Object(letterKey, backup)
      } catch (restoreError) {
        console.error("KRITIS: gagal memulihkan surat R2", restoreError)
      }
    }
    console.error("Gagal menghapus row peminjaman", error)
    return Response.json(
      { message: "Data gagal dihapus. Surat telah dipulihkan." },
      { status: 500 }
    )
  }

  return new Response(null, { status: 204 })
}
