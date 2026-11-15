import { eq } from "drizzle-orm"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { booking } from "@/lib/db/schema"
import { getR2Object } from "@/lib/r2"

function safeFilename(value: string) {
  return value.replace(/["\\\r\n]/g, "_")
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (session?.user.role !== "ADMIN") {
    return Response.json({ message: "Akses ditolak." }, { status: 403 })
  }

  const [record] = await db
    .select({ key: booking.letterKey, name: booking.letterName })
    .from(booking)
    .where(eq(booking.id, (await params).id))
    .limit(1)

  if (!record) return new Response("Dokumen tidak ditemukan.", { status: 404 })

  if (!record.key) {
    return new Response("Peminjaman ini tidak memiliki surat.", { status: 404 })
  }

  try {
    const bytes = await getR2Object(record.key)
    return new Response(bytes, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="${safeFilename(record.name ?? "surat.pdf")}"`,
        "Content-Type": "application/pdf",
        "X-Content-Type-Options": "nosniff",
      },
    })
  } catch (error) {
    console.error("Gagal membaca surat peminjaman dari R2", error)
    return new Response("Dokumen gagal dibuka.", { status: 502 })
  }
}
