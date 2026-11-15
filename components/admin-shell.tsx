"use client"

import { useState } from "react"
import type { ReactNode } from "react"
import type { IconSvgElement } from "@hugeicons/react"
import {
  Comment01Icon,
  DashboardSquare02Icon,
  Home01Icon,
  InformationCircleIcon,
  Logout01Icon,
  MoneyReceive01Icon,
  TaskDone01Icon,
  UserCircleIcon,
  UserMultiple02Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import Image from "next/image"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
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
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
import { ScrollReveal } from "@/components/scroll-reveal"
import { authClient } from "@/lib/auth-client"

type NavItem = {
  label: string
  icon: IconSvgElement
  href?: string
}

const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", icon: DashboardSquare02Icon, href: "/admin" },
  { label: "Peminjaman", icon: TaskDone01Icon, href: "/admin/peminjaman" },
  { label: "Aspirasi", icon: Comment01Icon, href: "/admin/aspirasi" },
  {
    label: "Keuangan",
    icon: MoneyReceive01Icon,
    href: "/admin/keuangan",
  },
  { label: "Pengguna", icon: UserMultiple02Icon, href: "/admin/pengguna" },
]

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function UserAvatar({
  user,
  size,
}: {
  user: { name: string; image?: string | null }
  size?: "sm" | "default" | "lg"
}) {
  return (
    <Avatar size={size}>
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
  )
}

function SidebarUserMenu() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [showAccount, setShowAccount] = useState(false)

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
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          aria-label={`Buka menu akun ${user.name}`}
          className="flex h-12 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left transition-colors outline-none group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          <UserAvatar user={user} />
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
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-2 py-2">
              <UserAvatar user={user} size="sm" />
              <span className="min-w-0">
                <span className="block truncate text-sm text-foreground">
                  {user.name}
                </span>
                <span className="block truncate font-normal">{user.email}</span>
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setShowAccount(true)}>
            <HugeiconsIcon icon={UserCircleIcon} strokeWidth={2} />
            Info akun
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push("/")}>
            <HugeiconsIcon icon={Home01Icon} strokeWidth={2} />
            Kembali ke beranda
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
            <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Dialog open={showAccount} onOpenChange={setShowAccount}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Info akun</DialogTitle>
            <DialogDescription>
              Detail akun yang sedang masuk ke panel admin.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="lg" />
            <div className="min-w-0">
              <p className="truncate font-medium">{user.name}</p>
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <dl className="flex items-center justify-between gap-4 text-sm">
            <dt className="text-muted-foreground">Peran</dt>
            <dd className="flex items-center gap-2 font-medium">
              <HugeiconsIcon
                icon={InformationCircleIcon}
                strokeWidth={2}
                className="size-4"
              />
              {user.role === "ADMIN" ? "Administrator" : "Pengguna"}
            </dd>
          </dl>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>
              Tutup
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function AdminSidebar({ waitingBookings }: { waitingBookings: number }) {
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
                    {item.label === "Peminjaman" && waitingBookings > 0 && (
                      <SidebarMenuBadge
                        className="-translate-y-1/2 rounded-full border border-warning/15 bg-warning/10 text-warning-foreground peer-data-[size=default]/menu-button:top-1/2 dark:border-warning/25 dark:bg-warning/15 dark:text-warning"
                        aria-label={`${waitingBookings} peminjaman menunggu`}
                        title={`${waitingBookings} peminjaman menunggu`}
                      >
                        {waitingBookings}
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
  waitingBookings = 0,
}: {
  page: string
  parent?: { label: string; href: string }
  children: ReactNode
  waitingBookings?: number
}) {
  return (
    <TooltipProvider>
      <style>{`
        body:has([data-admin-shell]) [data-slot="button"][data-variant="default"] {
          background-image: linear-gradient(to bottom, var(--color-blue-500), var(--color-blue-700));
          color: white;
          font-weight: 700;
          box-shadow: 0 2px 0 0 rgb(255 255 255 / 30%) inset;
        }

        body:has([data-admin-shell]) [data-slot="button"][data-variant="default"]:hover {
          background-image: linear-gradient(to bottom, var(--color-blue-500), var(--color-blue-800));
        }
      `}</style>
      <SidebarProvider data-admin-shell className="min-h-svh w-full">
        <AdminSidebar waitingBookings={waitingBookings} />
        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-3 border-b px-3 sm:px-5">
            <SidebarTrigger aria-label="Buka atau tutup sidebar" />
            <Separator orientation="vertical" className="h-4" />
            <AdminBreadcrumb page={page} parent={parent} />
          </header>
          <ScrollReveal>{children}</ScrollReveal>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
