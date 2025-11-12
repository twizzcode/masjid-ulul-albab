"use client";

import React, { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { House, FileText, SquarePlus, CalendarRange, LucideIcon, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/hooks/use-user";
import NavUser from "./navuser";

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  hideLabel?: boolean;
  isFAB?: boolean;
}

const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: House },
  { href: "/jadwal", label: "Jadwal", icon: CalendarRange },
  { href: "/pinjam", label: "Pinjam", icon: SquarePlus },
];

interface NavLinkItemProps {
  item: NavItem;
  isActive: boolean;
}

const NavLinkItem = memo(({ item, isActive }: NavLinkItemProps) => {
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-xl transition-all duration-200 flex-1",
        isActive && "bg-foreground"
      )}
      aria-label={item.label}
    >
      <Icon
        className={cn(
          "w-5 h-5 transition-colors",
          isActive ? "text-background" : "text-foreground"
        )}
      />
      {!item.hideLabel && (
        <span
          className={cn(
            "text-[10px] font-medium transition-colors",
            isActive ? "text-background" : "text-foreground"
          )}
        >
          {item.label}
        </span>
      )}
    </Link>
  );
});

NavLinkItem.displayName = "NavLinkItem";

function NavbarComponents() {
  const pathname = usePathname();
  const { isAdmin } = useUser();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 h-18 rounded-t-2xl border-t border-border bg-background/95 backdrop-blur-sm shadow-lg z-50">
      <div className="flex items-center justify-around h-full px-2 gap-1">
        {navItems.map((item) => (
          <NavLinkItem
            key={item.href}
            item={item}
            isActive={pathname === item.href}
          />
        ))}

        {isAdmin ? (
          <NavLinkItem
            item={{ href: "/admin", label: "Admin", icon: Shield }}
            isActive={pathname.startsWith("/admin")}
          />
        ) : (
          <NavLinkItem
            item={{ href: "/riwayat", label: "Riwayat", icon: FileText }}
            isActive={pathname === "/riwayat"}
          />
        )}
        <NavUser />
      </div>
    </nav>
  );
}

export default memo(NavbarComponents);