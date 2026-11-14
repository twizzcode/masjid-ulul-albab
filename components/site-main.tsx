"use client"

import { usePathname } from "next/navigation"

export function SiteMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  if (pathname.startsWith("/admin")) {
    return <div className="flex flex-1">{children}</div>
  }

  return <main className="flex-1">{children}</main>
}
