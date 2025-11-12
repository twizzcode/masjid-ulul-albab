"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/use-user";
import { LoadingScreen } from "@/components/ui/loading-screen";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarCheck, MessageSquare } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const { user, isLoading } = useUser();

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role !== "ADMIN") {
        router.replace("/");
      }
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="w-full h-full p-4 lg:p-6">
        <div className="w-full h-full max-w-[1400px] mx-auto border rounded-xl overflow-auto">
          <div className="p-6 flex items-center justify-center h-full">
            <LoadingScreen message="Memverifikasi akses admin..." />
          </div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <div className="w-full h-full p-4 lg:p-6">
      <div className="w-full h-full max-w-[1400px] mx-auto border rounded-xl overflow-auto">
        <div className="p-4 lg:p-6">
          <h1 className="text-2xl lg:text-3xl font-bold mb-2">Admin Panel</h1>
          <p className="text-muted-foreground mb-8">
            Pilih menu yang ingin Anda kelola
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 max-w-4xl">
            {/* Peminjaman Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin/bookings")}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <CalendarCheck className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Peminjaman</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Kelola peminjaman ruang dan fasilitas masjid
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={(e) => {
                  e.stopPropagation();
                  router.push("/admin/bookings");
                }}>
                  Buka Peminjaman
                </Button>
              </CardContent>
            </Card>

            {/* Feedback Card */}
            <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => router.push("/admin/feedback")}>
              <CardHeader>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <MessageSquare className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">Feedback</CardTitle>
                </div>
                <CardDescription className="text-base">
                  Lihat dan kelola masukan dari jamaah
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" onClick={(e) => {
                  e.stopPropagation();
                  router.push("/admin/feedback");
                }}>
                  Buka Feedback
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
