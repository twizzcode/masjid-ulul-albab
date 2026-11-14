"use client"

import {
  Call02Icon,
  InstagramIcon,
  Location01Icon,
  Mail01Icon,
  WhatsappIcon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname } from "next/navigation"

const navigation = [
  { label: "Beranda", href: "/" },
  { label: "Peminjaman", href: "/peminjaman" },
  { label: "Keuangan", href: "/keuangan" },
  { label: "Tentang Kami", href: "/tentang-kami" },
]

const contacts = [
  {
    label:
      "Jl. Taman Siswa No.97, Sekaran, Kec. Gn. Pati, Kota Semarang, Jawa Tengah 50229",
    href: "https://maps.google.com/?q=Jl.+Taman+Siswa+No.97,+Sekaran,+Semarang,+Jawa+Tengah+50229",
    icon: Location01Icon,
  },
  {
    label: "+62 888-0946-1469",
    href: "tel:+6288809461469",
    icon: Call02Icon,
  },
  {
    label: "masjidululalbabunnes@gmail.com",
    href: "mailto:masjidululalbabunnes@gmail.com",
    icon: Mail01Icon,
  },
]

export function SiteFooter() {
  const pathname = usePathname()

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/admin")
  )
    return null

  return (
    <footer className="overflow-hidden bg-neutral-950 text-neutral-50">
      <div className="container mx-auto w-full max-w-7xl px-3 pt-12 sm:px-6 md:pt-16">
        <div className="grid gap-10 border-b border-neutral-800 pb-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="flex flex-col gap-5 lg:col-span-5">
            <Link
              href="/"
              className="flex w-fit items-center gap-3 font-semibold"
            >
              <Image src="/favicon.ico" alt="" width={40} height={40} />
              <span>Masjid Jami&apos; Ulul Albab</span>
            </Link>
            <p className="max-w-xl text-sm leading-relaxed text-neutral-400">
              Lebih dari sekadar tempat ibadah, Masjid Ulul Albab merupakan
              ruang bertumbuh bagi sivitas akademika UNNES untuk memperdalam
              ilmu, memperkuat iman, dan membangun ukhuwah. Jelajahi berbagai
              layanan, kajian, dan program yang menginspirasi dalam satu
              platform.
            </p>
            <div className="flex items-center gap-2">
              <a
                href="https://instagram.com/masjidululalbab"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram Masjid Ulul Albab"
                className="inline-flex size-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-50"
              >
                <HugeiconsIcon icon={InstagramIcon} strokeWidth={2} />
              </a>
              <a
                href="https://wa.me/6288809461469"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp Masjid Ulul Albab"
                className="inline-flex size-9 items-center justify-center rounded-full border border-neutral-700 text-neutral-400 transition-colors hover:border-neutral-500 hover:text-neutral-50"
              >
                <HugeiconsIcon icon={WhatsappIcon} strokeWidth={2} />
              </a>
            </div>
          </div>

          <div className="flex flex-col gap-4 lg:col-span-4">
            <h2 className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              Kontak
            </h2>
            <address className="flex flex-col gap-3 text-sm text-neutral-400 not-italic">
              {contacts.map((contact) => (
                <a
                  key={contact.label}
                  href={contact.href}
                  target={
                    contact.href.startsWith("http") ? "_blank" : undefined
                  }
                  rel={
                    contact.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="flex items-start gap-2.5 transition-colors hover:text-neutral-50"
                >
                  <HugeiconsIcon
                    aria-hidden="true"
                    icon={contact.icon}
                    strokeWidth={2}
                    className="mt-0.5 size-4 shrink-0"
                  />
                  <span>{contact.label}</span>
                </a>
              ))}
            </address>
          </div>

          <nav aria-label="Navigasi footer" className="lg:col-span-3">
            <h2 className="text-xs font-semibold tracking-wider text-neutral-300 uppercase">
              Jelajahi
            </h2>
            <ul className="mt-4 flex flex-col gap-3 text-sm text-neutral-400">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="transition-colors hover:text-neutral-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="flex flex-col gap-2 py-6 text-xs text-neutral-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Masjid Jami&apos; Ulul Albab UNNES.</p>
          <p>Dikelola untuk jamaah dan sivitas akademika UNNES.</p>
        </div>

        <p
          aria-hidden="true"
          className="-mb-[0.18em] text-center text-[clamp(3rem,10vw,8.5rem)] leading-none font-semibold tracking-[-0.06em] whitespace-nowrap text-neutral-800 select-none"
        >
          MASJID ULUL ALBAB
        </p>
      </div>
    </footer>
  )
}
