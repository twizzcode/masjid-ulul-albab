"use client";

import React, { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, FileText, SquarePlus, CalendarRange, LucideIcon, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import NavUser from "@/components/navbar/navuser";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/jadwal", label: "Jadwal", icon: CalendarRange },
  { href: "/pinjam", label: "Pinjam", icon: SquarePlus },
];

interface SidebarLinkProps {
  item: NavItem;
  isActive: boolean;
}

const SidebarLink = memo(({ item, isActive }: SidebarLinkProps) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200",
        isActive 
          ? "bg-foreground text-background" 
          : "text-foreground hover:bg-muted"
      )}
    >
      <Icon className="w-5 h-5" />
      <span className="font-medium">{item.label}</span>
    </Link>
  );
});

SidebarLink.displayName = "SidebarLink";

function SidebarComponent() {
  const pathname = usePathname();
  const { isAdmin } = useUser();

  return (
    <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-64 border-r border-border bg-background flex-col">
      {/* Logo/Brand */}
      <div className="h-15 flex items-center px-6 border-b border-border">
        <h1 className="text-lg font-bold">Masjid Ulul Albab</h1>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <SidebarLink
            key={item.href}
            item={item}
            isActive={pathname === item.href}
          />
        ))}

        {isAdmin ? (
          <SidebarLink
            item={{ href: "/admin", label: "Admin", icon: Shield }}
            isActive={pathname.startsWith("/admin")}
          />
        ) : (
          <SidebarLink
            item={{ href: "/riwayat", label: "Riwayat", icon: FileText }}
            isActive={pathname === "/riwayat"}
          />
        )}
      </nav>

      {/* User Profile at Bottom - Using NavUser component */}
      <div className="p-4 border-t border-border">
        <NavUser />
      </div>
    </aside>
  );
}

export default memo(SidebarComponent);
