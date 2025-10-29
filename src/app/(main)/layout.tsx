import type { Metadata } from "next";

import NavBar from "@/components/navbar/navbar";
import Header from "@/components/header/header";
import Sidebar from "@/components/sidebar/sidebar";
import Footer from "@/components/footer/footer";

export const metadata: Metadata = {
  title: "Masjid Ulul Albab",
  description: "Management System for Masjid Ulul Albab",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-dvh">
      {/* Mobile: Bottom Navbar */}
      <NavBar />
      
      {/* Top Header (Mobile & Desktop) */}
      <Header />
      
      {/* Desktop: Left Sidebar */}
      <Sidebar />
      
      {/* Desktop: Bottom Footer */}
      <Footer />
      
      {/* Main Content Area */}
      <main className="
        fixed top-15 bottom-18 left-0 right-0 flex
        lg:top-15 lg:bottom-15 lg:left-64 lg:right-0
      ">
        <div className="w-full h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
