import { randomUUID } from "node:crypto"

import { and, asc, gt, inArray, lt } from "drizzle-orm"
import { revalidatePath } from "next/cache"
import { headers } from "next/headers"

import { auth } from "@/lib/auth"
import {
  getPostgresErrorCode,
  isBookingCalendarRange,
  isBookingRoom,
  parseJakartaDateTime,
} from "@/lib/bookings"
import { db } from "@/lib/db"
import { booking } from "@/lib/db/schema"
import { deleteR2Object, putR2Object } from "@/lib/r2"
import { consumeRateLimit } from "@/lib/rate-limit"

const MAX_FILE_SIZE = 2 * 1024 * 1024
const MAX_REQUEST_SIZE = 3 * 1024 * 1024
const PDF_SIGNATURE = new TextEncoder().encode("%PDF-")

function text(formData: FormData, name: string) {
  const value = formData.get(name)
  return typeof value === "string" ? value.trim() : ""
}

function hasPdfSignature(bytes: Uint8Array) {
  return PDF_SIGNATURE.every((byte, index) => bytes[index] === byte)
}

export async function GET(request: Request) {
  const params = new URL(request.url).searchParams
  const start = new Date(params.get("start") ?? "")
  const end = new Date(params.get("end") ?? "")

  if (!isBookingCalendarRange(start, end)) {
    return Response.json(
      { message: "Rentang kalender tidak valid." },
      { status: 400 }
    )
  }

  const records = await db
    .select({
      id: booking.id,
      eventName: booking.eventName,
      organizer: booking.organizer,
      room: booking.room,
      startAt: booking.startAt,
      endAt: booking.endAt,
      status: booking.status,
    })
    .from(booking)
    .where(
      and(
        inArray(booking.status, ["PENDING", "APPROVED"]),
        lt(booking.startAt, end),
        gt(booking.endAt, start)
      )
    )
    .orderBy(asc(booking.startAt))

  return Response.json(
    {
      bookings: records.map((record) => ({
        ...record,
        startAt: record.startAt.toISOString(),
        endAt: record.endAt.toISOString(),
      })),
    },
    { headers: { "Cache-Control": "no-store" } }
  )
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json(
      { message: "Permintaan tidak diizinkan." },
      { status: 403 }
    )
  }

  const contentLength = Number(request.headers.get("content-length") ?? 0)
  if (contentLength > MAX_REQUEST_SIZE) {
    return Response.json(
      { message: "Ukuran pengajuan terlalu besar." },
      { status: 413 }
    )
  }

  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) {
    return Response.json(
      { message: "Silakan masuk terlebih dahulu." },
      { status: 401 }
    )
  }
  const isAdmin = session.user.role === "ADMIN"

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return Response.json(
      { message: "Data pengajuan tidak valid." },
      { status: 400 }
    )
  }

  const contactName = text(formData, "contactName")
  const whatsapp = text(formData, "whatsapp").replace(/[\s()-]/g, "")
  const organizer = text(formData, "organizer")
  const eventName = text(formData, "eventName")
  const room = formData.get("room")
  const startAt = parseJakartaDateTime(
    formData.get("startDate"),
    formData.get("startTime")
  )
  const endAt = parseJakartaDateTime(
    formData.get("endDate"),
    formData.get("endTime")
  )
  const letter = formData.get("letter")
  const letterFile = letter instanceof File && letter.size > 0 ? letter : null

  if (
    contactName.length < 3 ||
    contactName.length > 100 ||
    !/^(?:\+62|62|0)8[1-9]\d{7,11}$/.test(whatsapp) ||
    (!isAdmin && organizer.length < 3) ||
    organizer.length > 150 ||
    eventName.length < 3 ||
    eventName.length > 150 ||
    !isBookingRoom(room) ||
    !startAt ||
    !endAt ||
    endAt <= startAt ||
    startAt < new Date() ||
    (!isAdmin && !letterFile) ||
    (letterFile !== null && letterFile.size > MAX_FILE_SIZE)
  ) {
    return Response.json(
      { message: "Data pengajuan belum lengkap atau tidak valid." },
      { status: 400 }
    )
  }

  const bytes = letterFile
    ? new Uint8Array(await letterFile.arrayBuffer())
    : null
  if (bytes && !hasPdfSignature(bytes)) {
    return Response.json(
      { message: "Surat peminjaman harus berupa PDF yang valid." },
      { status: 400 }
    )
  }

  try {
    const rateLimit = await consumeRateLimit(session.user.id, {
      scope: "booking",
      limit: isAdmin ? 30 : 10,
      windowMs: 60 * 60 * 1000,
    })
    if (!rateLimit.allowed) {
      return Response.json(
        { message: "Terlalu banyak pengajuan. Silakan coba lagi nanti." },
        {
          status: 429,
          headers: { "Retry-After": String(rateLimit.retryAfterSeconds) },
        }
      )
    }
  } catch (error) {
    console.error("Gagal memeriksa batas pengajuan", error)
    return Response.json(
      { message: "Layanan peminjaman sementara tidak tersedia." },
      { status: 503 }
    )
  }

  const letterKey =
    bytes && letterFile
      ? `bookings/${session.user.id}/${randomUUID()}.pdf`
      : null

  if (bytes && letterKey) {
    try {
      await putR2Object(letterKey, bytes)
    } catch (error) {
      console.error("Gagal mengunggah surat peminjaman ke R2", error)
      return Response.json(
        { message: "Surat gagal diunggah. Silakan coba lagi." },
        { status: 502 }
      )
    }
  }

  let id: string
  try {
    const [inserted] = await db
      .insert(booking)
      .values({
        userId: session.user.id,
        contactName,
        whatsapp,
        organizer: organizer || null,
        eventName,
        room,
        startAt,
        endAt,
        status: isAdmin ? "APPROVED" : "PENDING",
        ...(bytes && letterKey && letterFile
          ? {
              letterKey,
              letterName:
                letterFile.name.slice(0, 255) || "surat-peminjaman.pdf",
              letterSize: letterFile.size,
              letterMime: "application/pdf",
            }
          : {}),
      })
      .returning({ id: booking.id })
    id = inserted.id
  } catch (error) {
    if (letterKey) {
      try {
        await deleteR2Object(letterKey)
      } catch (cleanupError) {
        console.error(
          "Gagal rollback object R2 setelah insert gagal",
          cleanupError
        )
      }
    }

    if (getPostgresErrorCode(error) === "23P01") {
      return Response.json(
        {
          message:
            "Jadwal bertabrakan dengan peminjaman lain. Pilih waktu atau tempat berbeda.",
        },
        { status: 409 }
      )
    }

    console.error("Gagal menyimpan pengajuan peminjaman", error)
    return Response.json(
      { message: "Pengajuan gagal disimpan. Silakan coba lagi." },
      { status: 500 }
    )
  }

  revalidatePath("/riwayat")
  return Response.json(
    {
      id,
      message: isAdmin
        ? `Peminjaman ${id} berhasil ditambahkan.`
        : `Pengajuan ${id} berhasil dikirim.`,
    },
    { status: 201 }
  )
}
