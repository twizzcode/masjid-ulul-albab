import { ArrowRight01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { Metadata } from "next"
import Link from "next/link"

import { KeuanganDashboard } from "@/components/keuangan-dashboard"
import { currentFinanceMonth } from "@/lib/finance"
import { getFinanceReport } from "@/lib/finance-data"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Keuangan",
  description:
    "Ringkasan pemasukan, pengeluaran, saldo, dan penggunaan dana Masjid Jami' Ulul Albab UNNES.",
  alternates: { canonical: "/keuangan" },
}

export default async function KeuanganPage() {
  const report = await getFinanceReport(currentFinanceMonth())

  return (
    <div className="container mx-auto w-full max-w-7xl px-3 pt-6 pb-24 sm:px-6 md:pt-8">
      <section className="relative isolate overflow-hidden rounded-3xl border bg-muted px-6 py-10 text-center md:px-10 md:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-32 -z-10 size-64 rounded-full bg-emerald-500/10 blur-3xl"
        />

        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Transparansi Keuangan
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Pantau saldo, pemasukan, pengeluaran, dan penggunaan dana jamaah
            secara ringkas dalam setiap periode laporan.
          </p>
          <Link
            href="#laporan-keuangan"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2 text-sm font-bold text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] transition duration-200 hover:-translate-y-0.5"
          >
            Lihat laporan bulan ini
            <HugeiconsIcon
              aria-hidden
              icon={ArrowRight01Icon}
              strokeWidth={2}
              className="size-4"
            />
          </Link>
        </div>
      </section>

      <section id="laporan-keuangan" className="mt-6 scroll-mt-32 md:mt-10">
        <KeuanganDashboard initialReport={report} />
      </section>
    </div>
  )
}
