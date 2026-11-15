import {
  ArrowUpRight01Icon,
  Calendar04Icon,
  File02Icon,
  Location01Icon,
  UserGroupIcon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { IconSvgElement } from "@hugeicons/react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import Link from "next/link"
import { redirect } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { auth } from "@/lib/auth"
import { listBookingHistory } from "@/lib/booking-history"
import type { BookingStatus } from "@/lib/bookings"

export const metadata: Metadata = {
  title: "Riwayat Peminjaman",
  description: "Lihat status dan detail pengajuan peminjaman tempat Anda.",
  robots: { index: false, follow: false },
}

const STATUS: Record<
  BookingStatus,
  { label: string; variant: "secondary" | "outline" | "destructive" }
> = {
  PENDING: { label: "Menunggu", variant: "secondary" },
  APPROVED: { label: "Disetujui", variant: "outline" },
  REJECTED: { label: "Ditolak", variant: "destructive" },
}

function Detail({
  icon,
  label,
  value,
}: {
  icon: IconSvgElement
  label: string
  value: string
}) {
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
        <HugeiconsIcon icon={icon} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <dt className="text-xs text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 font-medium break-words">{value}</dd>
      </div>
    </div>
  )
}

export default async function RiwayatPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string | string[] }>
}) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) redirect("/login?callbackURL=/riwayat")

  const rawPage = (await searchParams).page
  const requestedPage = Number(Array.isArray(rawPage) ? rawPage[0] : rawPage)
  const page =
    Number.isSafeInteger(requestedPage) &&
    requestedPage > 0 &&
    requestedPage <= 10_000
      ? requestedPage
      : 1
  const pageSize = 10
  const { bookings, total } = await listBookingHistory(session.user.id, {
    page,
    pageSize,
  })
  const pageCount = Math.ceil(total / pageSize)
  if (page > 1 && page > pageCount) redirect("/riwayat")

  return (
    <div className="container mx-auto w-full max-w-7xl px-3 pt-8 pb-24 sm:px-6 md:pt-12">
      <section className="relative isolate overflow-hidden rounded-3xl border bg-muted px-6 py-10 text-center md:px-10 md:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"
        />
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Riwayat Peminjaman
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Pantau status dan detail seluruh pengajuan peminjaman tempat dari
            akun Anda.
          </p>
          <Link
            href="/peminjaman#form-peminjaman"
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2 text-sm font-bold text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] transition duration-200 hover:-translate-y-0.5 sm:w-auto"
          >
            Ajukan peminjaman baru
          </Link>
        </div>
      </section>

      <section aria-labelledby="daftar-riwayat" className="mt-6 md:mt-10">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <h2 id="daftar-riwayat" className="text-xl font-semibold">
              Daftar pengajuan
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {total.toLocaleString("id-ID")} pengajuan tersimpan
            </p>
          </div>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                <HugeiconsIcon icon={Calendar04Icon} strokeWidth={2} />
              </span>
              <div>
                <p className="font-medium">Belum ada riwayat peminjaman</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pengajuan yang Anda kirim akan tampil di halaman ini.
                </p>
              </div>
              <Link
                href="/peminjaman#form-peminjaman"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2 text-sm font-bold text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] transition duration-200 hover:-translate-y-0.5"
              >
                Ajukan peminjaman
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <CardTitle className="text-lg">
                        {booking.eventName}
                      </CardTitle>
                      <CardDescription className="mt-1">
                        {booking.id} · Diajukan {booking.submittedAt}
                      </CardDescription>
                    </div>
                    <Badge variant={STATUS[booking.status].variant}>
                      {STATUS[booking.status].label}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-5 border-t pt-5 sm:grid-cols-2">
                    <Detail
                      icon={Location01Icon}
                      label="Tempat"
                      value={booking.room}
                    />
                    <Detail
                      icon={Calendar04Icon}
                      label="Mulai"
                      value={booking.startAt}
                    />
                    <Detail
                      icon={Calendar04Icon}
                      label="Selesai"
                      value={booking.endAt}
                    />
                    <Detail
                      icon={UserGroupIcon}
                      label="Penyelenggara"
                      value={booking.organizer ?? "Tidak dicantumkan"}
                    />
                    <Detail
                      icon={WhatsappIcon}
                      label="Narahubung"
                      value={`${booking.contactName}${booking.whatsapp ? ` · ${booking.whatsapp}` : ""}`}
                    />
                    <Detail
                      icon={File02Icon}
                      label="Surat peminjaman"
                      value={booking.letterName ?? "Tanpa surat"}
                    />
                  </dl>

                  {booking.letterUrl && (
                    <div className="mt-5 flex justify-end border-t pt-4">
                      <Button
                        variant="outline"
                        nativeButton={false}
                        render={
                          <a
                            href={booking.letterUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        Buka surat
                        <HugeiconsIcon
                          icon={ArrowUpRight01Icon}
                          strokeWidth={2}
                        />
                      </Button>
                    </div>
                  )}
                  {booking.status === "PENDING" && booking.confirmationUrl && (
                    <div
                      className={`${booking.letterUrl ? "mt-2" : "mt-5 border-t pt-4"} flex justify-end`}
                    >
                      <Button
                        nativeButton={false}
                        render={
                          <a
                            href={booking.confirmationUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          />
                        }
                      >
                        <HugeiconsIcon icon={WhatsappIcon} strokeWidth={2} />
                        Konfirmasi ke admin
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
            {pageCount > 1 && (
              <nav
                aria-label="Pagination riwayat peminjaman"
                className="flex items-center justify-between gap-3"
              >
                {page > 1 ? (
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/riwayat?page=${page - 1}`} />}
                  >
                    Sebelumnya
                  </Button>
                ) : (
                  <span />
                )}
                <span className="text-sm text-muted-foreground">
                  Halaman {page} dari {pageCount}
                </span>
                {page < pageCount ? (
                  <Button
                    variant="outline"
                    nativeButton={false}
                    render={<Link href={`/riwayat?page=${page + 1}`} />}
                  >
                    Berikutnya
                  </Button>
                ) : (
                  <span />
                )}
              </nav>
            )}
          </div>
        )}
      </section>
    </div>
  )
}
