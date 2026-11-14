import {
  Invoice01Icon,
  MoneyReceive01Icon,
  MoneySend01Icon,
  TransactionHistoryIcon,
  Wallet01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import type { Metadata } from "next"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"

export const metadata: Metadata = {
  title: "Keuangan — Masjid Jami' Ulul Albab UNNES",
  description: "Informasi dan laporan keuangan Masjid Jami' Ulul Albab UNNES.",
}

const WHATSAPP_URL =
  "https://wa.me/6281234567890?text=" +
  encodeURIComponent(
    "Assalamu'alaikum, saya ingin bertanya mengenai laporan keuangan Masjid Jami' Ulul Albab UNNES."
  )

const summaries = [
  {
    label: "Saldo kas",
    description: "Saldo terakhir yang telah diverifikasi",
    icon: Wallet01Icon,
  },
  {
    label: "Pemasukan bulan ini",
    description: "Total penerimaan pada bulan berjalan",
    icon: MoneyReceive01Icon,
  },
  {
    label: "Pengeluaran bulan ini",
    description: "Total kebutuhan operasional bulan berjalan",
    icon: MoneySend01Icon,
  },
]

export default function KeuanganPage() {
  return (
    <div className="container mx-auto w-full max-w-7xl px-6 pt-10 pb-24 md:pt-14">
      <header className="flex max-w-3xl flex-col gap-3">
        <p className="text-sm font-medium text-muted-foreground">
          Transparansi keuangan masjid
        </p>
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
          Keuangan
        </h1>
        <p className="text-muted-foreground">
          Pantau penerimaan, pengeluaran, dan penggunaan dana jamaah Masjid
          Jami&apos; Ulul Albab secara terbuka.
        </p>
      </header>

      <section aria-labelledby="ringkasan-title" className="mt-10">
        <h2 id="ringkasan-title" className="sr-only">
          Ringkasan keuangan
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {summaries.map((summary) => (
            <Card key={summary.label}>
              <CardHeader>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={summary.icon}
                    strokeWidth={2}
                    className="size-4"
                  />
                  <CardTitle>{summary.label}</CardTitle>
                </div>
                <CardDescription>{summary.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-semibold tracking-tight">
                  Belum tersedia
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Menunggu laporan terverifikasi
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mt-12 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Riwayat transaksi</CardTitle>
            <CardDescription>
              Pemasukan dan pengeluaran yang telah diverifikasi pengurus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Empty className="border">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={TransactionHistoryIcon}
                    strokeWidth={2}
                  />
                </EmptyMedia>
                <EmptyTitle>Belum ada laporan transaksi</EmptyTitle>
                <EmptyDescription>
                  Laporan akan tampil setelah data keuangan diverifikasi dan
                  dipublikasikan oleh pengurus masjid.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Informasi laporan</CardTitle>
            <CardDescription>
              Keterangan publikasi dan verifikasi data keuangan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <HugeiconsIcon
                aria-hidden="true"
                icon={Invoice01Icon}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div className="flex flex-col gap-0.5">
                <h3 className="font-medium">Periode laporan</h3>
                <p className="text-sm text-muted-foreground">
                  Ringkasan diperbarui mengikuti laporan bulanan pengurus.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <HugeiconsIcon
                aria-hidden="true"
                icon={Wallet01Icon}
                strokeWidth={2}
                className="mt-0.5 shrink-0 text-muted-foreground"
              />
              <div className="flex flex-col gap-0.5">
                <h3 className="font-medium">Konfirmasi data</h3>
                <p className="text-sm text-muted-foreground">
                  Hubungi pengurus jika membutuhkan rincian laporan resmi.
                </p>
              </div>
            </div>

            <Button
              nativeButton={false}
              render={
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              Hubungi pengurus
            </Button>
          </CardContent>
        </Card>
      </section>

      <p className="mt-6 text-xs text-muted-foreground">
        Nominal dan transaksi hanya ditampilkan setelah diverifikasi pengurus
        untuk menjaga ketepatan laporan.
      </p>
    </div>
  )
}
