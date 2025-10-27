"use client";

import React from "react";
import { usePathname } from "next/navigation";

const FooterComponent = () => {
  const pathname = usePathname();

  const getPageTitle = () => {
    switch (pathname) {
      case "/":
        return "Home";
      case "/jadwal":
        return "Calendar";
      case "/pinjam":
        return "Pinjam Aula";
      case "/riwayat":
        return "Riwayat Peminjaman";
      case "/admin":
        return "Admin Dashboard";
      case "/profile":
        return "Profile";
      default:
        return "Masjid Ulul Albab";
    }
  };

  return (
    <footer className="hidden lg:flex fixed bottom-0 left-64 right-0 h-15 items-center justify-between px-6 border-t border-border bg-background">
      <p className="text-sm text-muted-foreground">
        © 2025 Masjid Ulul Albab. All rights reserved.
      </p>
      <p className="text-sm text-muted-foreground">
        {getPageTitle()}
      </p>
    </footer>
  );
};

export default FooterComponent;
