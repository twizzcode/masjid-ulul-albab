import {
  IconArrowRight,
  IconBrandWhatsapp,
  IconCircleCheck,
  IconBuildingMosque,
  IconPray,
} from "@tabler/icons-react"
import type { Metadata } from "next"
import Link from "next/link"

import { PeminjamanCalendar } from "@/components/peminjaman-calendar"
import { PeminjamanForm } from "@/components/peminjaman-form"
import { Card, CardContent } from "@/components/ui/card"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

export const metadata: Metadata = {
  title: "Peminjaman Tempat — Masjid Jami' Ulul Albab UNNES",
  description:
    "Ajukan peminjaman Aula Masjid Lantai 1 atau Ruang Solat Lantai 2 Masjid Jami' Ulul Albab UNNES.",
}

const WHATSAPP_URL =
  "https://wa.me/6281234567890?text=" +
  encodeURIComponent(
    "Assalamu'alaikum, saya ingin mengajukan peminjaman tempat di Masjid Jami' Ulul Albab UNNES.",
  )

const facilities = [
  {
    name: "Aula Masjid Lantai 1",
    capacity: "±300 orang",
    description:
      "Ruang utama masjid untuk kajian, seminar, dan acara komunitas dengan sound system dan proyektor.",
    icon: IconBuildingMosque,
  },
  {
    name: "Ruang Solat Lantai 2",
    capacity: "±100 orang",
    description:
      "Ruang salat lantai dua untuk kajian, pembinaan, dan kegiatan jamaah dengan kapasitas lebih kecil.",
    icon: IconPray,
  },
]

const steps = [
  {
    title: "Ajukan permohonan",
    description:
      "Hubungi pengurus melalui WhatsApp dan sampaikan tujuan, tanggal, serta jumlah peserta.",
  },
  {
    title: "Konfirmasi jadwal",
    description:
      "Pengurus memeriksa ketersediaan jadwal dan mengonfirmasi slot yang bisa dipakai.",
  },
  {
    title: "Serah terima",
    description:
      "Datang lebih awal untuk serah terima kunci, pengecekan fasilitas, dan pengaturan ruang.",
  },
  {
    title: "Kembalikan & bersihkan",
    description:
      "Setelah acara, rapikan ruangan, kembalikan fasilitas, dan serahkan kunci ke pengurus.",
  },
]

const requirements = [
  "Kegiatan tidak bertentangan dengan syariat dan visi masjid.",
  "Permohonan diajukan maksimal 3 hari sebelum kegiatan.",
  "Panitia bertanggung jawab atas kebersihan dan keutuhan fasilitas.",
  "Kontribusi operasional dibicarakan langsung dengan pengurus.",
]

export default function PeminjamanPage() {
  return (
    <div className="container mx-auto w-full max-w-7xl px-6 pt-8 pb-24 md:pt-12">
      {/* Hero peminjaman */}
      <section className="relative isolate overflow-hidden rounded-3xl border bg-muted px-6 py-10 text-center md:px-10 md:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"
        />

        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">

          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Peminjaman Tempat
          </h1>

          <p className="max-w-xl text-muted-foreground">
            Butuh ruang untuk kajian, seminar, atau kegiatan sosial? Aula
            lantai satu dan ruang salat lantai dua bisa dipinjam untuk kegiatan yang
            bermanfaat bagi jamaah dan masyarakat sekitar.
          </p>

          <div className="flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
            <Link
              href="#fasilitas"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "h-auto w-full justify-center rounded-md border-neutral-300 px-5 py-2 text-sm transition duration-200 hover:-translate-y-0.5 sm:w-auto dark:border-neutral-700",
              )}
            >
              Lihat fasilitas
            </Link>
            <Link
              href="#form-peminjaman"
              className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2 text-sm font-bold text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] transition duration-200 hover:-translate-y-0.5 sm:w-auto"
            >
              Ajukan peminjaman
            </Link>
          </div>

        </div>
      </section>

      {/* Kalender peminjaman */}
      <section id="kalender" className="mt-6 scroll-mt-32 md:mt-10">

        <Card className="gap-0 overflow-hidden py-0">
          <CardContent className="p-0">
            <PeminjamanCalendar anchorIso={new Date().toISOString()} />
          </CardContent>
        </Card>
      </section>

      <section
        id="form-peminjaman"
        className="mt-6 scroll-mt-32 md:mt-10"
      >
        <PeminjamanForm anchorIso={new Date().toISOString()} />
      </section>

      {/* Fasilitas */}
      <section id="fasilitas" className="mt-16 scroll-mt-32 md:mt-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Fasilitas yang bisa dipinjam
          </h2>
          <p className="mt-2 text-muted-foreground">
            Pilih ruang yang paling sesuai dengan kebutuhan kegiatanmu.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {facilities.map((facility) => {
            const Icon = facility.icon
            return (
              <div
                key={facility.name}
                className="flex flex-col gap-4 rounded-xl border bg-muted/40 p-6"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-lg bg-background text-muted-foreground">
                  <Icon className="size-5" />
                </span>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{facility.name}</h3>
                    <span className="rounded-full border bg-background px-2.5 py-0.5 text-xs text-muted-foreground">
                      {facility.capacity}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {facility.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Alur */}
      <section className="mt-16 md:mt-20">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-semibold tracking-tight">
            Alur peminjaman
          </h2>
          <p className="mt-2 text-muted-foreground">
            Empat langkah singkat dari pengajuan sampai pengembalian.
          </p>
        </div>

        <ol className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-xl border p-6">
              <span className="inline-flex size-8 items-center justify-center rounded-full bg-muted text-sm font-semibold">
                {index + 1}
              </span>
              <h3 className="mt-4 font-medium">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Ketentuan + CTA */}
      <section className="mt-16 rounded-2xl border bg-muted/40 p-6 md:mt-20 md:p-10">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">
              Ketentuan singkat
            </h2>
            <ul className="mt-4 flex flex-col gap-3">
              {requirements.map((requirement) => (
                <li
                  key={requirement}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <IconCircleCheck className="mt-0.5 size-4 shrink-0" />
                  {requirement}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-background p-6">
            <h3 className="font-medium">Siap mengajukan?</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Kirim tujuan kegiatan, tanggal, dan perkiraan jumlah peserta.
              Pengurus akan membantu mencarikan jadwal yang cocok.
            </p>
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2 text-sm font-bold text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] transition duration-200 hover:-translate-y-0.5 sm:w-auto"
            >
              <IconBrandWhatsapp className="size-4" />
              Hubungi pengurus
              <IconArrowRight className="size-4" />
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
