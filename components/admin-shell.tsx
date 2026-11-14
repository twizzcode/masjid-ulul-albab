"use client"

import type { ReactNode } from "react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  Calendar04Icon,
  Comment01Icon,
  DashboardSquare02Icon,
  Logout01Icon,
  MoneyReceive01Icon,
  Settings02Icon,
  TaskDone01Icon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { authClient } from "@/lib/auth-client"
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

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function SidebarUserMenu() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <div className="flex h-12 items-center gap-2 overflow-hidden rounded-md p-2 group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-0">
        <span className="size-8 shrink-0 animate-pulse rounded-full bg-muted" />
        <span className="min-w-0 flex-1 space-y-1.5 group-data-[collapsible=icon]:hidden">
          <span className="block h-3 w-24 animate-pulse rounded bg-muted" />
          <span className="block h-3 w-32 animate-pulse rounded bg-muted" />
        </span>
      </div>
    )
  }

  if (!session) return null

  const { user } = session

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login")
          router.refresh()
        },
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Buka menu akun ${user.name}`}
        className="flex h-12 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left transition-colors outline-none group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
      >
        <Avatar>
          {user.image && (
            <AvatarImage
              src={user.image}
              alt=""
              keepMounted
              referrerPolicy="no-referrer"
              className="data-[error]:invisible data-[loading]:invisible"
            />
          )}
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        <span className="min-w-0 leading-tight group-data-[collapsible=icon]:hidden">
          <span className="block truncate text-sm font-medium">
            {user.name}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {user.email}
          </span>
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="w-64">
        <DropdownMenuLabel className="flex items-center gap-2 py-2">
          <Avatar size="sm">
            {user.image && (
              <AvatarImage
                src={user.image}
                alt=""
                keepMounted
                referrerPolicy="no-referrer"
                className="data-[error]:invisible data-[loading]:invisible"
              />
            )}
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <span className="min-w-0">
            <span className="block truncate text-sm text-foreground">
              {user.name}
            </span>
            <span className="block truncate font-normal">{user.email}</span>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

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
              <Image
                src="/favicon.ico"
                alt=""
                width={32}
                height={32}
                className="size-8 shrink-0 rounded-lg"
              />
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
            <SidebarUserMenu />
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
          <BreadcrumbLink render={<Link href="/admin" />}>
            Dashboard
          </BreadcrumbLink>
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
