"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar,
  MapPin,
  Building2,
  Loader2,
  FileText,
  Eye,
  Archive,
  ListChecks,
  AlertCircle,
} from "lucide-react";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Booking {
	id: string;
	contactName: string;
	contactPhone: string;
	organizerName: string;
	eventName: string;
	location: string;
	startDate: string;
	endDate: string;
	letterFileName: string;
	letterUrl?: string;
	status: "pending" | "approved" | "rejected";
	createdAt: string;
	rejectionReason?: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
}

export default function AdminBookingsPage() {
  const [ongoingBookings, setOngoingBookings] = useState<Booking[]>([]);
  const [archivedBookings, setArchivedBookings] = useState<Booking[]>([]);
  const [isLoadingOngoing, setIsLoadingOngoing] = useState(false);
  const [isLoadingArchived, setIsLoadingArchived] = useState(false);
  const [activeTab, setActiveTab] = useState<"ongoing" | "archived">("ongoing");
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  // Reject dialog state
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectBookingId, setRejectBookingId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const router = useRouter();
  const { user, isLoading: userLoading } = useUser();

  // Redirect non-admin users immediately
  useEffect(() => {
    if (!userLoading && user) {
      if (user.role !== "ADMIN") {
        router.replace('/');
      }
    }
  }, [user, userLoading, router]);

  useEffect(() => {
    if (user && user.role === "ADMIN" && activeTab === "ongoing" && ongoingBookings.length === 0) {
      fetchBookings("ongoing");
    }
  }, [user, activeTab]);

  useEffect(() => {
    if (user && user.role === "ADMIN" && activeTab === "archived" && archivedBookings.length === 0) {
      fetchBookings("archived");
    }
  }, [user, activeTab]);

  const fetchBookings = async (type: "ongoing" | "archived") => {
    try {
      if (type === "ongoing") setIsLoadingOngoing(true);
      else setIsLoadingArchived(true);

      const response = await fetch(`/api/admin/bookings?type=${type}`);
      
      if (!response.ok) {
        if (response.status === 403) {
          toast.error("Akses ditolak. Anda bukan admin.");
          return;
        }
        throw new Error("Failed to fetch bookings");
      }

      const data = await response.json();
      if (type === "ongoing") setOngoingBookings(data.bookings);
      else setArchivedBookings(data.bookings);
    } catch (error) {
      console.error("Fetch bookings error:", error);
      toast.error("Gagal memuat data peminjaman");
    } finally {
      if (type === "ongoing") setIsLoadingOngoing(false);
      else setIsLoadingArchived(false);
    }
  };

  const handleApprove = async (bookingId: string) => {
    try {
      setProcessingId(bookingId);
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });

      if (!response.ok) throw new Error("Failed to approve booking");

      toast.success("Pengajuan disetujui!");
      // Refresh both tabs
      await fetchBookings("ongoing");
      await fetchBookings("archived");
    } catch (error) {
      console.error("Approve error:", error);
      toast.error("Gagal menyetujui pengajuan");
    } finally {
      setProcessingId(null);
    }
  };

  const openRejectDialog = (bookingId: string) => {
    setRejectBookingId(bookingId);
    setRejectionReason("");
    setShowRejectDialog(true);
  };

  const handleReject = async () => {
    if (!rejectBookingId || !rejectionReason.trim()) {
      toast.error("Alasan penolakan harus diisi");
      return;
    }
    
    try {
      setProcessingId(rejectBookingId);
      const response = await fetch(`/api/admin/bookings/${rejectBookingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "rejected", rejectionReason: rejectionReason.trim() }),
      });

      if (!response.ok) throw new Error("Failed to reject booking");

      toast.success("Pengajuan ditolak");
      setShowRejectDialog(false);
      setRejectBookingId(null);
      setRejectionReason("");
      // Refresh both tabs
      await fetchBookings("ongoing");
      await fetchBookings("archived");
    } catch (error) {
      console.error("Reject error:", error);
      toast.error("Gagal menolak pengajuan");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: Booking["status"]) => {
    const badges = {
      pending: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><Clock className="w-3 h-3 mr-1" /> Pending</Badge>,
      approved: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="w-3 h-3 mr-1" /> Disetujui</Badge>,
      rejected: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" /> Ditolak</Badge>,
    };
    return badges[status];
  };

  const getLocationName = (location: string) => {
    if (location === "aula-lantai-1") return "Aula Lantai 1";
    if (location === "aula-lantai-2") return "Aula Lantai 2";
    return location;
  };

  const renderBookingCard = (booking: Booking) => (
    <Card key={booking.id} className="hover:shadow-md transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <CardTitle className="text-lg mb-1">{booking.eventName}</CardTitle>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Building2 className="h-3 w-3" />
              {booking.organizerName}
            </div>
          </div>
          {getStatusBadge(booking.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span>{getLocationName(booking.location)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(booking.startDate), "dd MMMM yyyy", { locale: id })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span>{format(new Date(booking.startDate), "HH:mm", { locale: id })} - {format(new Date(booking.endDate), "HH:mm", { locale: id })}</span>
          </div>
        </div>

        {booking.rejectionReason && (
          <div className="p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
            <p className="font-semibold">Alasan Penolakan:</p>
            <p>{booking.rejectionReason}</p>
          </div>
        )}

        <div className="flex flex-col gap-2 pt-2">
          {booking.status === "pending" && (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleApprove(booking.id)}
                disabled={processingId === booking.id}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {processingId === booking.id ? (
                  <Loader2 className="w-3 h-3 mr-1.5 animate-spin" />
                ) : (
                  <CheckCircle className="w-3 h-3 mr-1.5" />
                )}
                Setujui
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => openRejectDialog(booking.id)}
                disabled={processingId === booking.id}
                className="flex-1"
              >
                <XCircle className="w-3 h-3 mr-1.5" />
                Tolak
              </Button>
            </div>
          )}
          <Link href={`/admin/pengajuan/${booking.id}`} className="w-full">
            <Button variant="outline" size="sm" className="w-full">
              <Eye className="w-3 h-3 mr-1.5" />Detail
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );

  const renderBookingList = (bookings: Booking[], isLoading: boolean) => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="ml-3 text-slate-600">Memuat data...</p>
        </div>
      );
    }

    if (bookings.length === 0) {
      return (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-semibold mb-2">Belum Ada Data</p>
            <p className="text-sm text-muted-foreground text-center">
              {activeTab === "ongoing" ? "Belum ada pengajuan yang masih berlaku" : "Belum ada pengajuan yang diarsipkan"}
            </p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {bookings.map(renderBookingCard)}
      </div>
    );
  };

  // Don't render anything until we verify user is admin
  if (userLoading || !user || user.role !== "ADMIN") {
    return null;
  }

  return (
    <>
      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tolak Pengajuan</DialogTitle>
            <DialogDescription>
              Masukkan alasan penolakan untuk pengajuan ini.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Contoh: Jadwal bentrok dengan acara lain"
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => {
                setShowRejectDialog(false);
                setRejectBookingId(null);
                setRejectionReason("");
              }} 
              disabled={processingId !== null}
            >
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleReject} 
              disabled={processingId !== null || !rejectionReason.trim()}
            >
              {processingId !== null ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4 mr-2" />
              )}
              Tolak
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="p-4 w-full h-auto">
        <div className="border rounded-xl p-4 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-bold mb-1">Kelola Peminjaman</h1>
              <p className="text-sm text-muted-foreground">Setujui atau tolak pengajuan peminjaman</p>
            </div>

            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
              <TabsList className="grid w-full max-w-md grid-cols-2">
                <TabsTrigger value="ongoing" className="gap-2">
                  <ListChecks className="w-4 h-4" />Berlaku
                </TabsTrigger>
                <TabsTrigger value="archived" className="gap-2">
                  <Archive className="w-4 h-4" />Arsip
                </TabsTrigger>
              </TabsList>

              <TabsContent value="ongoing" className="mt-6">
                {renderBookingList(ongoingBookings, isLoadingOngoing)}
              </TabsContent>

              <TabsContent value="archived" className="mt-6">
                {renderBookingList(archivedBookings, isLoadingArchived)}
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  );
}
