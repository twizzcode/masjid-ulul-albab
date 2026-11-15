"use client"
import {
  DashboardSquare01Icon,
  HistoryIcon,
  Logout01Icon,
} from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { authClient } from "@/lib/auth-client"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useState } from "react"

const navItems = [
  {
    name: "Beranda",
    link: "/",
  },
  {
    name: "Peminjaman",
    link: "/peminjaman",
  },
  {
    name: "Keuangan",
    link: "/keuangan",
  },
  {
    name: "Tentang Kami",
    link: "/tentang-kami",
  },
]

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase()
}

function AccountMenu({ mobile = false }: { mobile?: boolean }) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()

  if (isPending) {
    return (
      <span
        aria-hidden="true"
        className={cn(
          "block animate-pulse rounded-full bg-muted",
          mobile ? "h-10 w-full" : "size-9"
        )}
      />
    )
  }

  if (!session) {
    return (
      <NavbarButton
        as={Link}
        href="/login"
        variant={mobile ? "primary" : "gradient"}
        className={mobile ? "w-full" : undefined}
      >
        Masuk
      </NavbarButton>
    )
  }

  const { user } = session

  async function handleSignOut() {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/")
          router.refresh()
        },
      },
    })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Buka menu akun ${user.name}`}
        className={cn(
          "relative z-20 flex items-center rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring",
          mobile && "w-full gap-3 rounded-lg border p-2 text-left"
        )}
      >
        <Avatar size={mobile ? "lg" : "default"}>
          {user.image && (
            <AvatarImage
              src={user.image}
              alt={user.name}
              keepMounted
              referrerPolicy="no-referrer"
              className="data-[error]:invisible data-[loading]:invisible"
            />
          )}
          <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
        </Avatar>
        {mobile && (
          <span className="min-w-0">
            <span className="block truncate text-sm font-medium">
              {user.name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">
              {user.email}
            </span>
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuGroup>
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
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/riwayat")}>
          <HugeiconsIcon icon={HistoryIcon} strokeWidth={2} />
          Riwayat peminjaman
        </DropdownMenuItem>
        {user.role === "ADMIN" && (
          <DropdownMenuItem onClick={() => router.push("/admin")}>
            <HugeiconsIcon icon={DashboardSquare01Icon} strokeWidth={2} />
            Dashboard admin
          </DropdownMenuItem>
        )}
        <DropdownMenuItem variant="destructive" onClick={handleSignOut}>
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function NavbarDemo() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname.startsWith("/admin")
  )
    return null

  return (
    <Navbar>
      {/* Desktop Navigation */}
      <NavBody>
        <NavbarLogo />
        <NavItems items={navItems} />
        <div className="flex items-center gap-4">
          <AccountMenu />
        </div>
      </NavBody>

      {/* Mobile Navigation */}
      <MobileNav>
        <MobileNavHeader>
          <NavbarLogo />
          <MobileNavToggle
            isOpen={isMobileMenuOpen}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
        </MobileNavHeader>

        <MobileNavMenu
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        >
          {navItems.map((item, idx) => (
            <Link
              key={`mobile-link-${idx}`}
              href={item.link}
              onClick={() => setIsMobileMenuOpen(false)}
              className="relative text-neutral-600 dark:text-neutral-300"
            >
              <span className="block">{item.name}</span>
            </Link>
          ))}
          <div className="flex w-full flex-col gap-4">
            <AccountMenu mobile />
          </div>
        </MobileNavMenu>
      </MobileNav>
    </Navbar>
  )
}
