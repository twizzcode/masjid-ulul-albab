"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, MapPin, User, FileText, Phone, Building2, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState } from "react";

interface Booking {
  id: string;
  contactName: string;
  contactPhone: string;
  organizerName: string;
  eventName: string;
  location: string;
  startDate: Date;
  endDate: Date;
  letterFileName: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  adminNote?: string;
}

// Data dummy untuk testing
const dummyBookings: Booking[] = [
  {
    id: "1",
    contactName: "Ahmad Fauzi",
    contactPhone: "081234567890",
    organizerName: "UKKI UNNES",
    eventName: "Kajian Rutin Bulanan",
    location: "aula-lantai-1",
    startDate: new Date(2025, 9, 25, 13, 0), // 25 Oct 2025, 13:00
    endDate: new Date(2025, 9, 25, 15, 0), // 25 Oct 2025, 15:00
    letterFileName: "surat-peminjaman-ukki.pdf",
    status: "approved",
    createdAt: new Date(2025, 9, 20),
  },
  {
    id: "2",
    contactName: "Ahmad Fauzi",
    contactPhone: "081234567890",
    organizerName: "HIMA Matematika",
    eventName: "Workshop Machine Learning",
    location: "aula-lantai-2",
    startDate: new Date(2025, 10, 5, 9, 0), // 5 Nov 2025, 09:00
    endDate: new Date(2025, 10, 5, 16, 0), // 5 Nov 2025, 16:00
    letterFileName: "surat-peminjaman-hima.pdf",
    status: "pending",
    createdAt: new Date(2025, 9, 23),
  },
  {
    id: "3",
    contactName: "Ahmad Fauzi",
    contactPhone: "081234567890",
    organizerName: "UKM Penelitian",
    eventName: "Seminar Nasional",
    location: "aula-lantai-1",
    startDate: new Date(2025, 9, 15, 8, 0), // 15 Oct 2025, 08:00
    endDate: new Date(2025, 9, 15, 17, 0), // 15 Oct 2025, 17:00
    letterFileName: "surat-peminjaman-ukm.pdf",
    status: "rejected",
    createdAt: new Date(2025, 9, 10),
    adminNote: "Jadwal bertabrakan dengan kegiatan lain. Silakan ajukan jadwal alternatif.",
  },
];

export default function PeminjamanSayaPage() {
  const [bookings] = useState<Booking[]>(dummyBookings);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const getStatusBadge = (status: Booking["status"]) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800">Menunggu Persetujuan</Badge>;
      case "approved":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800">Disetujui</Badge>;
      case "rejected":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800">Ditolak</Badge>;
    }
  };

  const getLocationName = (location: string) => {
    switch (location) {
      case "aula-lantai-1":
        return "Aula Lantai 1";
      case "aula-lantai-2":
        return "Aula Lantai 2";
      default:
        return location;
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Peminjaman Saya</h1>
        <p className="text-muted-foreground">
          Kelola dan pantau status peminjaman tempat Anda
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* List Peminjaman */}
        <div className="lg:col-span-2 space-y-4">
          {bookings.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">Belum Ada Peminjaman</p>
                <p className="text-sm text-muted-foreground text-center">
                  Anda belum memiliki riwayat peminjaman tempat
                </p>
                <Button className="mt-4" onClick={() => window.location.href = "/pinjam"}>
                  Ajukan Peminjaman
                </Button>
              </CardContent>
            </Card>
          ) : (
            bookings.map((booking) => (
              <Card
                key={booking.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  selectedBooking?.id === booking.id ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedBooking(booking)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{booking.eventName}</CardTitle>
                      <CardDescription className="flex items-center gap-1 text-xs">
                        <Building2 className="h-3 w-3" />
                        {booking.organizerName}
                      </CardDescription>
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>{getLocationName(booking.location)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(booking.startDate, "dd MMMM yyyy", { locale: id })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {format(booking.startDate, "HH:mm", { locale: id })} - {format(booking.endDate, "HH:mm", { locale: id })}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-2">
                    <p className="text-xs text-muted-foreground">
                      Diajukan {format(booking.createdAt, "dd MMM yyyy", { locale: id })}
                    </p>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Detail Peminjaman */}
        <div className="lg:col-span-1">
          {selectedBooking ? (
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg">Detail Peminjaman</CardTitle>
                <CardDescription>Informasi lengkap peminjaman</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Status */}
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Status</p>
                  {getStatusBadge(selectedBooking.status)}
                </div>

                {/* Admin Note jika ada */}
                {selectedBooking.adminNote && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-xs font-semibold mb-1">Catatan Admin</p>
                    <p className="text-xs text-muted-foreground">{selectedBooking.adminNote}</p>
                  </div>
                )}

                <div className="border-t pt-4 space-y-3">
                  {/* Narahubung */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Narahubung</p>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{selectedBooking.contactName}</p>
                    </div>
                  </div>

                  {/* Kontak */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Kontak</p>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{selectedBooking.contactPhone}</p>
                    </div>
                  </div>

                  {/* Penyelenggara */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Penyelenggara</p>
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{selectedBooking.organizerName}</p>
                    </div>
                  </div>

                  {/* Nama Kegiatan */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Nama Kegiatan</p>
                    <p className="text-sm font-medium">{selectedBooking.eventName}</p>
                  </div>

                  {/* Lokasi */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Lokasi</p>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">{getLocationName(selectedBooking.location)}</p>
                    </div>
                  </div>

                  {/* Tanggal */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tanggal</p>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {format(selectedBooking.startDate, "dd MMMM yyyy", { locale: id })}
                      </p>
                    </div>
                  </div>

                  {/* Waktu */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Waktu</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">
                        {format(selectedBooking.startDate, "HH:mm", { locale: id })} - {format(selectedBooking.endDate, "HH:mm", { locale: id })}
                      </p>
                    </div>
                  </div>

                  {/* Surat Peminjaman */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Surat Peminjaman</p>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium truncate">{selectedBooking.letterFileName}</p>
                    </div>
                  </div>

                  {/* Tanggal Pengajuan */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Tanggal Pengajuan</p>
                    <p className="text-sm font-medium">
                      {format(selectedBooking.createdAt, "dd MMMM yyyy, HH:mm", { locale: id })}
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t pt-4 space-y-2">
                  {selectedBooking.status === "pending" && (
                    <Button variant="outline" className="w-full" size="sm">
                      Batalkan Peminjaman
                    </Button>
                  )}
                  {selectedBooking.status === "rejected" && (
                    <Button className="w-full" size="sm" onClick={() => window.location.href = "/pinjam"}>
                      Ajukan Ulang
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="sticky top-6">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-sm text-muted-foreground text-center">
                  Pilih peminjaman untuk melihat detail
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
