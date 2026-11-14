import { Geist_Mono, Inter } from "next/font/google"

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
