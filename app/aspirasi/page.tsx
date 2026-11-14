import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"

import { AspirationForm } from "@/components/aspiration-form"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Kotak Aspirasi — Masjid Jami' Ulul Albab UNNES",
  description:
    "Sampaikan saran, kritik, dan masukan untuk Masjid Jami' Ulul Albab UNNES.",
}

export default function AspirationPage() {
  return (
    <div className="container mx-auto w-full max-w-7xl px-3 pt-8 pb-24 sm:px-6 md:pt-12">
      <section className="relative isolate overflow-hidden rounded-3xl border bg-muted px-6 py-10 text-center md:px-10 md:py-14">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-40 left-1/2 -z-10 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl"
        />

        <div className="mx-auto flex max-w-2xl flex-col items-center gap-5">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Saran &amp; Masukan
          </h1>
          <p className="max-w-xl text-muted-foreground">
            Suara Anda membantu kami meningkatkan pelayanan, kegiatan, dan
            kenyamanan Masjid Jami&apos; Ulul Albab bagi seluruh jamaah.
          </p>
          <Link
            href="#form-aspirasi"
            className="inline-flex w-full items-center justify-center rounded-md bg-gradient-to-b from-blue-500 to-blue-700 px-5 py-2 text-sm font-bold text-white shadow-[0px_2px_0px_0px_rgba(255,255,255,0.3)_inset] transition duration-200 hover:-translate-y-0.5 sm:w-auto"
          >
            Sampaikan aspirasi
          </Link>
        </div>
      </section>

      <section id="form-aspirasi" className="mt-6 scroll-mt-32 md:mt-10">
        <Card className="grid gap-0 py-0 lg:grid-cols-2">
          <div className="relative min-h-72 overflow-hidden lg:min-h-full">
            <Image
              src="/hero/masjid-5.jpeg"
              alt="Jamaah berkumpul di halaman Masjid Jami' Ulul Albab UNNES"
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
            />
          </div>
          <AspirationForm />
        </Card>
      </section>
    </div>
  )
}
