import { and, eq, isNull } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import {
  getPostgresErrorCode,
  isBookingRoom,
  parseJakartaDateTime,
} from "@/lib/bookings"
import { db } from "@/lib/db"
import { booking } from "@/lib/db/schema"
import { deleteR2Object, getR2Object, putR2Object } from "@/lib/r2"
import { consumeRateLimit } from "@/lib/rate-limit"

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin")
  return !origin || origin === new URL(request.url).origin
}

async function getUser(request: Request) {
  if (!sameOrigin(request)) return null
  return (await auth.api.getSession({ headers: await headers() }))?.user ?? null
}

function value(body: Record<string, unknown>, name: string) {
  return typeof body[name] === "string" ? body[name].trim() : ""
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request)
  if (!user)
    return Response.json({ message: "Akses ditolak." }, { status: 401 })

  let body: Record<string, unknown>
  try {
    body = (await request.json()) as Record<string, unknown>
  } catch {
    return Response.json({ message: "Data tidak valid." }, { status: 400 })
  }

  const contactName = value(body, "contactName")
  const whatsapp = value(body, "whatsapp").replace(/[\s()-]/g, "")
  const organizer = value(body, "organizer")
  const eventName = value(body, "eventName")
  const room = body.room
  const startAt = parseJakartaDateTime(body.startDate, body.startTime)
  const endAt = parseJakartaDateTime(body.endDate, body.endTime)

  if (
    contactName.length < 3 ||
    contactName.length > 100 ||
    !/^(?:\+62|62|0)8[1-9]\d{7,11}$/.test(whatsapp) ||
    organizer.length < 3 ||
    organizer.length > 150 ||
    eventName.length < 3 ||
    eventName.length > 150 ||
    !isBookingRoom(room) ||
    !startAt ||
    !endAt ||
    endAt <= startAt ||
    startAt < new Date()
  ) {
    return Response.json(
      { message: "Data perubahan belum lengkap atau tidak valid." },
      { status: 400 }
    )
  }

  const id = (await params).id
  try {
    const rateLimit = await consumeRateLimit(user.id, {
      scope: "booking-update",
      limit: 20,
      windowMs: 60 * 60 * 1000,
    })
    if (!rateLimit.allowed) {
      return Response.json(
        { message: "Terlalu banyak perubahan. Silakan coba lagi nanti." },
        { status: 429 }
      )
    }

    const [updated] = await db
      .update(booking)
      .set({
        contactName,
        whatsapp,
        organizer,
        eventName,
        room,
        startAt,
        endAt,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(booking.id, id),
          eq(booking.userId, user.id),
          eq(booking.status, "PENDING")
        )
      )
      .returning({ id: booking.id })

    if (!updated) {
      return Response.json(
        { message: "Hanya pengajuan menunggu milik Anda yang dapat diedit." },
        { status: 409 }
      )
    }
  } catch (error) {
    if (getPostgresErrorCode(error) === "23P01") {
      return Response.json(
        { message: "Jadwal bertabrakan. Pilih waktu atau tempat berbeda." },
        { status: 409 }
      )
    }
    console.error("Gagal mengubah peminjaman pengguna", error)
    return Response.json(
      { message: "Perubahan gagal disimpan." },
      { status: 500 }
    )
  }

  revalidatePath("/riwayat")
  return Response.json({ message: `Pengajuan ${id} berhasil diperbarui.` })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getUser(request)
  if (!user)
    return Response.json({ message: "Akses ditolak." }, { status: 401 })

  const id = (await params).id
  const [record] = await db
    .select({ letterKey: booking.letterKey })
    .from(booking)
    .where(
      and(
        eq(booking.id, id),
        eq(booking.userId, user.id),
        eq(booking.status, "PENDING")
      )
    )
    .limit(1)

  if (!record) {
    return Response.json(
      { message: "Hanya pengajuan menunggu milik Anda yang dapat dihapus." },
      { status: 409 }
    )
  }

  let backup: Uint8Array | null = null
  if (record.letterKey) {
    try {
      backup = await getR2Object(record.letterKey)
      await deleteR2Object(record.letterKey)
    } catch (error) {
      console.error("Gagal menghapus surat pengguna dari R2", error)
      return Response.json(
        { message: "Surat gagal dihapus. Pengajuan belum dihapus." },
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
          eq(booking.userId, user.id),
          eq(booking.status, "PENDING"),
          record.letterKey
            ? eq(booking.letterKey, record.letterKey)
            : isNull(booking.letterKey)
        )
      )
      .returning({ id: booking.id })
    if (!deleted) throw new Error("Pengajuan berubah saat dihapus")
  } catch (error) {
    if (record.letterKey && backup) {
      try {
        await putR2Object(record.letterKey, backup)
      } catch (restoreError) {
        console.error("KRITIS: surat pengguna gagal dipulihkan", restoreError)
      }
    }
    console.error("Gagal menghapus peminjaman pengguna", error)
    return Response.json(
      { message: "Pengajuan gagal dihapus." },
      { status: 500 }
    )
  }

  revalidatePath("/riwayat")
  return new Response(null, { status: 204 })
}
