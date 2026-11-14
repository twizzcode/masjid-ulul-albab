"use client"

import type { ReactNode } from "react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  Calendar04Icon,
  Comment01Icon,
  DashboardSquare02Icon,
  MoneyReceive01Icon,
  Mosque01Icon,
  Settings02Icon,
  TaskDone01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Link from "next/link"
import { usePathname } from "next/navigation"

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { ADMIN_BOOKINGS } from "@/lib/admin-booking-data"

type NavItem = {
  label: string
  icon: IconSvgElement
  href?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: DashboardSquare02Icon, href: "/admin" },
  { label: "Peminjaman", icon: TaskDone01Icon, href: "/admin/peminjaman" },
  { label: "Aspirasi", icon: Comment01Icon, href: "/admin/aspirasi" },
  { label: "Jadwal", icon: Calendar04Icon },
  { label: "Keuangan", icon: MoneyReceive01Icon },
  { label: "Pengguna", icon: UserMultiple02Icon },
  { label: "Pengaturan", icon: Settings02Icon },
]

const WAITING_BOOKINGS = ADMIN_BOOKINGS.filter(
  (booking) => booking.status === "Menunggu"
).length

function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Masjid Jami' Ulul Albab"
              render={<Link href="/admin" />}
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <HugeiconsIcon icon={Mosque01Icon} strokeWidth={2} />
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-semibold">Ulul Albab</span>
                <span className="block truncate text-xs text-muted-foreground">
                  Panel administrasi
                </span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent role="navigation" aria-label="Navigasi administrasi">
        <SidebarGroup>
          <SidebarGroupLabel>Administrasi</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {NAV_ITEMS.map((item) => {
                const isActive = item.href
                  ? item.href === "/admin"
                    ? pathname === item.href
                    : pathname.startsWith(item.href)
                  : false

                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      isActive={isActive}
                      className="h-9"
                      tooltip={
                        item.href ? item.label : `${item.label} — segera hadir`
                      }
                      disabled={!item.href}
                      render={item.href ? <Link href={item.href} /> : undefined}
                    >
                      <HugeiconsIcon icon={item.icon} strokeWidth={2} />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                    {item.label === "Peminjaman" && WAITING_BOOKINGS > 0 && (
                      <SidebarMenuBadge
                        className="-translate-y-1/2 rounded-full border border-warning/15 bg-warning/10 text-warning-foreground peer-data-[size=default]/menu-button:top-1/2 dark:border-warning/25 dark:bg-warning/15 dark:text-warning"
                        aria-label={`${WAITING_BOOKINGS} peminjaman menunggu`}
                        title={`${WAITING_BOOKINGS} peminjaman menunggu`}
                      >
                        {WAITING_BOOKINGS}
                      </SidebarMenuBadge>
                    )}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator className="mx-0" />
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex h-12 items-center gap-2 overflow-hidden rounded-md p-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">
                AD
              </span>
              <span className="min-w-0 leading-tight">
                <span className="block truncate font-medium">Administrator</span>
                <span className="block truncate text-xs text-muted-foreground">
                  admin@ululalbab.id
                </span>
              </span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function AdminBreadcrumb({
  page,
  parent,
}: {
  page: string
  parent?: { label: string; href: string }
}) {
  if (page === "Dashboard") {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden sm:inline-flex">
          <BreadcrumbLink render={<Link href="/admin" />}>Dashboard</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator className="hidden sm:inline-flex" />
        {parent && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={parent.href} />}>
                {parent.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </>
        )}
        <BreadcrumbItem>
          <BreadcrumbPage>{page}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}

export function AdminShell({
  page,
  parent,
  children,
}: {
  page: string
  parent?: { label: string; href: string }
  children: ReactNode
}) {
  return (
    <TooltipProvider>
      <SidebarProvider className="min-h-svh w-full">
        <AdminSidebar />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-3 border-b px-3 sm:px-5">
            <SidebarTrigger aria-label="Buka atau tutup sidebar" />
            <Separator orientation="vertical" className="h-4" />
            <AdminBreadcrumb page={page} parent={parent} />
          </header>
          {children}
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
