import { Geist_Mono, Inter } from "next/font/google"
import type { Metadata } from "next"

import "./globals.css"
import NavbarDemo from "@/components/resizable-navbar-demo"
import { SiteFooter } from "@/components/site-footer"
import { SiteMain } from "@/components/site-main"
import { ThemeProvider } from "@/components/theme-provider"
import { cn } from "@/lib/utils"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

const siteUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Masjid Jami' Ulul Albab UNNES",
    template: "%s | Masjid Jami' Ulul Albab UNNES",
  },
  description:
    "Informasi kegiatan, peminjaman tempat, aspirasi, dan keuangan Masjid Jami' Ulul Albab Universitas Negeri Semarang.",
  applicationName: "Masjid Jami' Ulul Albab UNNES",
  keywords: [
    "Masjid Jami' Ulul Albab",
    "Masjid UNNES",
    "Universitas Negeri Semarang",
    "peminjaman tempat masjid",
  ],
  authors: [{ name: "Masjid Jami' Ulul Albab UNNES" }],
  creator: "Masjid Jami' Ulul Albab UNNES",
  publisher: "Masjid Jami' Ulul Albab UNNES",
  formatDetection: { email: false, address: false, telephone: false },
  icons: { icon: "/favicon.ico" },
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Masjid Jami' Ulul Albab UNNES",
    title: "Masjid Jami' Ulul Albab UNNES",
    description:
      "Informasi kegiatan, peminjaman tempat, aspirasi, dan keuangan Masjid Jami' Ulul Albab Universitas Negeri Semarang.",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Masjid Jami' Ulul Albab UNNES",
    description:
      "Informasi kegiatan, peminjaman tempat, aspirasi, dan keuangan Masjid Jami' Ulul Albab Universitas Negeri Semarang.",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="id"
      suppressHydrationWarning
      className={cn(
        "antialiased",
        fontMono.variable,
        "font-sans",
        inter.variable
      )}
    >
      <body className="flex min-h-svh flex-col">
        <ThemeProvider>
          <NavbarDemo />
          <SiteMain>{children}</SiteMain>
          <SiteFooter />
        </ThemeProvider>
      </body>
    </html>
  )
}
