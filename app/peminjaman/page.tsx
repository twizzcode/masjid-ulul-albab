import type { Metadata } from "next"
import Link from "next/link"
import { headers } from "next/headers"

import { PeminjamanCalendar } from "@/components/peminjaman-calendar"
import { PeminjamanFacilitiesDialog } from "@/components/peminjaman-facilities-dialog"
import { PeminjamanForm } from "@/components/peminjaman-form"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { auth } from "@/lib/auth"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Peminjaman Tempat",
  description:
    "Ajukan peminjaman Aula Masjid Lantai 1 atau Ruang Solat Lantai 2 Masjid Jami' Ulul Albab UNNES.",
  alternates: { canonical: "/peminjaman" },
}

export default async function PeminjamanPage() {
  const session = await auth.api.getSession({ headers: await headers() })
  const historyHref = session ? "/riwayat" : "/login?callbackURL=%2Friwayat"
  const applyButtonClass =
    "inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2 text-sm font-bold text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] transition duration-200 hover:-translate-y-0.5 sm:w-auto"

  return (
    <div className="container mx-auto w-full max-w-7xl px-3 pt-6 pb-24 sm:px-6 md:pt-8">
      {/* Hero peminjaman */}
      <section className="relative isolate overflow-hidden rounded-3xl border bg-muted px-5 py-7 text-center md:px-8 md:py-9">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"
        />

        <div className="mx-auto flex max-w-2xl flex-col items-center gap-4">
          <h1 className="text-3xl font-bold tracking-tight md:text-4xl">
            Peminjaman Tempat
          </h1>

          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base">
            Butuh ruang untuk kajian, seminar, atau kegiatan sosial? Aula lantai
            satu dan ruang salat lantai dua bisa dipinjam untuk kegiatan yang
            bermanfaat bagi jamaah dan masyarakat sekitar.
          </p>

          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href={historyHref}
              className="inline-flex w-full items-center justify-center rounded-md border border-input bg-gradient-to-b from-white to-neutral-100 px-5 py-2 text-sm font-bold text-neutral-900 shadow-[0px_2px_0px_0px_rgba(255,255,255,0.9)_inset] transition duration-200 hover:-translate-y-0.5 hover:from-white hover:to-neutral-200 sm:w-auto dark:from-neutral-800 dark:to-neutral-950 dark:text-white dark:shadow-[0px_2px_0px_0px_rgba(255,255,255,0.12)_inset] dark:hover:from-neutral-800 dark:hover:to-black"
            >
              Lihat riwayat
            </Link>
            <PeminjamanFacilitiesDialog />
            {session ? (
              <a href="#form-peminjaman" className={applyButtonClass}>
                Ajukan peminjaman
              </a>
            ) : (
              <Link
                href="/login?callbackURL=%2Fpeminjaman%23form-peminjaman"
                className={applyButtonClass}
              >
                Ajukan peminjaman
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Kalender peminjaman */}
      <section id="kalender" className="mt-6 scroll-mt-32 md:mt-10">
        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="p-0">
            <PeminjamanCalendar />
          </CardContent>
        </Card>
      </section>

      <section id="form-peminjaman" className="mt-6 scroll-mt-32 md:mt-10">
        {session ? (
          <PeminjamanForm isAdmin={session?.user.role === "ADMIN"} />
        ) : (
          <Card className="mt-8 text-center">
            <CardHeader>
              <h3 className="text-xl font-semibold">Masuk untuk mengajukan</h3>
              <p className="text-sm text-muted-foreground">
                Jadwal tetap dapat dilihat tanpa akun. Login diperlukan untuk
                mengisi dan mengirim pengajuan peminjaman.
              </p>
            </CardHeader>
            <CardContent>
              <Link
                href="/login?callbackURL=%2Fpeminjaman%23form-peminjaman"
                className="inline-flex items-center justify-center rounded-md bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2 text-sm font-bold text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] transition-colors hover:from-blue-500 hover:to-blue-800"
              >
                Masuk untuk mengajukan
              </Link>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  )
}
