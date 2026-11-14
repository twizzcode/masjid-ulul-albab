import { aspiration } from "@/lib/db/schema"

type AspirationPayload = {
  anonymous?: unknown
  message?: unknown
  name?: unknown
  website?: unknown
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin")
  if (origin && origin !== new URL(request.url).origin) {
    return Response.json(
      { message: "Permintaan tidak diizinkan." },
      { status: 403 }
    )
  }

  const rawBody = await request.text()
  if (rawBody.length > 10_000) {
    return Response.json(
      { message: "Isi aspirasi terlalu panjang." },
      { status: 413 }
    )
  }

  let payload: AspirationPayload
  try {
    const parsed = JSON.parse(rawBody) as unknown
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new TypeError("Payload bukan objek")
    }
    payload = parsed as AspirationPayload
  } catch {
    return Response.json(
      { message: "Data aspirasi tidak valid." },
      { status: 400 }
    )
  }

  if (typeof payload.website === "string" && payload.website.length > 0) {
    return Response.json({ success: true }, { status: 201 })
  }

  const anonymous = payload.anonymous === true
  const message =
    typeof payload.message === "string" ? payload.message.trim() : ""
  const name = typeof payload.name === "string" ? payload.name.trim() : ""

  if (message.length < 10 || message.length > 2000) {
    return Response.json(
      { message: "Aspirasi harus berisi 10–2.000 karakter." },
      { status: 400 }
    )
  }

  if (!anonymous && (name.length < 2 || name.length > 100)) {
    return Response.json(
      { message: "Nama harus berisi 2–100 karakter." },
      { status: 400 }
    )
  }

  try {
    const { db } = await import("@/lib/db")

    await db.insert(aspiration).values({
      isAnonymous: anonymous,
      name: anonymous ? null : name,
      message,
    })

    return Response.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("Gagal menyimpan aspirasi", error)
    return Response.json(
      { message: "Aspirasi belum dapat disimpan. Coba lagi." },
      { status: 500 }
    )
  }
}

// ponytail: Validasi dan honeypot cukup untuk peluncuran; tambah rate limit
// persisten saat endpoint mulai menerima spam.
