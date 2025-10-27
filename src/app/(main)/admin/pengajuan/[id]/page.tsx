"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Calendar,
	Clock,
	MapPin,
	FileText,
	Building2,
	User,
	Phone,
	Loader2,
	ArrowLeft,
	Download,
	ExternalLink,
	CheckCircle,
	XCircle,
	AlertCircle,
	Trash2,
	Mail,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { getProxyFileUrl } from "@/lib/file-helpers";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface BookingDetail {
	id: string;
	organizerName: string;
	eventName: string;
	location: string;
	startDate: string;
	endDate: string;
	status: "pending" | "approved" | "rejected";
	contactName: string;
	contactPhone: string;
	letterUrl: string;
	letterFileName: string;
	rejectionReason?: string;
	createdAt: string;
	user: {
		id: string;
		name: string;
		email: string;
	};
}

export default function AdminPengajuanDetailPage() {
	const router = useRouter();
	const params = useParams();
	const { user, isLoading: userLoading } = useUser();
	const [booking, setBooking] = useState<BookingDetail | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isProcessing, setIsProcessing] = useState(false);
	
	// Dialog states
	const [showRejectDialog, setShowRejectDialog] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [rejectionReason, setRejectionReason] = useState("");

	const fetchBookingDetail = useCallback(async (id: string) => {
		try {
			setIsLoading(true);
			const response = await fetch(`/api/admin/bookings/${id}`);
			
			if (!response.ok) {
				if (response.status === 404) {
					toast.error("Pengajuan tidak ditemukan");
					router.push("/admin");
					return;
				}
				throw new Error("Failed to fetch booking");
			}

			const data = await response.json();
			setBooking(data.booking);
		} catch (error) {
			console.error("Fetch booking detail error:", error);
			toast.error("Gagal memuat detail pengajuan");
		} finally {
			setIsLoading(false);
		}
	}, [router]);

	useEffect(() => {
		if (!userLoading && user) {
			if (user.role !== "ADMIN") {
				router.replace('/');
			}
		}
	}, [user, userLoading, router]);

	useEffect(() => {
		if (user && user.role === "ADMIN" && params.id) {
			fetchBookingDetail(params.id as string);
		}
	}, [user, params.id, fetchBookingDetail]);

	const handleApprove = async () => {
		if (!booking) return;
		
		try {
			setIsProcessing(true);
			const response = await fetch(`/api/admin/bookings/${booking.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "approved" }),
			});

			if (!response.ok) throw new Error("Failed to approve booking");

			toast.success("Pengajuan disetujui!");
			router.push("/admin");
		} catch (error) {
			console.error("Approve error:", error);
			toast.error("Gagal menyetujui pengajuan");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleReject = async () => {
		if (!booking || !rejectionReason.trim()) {
			toast.error("Alasan penolakan harus diisi");
			return;
		}
		
		try {
			setIsProcessing(true);
			const response = await fetch(`/api/admin/bookings/${booking.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ status: "rejected", rejectionReason: rejectionReason.trim() }),
			});

			if (!response.ok) throw new Error("Failed to reject booking");

			toast.success("Pengajuan ditolak");
			setShowRejectDialog(false);
			router.push("/admin");
		} catch (error) {
			console.error("Reject error:", error);
			toast.error("Gagal menolak pengajuan");
		} finally {
			setIsProcessing(false);
		}
	};

	const handleDelete = async () => {
		if (!booking) return;
		
		try {
			setIsProcessing(true);
			const response = await fetch(`/api/admin/bookings/${booking.id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete booking");

			toast.success("Pengajuan dihapus");
			setShowDeleteDialog(false);
			router.push("/admin");
		} catch (error) {
			console.error("Delete error:", error);
			toast.error("Gagal menghapus pengajuan");
		} finally {
			setIsProcessing(false);
		}
	};

	const getStatusBadge = (status: BookingDetail["status"]) => {
		const badges = {
			pending: (
				<Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
					<AlertCircle className="w-4 h-4 mr-2" />
					Pending
				</Badge>
			),
			approved: (
				<Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
					<CheckCircle className="w-4 h-4 mr-2" />
					Disetujui
				</Badge>
			),
			rejected: (
				<Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
					<XCircle className="w-4 h-4 mr-2" />
					Ditolak
				</Badge>
			),
		};
		return badges[status];
	};

	const getLocationName = (location: string) => {
		if (location === "aula-lantai-1") return "Aula Lantai 1";
		if (location === "aula-lantai-2") return "Aula Lantai 2";
		return location;
	};

	if (userLoading || !user || user.role !== "ADMIN" || isLoading) {
		return (
			<div className="w-full h-full p-4 lg:p-6">
				<div className="w-full h-full max-w-[1400px] mx-auto border rounded-xl overflow-auto">
					<div className="p-6 flex items-center justify-center h-full">
						<LoadingScreen message="Memuat detail pengajuan..." />
					</div>
				</div>
			</div>
		);
	}

	if (!booking) {
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
						<Button variant="outline" onClick={() => setShowRejectDialog(false)} disabled={isProcessing}>
							Batal
						</Button>
						<Button variant="destructive" onClick={handleReject} disabled={isProcessing || !rejectionReason.trim()}>
							{isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
							Tolak
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{/* Delete Dialog */}
			<Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<DialogTitle>Hapus Pengajuan</DialogTitle>
						<DialogDescription>
							Apakah Anda yakin ingin menghapus pengajuan ini? Tindakan ini tidak dapat dibatalkan.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button variant="outline" onClick={() => setShowDeleteDialog(false)} disabled={isProcessing}>
							Batal
						</Button>
						<Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>
							{isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Trash2 className="w-4 h-4 mr-2" />}
							Hapus
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div className="w-full h-full p-4 lg:p-6">
				<div className="w-full h-full max-w-[1400px] mx-auto border rounded-xl overflow-auto">
					<div className="p-4 lg:p-6">
						{/* Header */}
						<div className="mb-6">
							<Button variant="ghost" size="sm" onClick={() => router.push("/admin")} className="mb-4 -ml-2">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Kembali ke Admin
							</Button>
							<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
								<div>
									<h1 className="text-2xl font-bold mb-2">{booking.eventName}</h1>
									<p className="text-sm text-muted-foreground">
										Diajukan {format(new Date(booking.createdAt), "dd MMMM yyyy, HH:mm", { locale: id })}
									</p>
								</div>
								{getStatusBadge(booking.status)}
							</div>
						</div>

						{/* Action Buttons */}
						{booking.status === "pending" && (
							<Card className="mb-6 border-blue-200 bg-blue-50">
								<CardHeader className="pb-3">
									<CardTitle className="text-base text-blue-900">Tindakan Admin</CardTitle>
								</CardHeader>
								<CardContent>
									<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
										<Button 
											onClick={handleApprove} 
											disabled={isProcessing} 
											className="bg-green-600 hover:bg-green-700 w-full"
											size="lg"
										>
											<CheckCircle className="w-4 h-4 mr-2" />
											{isProcessing ? "Memproses..." : "Setujui Pengajuan"}
										</Button>
										<Button 
											variant="destructive" 
											onClick={() => setShowRejectDialog(true)} 
											disabled={isProcessing}
											className="w-full"
											size="lg"
										>
											<XCircle className="w-4 h-4 mr-2" />
											Tolak Pengajuan
										</Button>
									</div>
								</CardContent>
							</Card>
						)}

						{/* Rejection Reason */}
						{booking.rejectionReason && (
							<Card className="mb-6 border-red-200 bg-red-50">
								<CardHeader>
									<CardTitle className="text-base text-red-700 flex items-center gap-2">
										<XCircle className="h-5 w-5" />
										Alasan Penolakan
									</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-red-700">{booking.rejectionReason}</p>
								</CardContent>
							</Card>
						)}

						{/* Main Info */}
						<div className="grid gap-6 md:grid-cols-2 mb-6">
							{/* Event Details */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Detail Kegiatan</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-start gap-3">
										<FileText className="h-5 w-5 text-muted-foreground mt-0.5" />
										<div>
											<p className="text-sm font-medium">Nama Kegiatan</p>
											<p className="text-sm text-muted-foreground">{booking.eventName}</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
										<div>
											<p className="text-sm font-medium">Penyelenggara</p>
											<p className="text-sm text-muted-foreground">{booking.organizerName}</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
										<div>
											<p className="text-sm font-medium">Lokasi</p>
											<p className="text-sm text-muted-foreground">{getLocationName(booking.location)}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Schedule */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Jadwal</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="flex items-start gap-3">
										<Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
										<div>
											<p className="text-sm font-medium">Tanggal</p>
											<p className="text-sm text-muted-foreground">
												{format(new Date(booking.startDate), "EEEE, dd MMMM yyyy", { locale: id })}
											</p>
										</div>
									</div>
									<div className="flex items-start gap-3">
										<Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
										<div>
											<p className="text-sm font-medium">Waktu</p>
											<p className="text-sm text-muted-foreground">
												{format(new Date(booking.startDate), "HH:mm", { locale: id })} -{" "}
												{format(new Date(booking.endDate), "HH:mm", { locale: id })} WIB
											</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Contact Info */}
						<Card className="mb-6">
							<CardHeader>
								<CardTitle className="text-lg">Narahubung</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-start gap-3">
									<User className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<p className="text-sm font-medium">Nama</p>
										<p className="text-sm text-muted-foreground">{booking.contactName}</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<p className="text-sm font-medium">Nomor Telepon</p>
										<p className="text-sm text-muted-foreground">{booking.contactPhone}</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* User Info */}
						<Card className="mb-6">
							<CardHeader>
								<CardTitle className="text-lg">Informasi Pemohon</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex items-start gap-3">
									<User className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<p className="text-sm font-medium">Nama</p>
										<p className="text-sm text-muted-foreground">{booking.user.name}</p>
									</div>
								</div>
								<div className="flex items-start gap-3">
									<Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
									<div>
										<p className="text-sm font-medium">Email</p>
										<p className="text-sm text-muted-foreground">{booking.user.email}</p>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Letter */}
						<Card className="mb-6">
							<CardHeader>
								<CardTitle className="text-lg">Surat Peminjaman</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-slate-50 rounded-lg border">
									<div className="flex items-center gap-3">
										<FileText className="h-5 w-5 text-muted-foreground" />
										<div>
											<p className="text-sm font-medium break-all">{booking.letterFileName}</p>
											<p className="text-xs text-muted-foreground">PDF Document</p>
										</div>
									</div>
									<div className="flex gap-2">
										<Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
											<a href={getProxyFileUrl(booking.letterUrl, booking.id)} target="_blank" rel="noopener noreferrer">
												<ExternalLink className="w-4 h-4 mr-2" />
												Lihat
											</a>
										</Button>
										<Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
											<a href={getProxyFileUrl(booking.letterUrl, booking.id)} download>
												<Download className="w-4 h-4 mr-2" />
												Unduh
											</a>
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* Delete Button */}
						<Card className="border-red-200">
							<CardHeader>
								<CardTitle className="text-lg text-red-700">Zona Bahaya</CardTitle>
							</CardHeader>
							<CardContent>
								<p className="text-sm text-muted-foreground mb-4">
									Hapus pengajuan ini secara permanen. Tindakan ini tidak dapat dibatalkan.
								</p>
								<Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={isProcessing}>
									<Trash2 className="w-4 h-4 mr-2" />
									Hapus Pengajuan
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</>
	);
}
