import {
  IconArrowRight,
  IconBrandInstagram,
  IconBrandWhatsapp,
  IconMail,
  IconMessageCircle,
} from "@tabler/icons-react"

import { HeroSlideshow } from "@/components/hero-slideshow"
import { PrayerSchedule, type PrayerItem } from "@/components/prayer-schedule"
import { getPrayerTimes } from "@/lib/prayer-times"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: { absolute: "Masjid Jami' Ulul Albab UNNES" },
  description:
    "Portal resmi Masjid Jami' Ulul Albab Universitas Negeri Semarang untuk jadwal salat, kegiatan, layanan, dan informasi jamaah.",
  alternates: { canonical: "/" },
}

export default async function Page() {
  const schedule = await getPrayerTimes()

  const prayers: PrayerItem[] = [
    { name: "Subuh", time: schedule.subuh },
    { name: "Dzuhur", time: schedule.dzuhur },
    { name: "Ashar", time: schedule.ashar },
    { name: "Maghrib", time: schedule.maghrib },
    { name: "Isya", time: schedule.isya },
  ]

  return (
    <div className="container mx-auto w-full max-w-7xl px-3 pt-7 pb-24 sm:px-6 md:pt-9 lg:pt-10 xl:pt-12">
      {/* Hero */}
      <section
        id="beranda"
        className="grid scroll-mt-32 gap-10 lg:grid-cols-5 lg:items-stretch lg:gap-8 xl:min-h-[65vh]"
      >
        <div className="flex flex-col gap-10 lg:col-span-3 lg:h-full xl:justify-between">
          <div className="flex flex-col items-center gap-6 text-center lg:items-start lg:text-left">
            <span className="rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
              Assalamu&rsquo;alaikum warahmatullahi wabarakatuh!
            </span>
            <h1 className="text-4xl font-bold md:text-5xl">
              Masjid Jami&apos; Ulul Albab Universitas Negeri Semarang
            </h1>
            <p className="max-w-xl text-muted-foreground">
              Lebih dari tempat ibadah, Masjid Ulul Albab UNNES adalah ruang
              bertumbuh untuk memperdalam ilmu, iman, dan ukhuwah. Jelajahi
              berbagai layanan dan kajian inspiratif dalam satu platform.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <Link
                href="/peminjaman"
                className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2 text-sm font-bold text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] transition duration-200 hover:-translate-y-0.5 sm:w-auto"
              >
                Peminjaman Tempat
                <IconArrowRight className="size-4" />
              </Link>
            </div>
          </div>
          <div className="flex flex-col items-center gap-4 text-center lg:items-start lg:text-left">
            <p className="max-w-sm text-sm text-muted-foreground">
              Dikelola oleh{" "}
              <span className="font-medium text-foreground">
                Takmir Masjid Jami&apos; Ulul Albab
              </span>{" "}
              dan{" "}
              <span className="font-medium whitespace-nowrap text-foreground">
                Al-Husna Ilkom UNNES
              </span>
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <a
                href="https://wa.me/6281234567890"
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="inline-flex size-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconBrandWhatsapp className="size-5" />
              </a>
              <a
                href="https://instagram.com/masjidululalbab"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="inline-flex size-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconBrandInstagram className="size-5" />
              </a>
              <a
                href="mailto:pengurus@masjidululalbab.id"
                aria-label="Email"
                className="inline-flex size-9 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconMail className="size-5" />
              </a>
              <Link
                href="/aspirasi"
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <IconMessageCircle aria-hidden="true" className="size-5" />
                Saran &amp; Masukan
              </Link>
            </div>
          </div>
        </div>

        <div className="relative min-h-[220px] sm:min-h-[280px] md:min-h-[320px] lg:col-span-2 lg:min-h-0">
          <div className="h-full overflow-hidden rounded-xl border">
            <HeroSlideshow />
          </div>
        </div>
      </section>

      {/* Jadwal azan & shalat */}
      <section
        id="jadwal"
        className="mt-16 scroll-mt-32 bg-muted py-16 shadow-[0_0_0_100vmax_var(--muted)] [clip-path:inset(0_-100vmax)] md:mt-24 md:py-20"
      >
        <div className="flex flex-col items-center gap-3 text-center">
          <h2 className="text-3xl font-semibold tracking-tight">
            Jadwal Azan &amp; Shalat
          </h2>
          <p className="text-sm text-muted-foreground">
            {schedule.locationLabel} · Waktu Indonesia Barat (WIB)
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
              {schedule.dateLabel}
            </span>
            {schedule.hijriLabel ? (
              <span className="rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
                {schedule.hijriLabel}
              </span>
            ) : null}
          </div>
        </div>

        <PrayerSchedule
          prayers={prayers}
          imsak={schedule.imsak}
          syuruq={schedule.syuruq}
        />

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Sumber: Aladhan API · metode Kemenag RI.
          {schedule.isFallback
            ? " Data sementara ditampilkan karena API tidak dapat dihubungi."
            : " Jadwal diperbarui otomatis setiap jam."}
        </p>
      </section>
    </div>
  )
}
