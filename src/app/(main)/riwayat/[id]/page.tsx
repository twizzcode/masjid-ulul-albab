"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
	MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import Link from "next/link";

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
		name: string;
		email: string;
	};
}

export default function RiwayatDetailPage() {
	const router = useRouter();
	const params = useParams();
	const { user, isLoading: userLoading } = useUser();
	const [booking, setBooking] = useState<BookingDetail | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);

	useEffect(() => {
		if (!userLoading && !user) {
			router.push("/riwayat");
		}
	}, [user, userLoading, router]);

	useEffect(() => {
		if (user && params.id) {
			fetchBookingDetail(params.id as string);
		}
	}, [user, params.id]);

	const fetchBookingDetail = async (id: string) => {
		try {
			setIsLoading(true);
			const response = await fetch(`/api/bookings/${id}`);
			
			if (!response.ok) {
				if (response.status === 404) {
					toast.error("Peminjaman tidak ditemukan");
					router.push("/riwayat");
					return;
				}
				throw new Error("Failed to fetch booking");
			}

			const data = await response.json();
			setBooking(data.booking);
		} catch (error) {
			console.error("Fetch booking detail error:", error);
			toast.error("Gagal memuat detail peminjaman");
		} finally {
			setIsLoading(false);
		}
	};

	const handleSendWhatsApp = async () => {
		if (!booking) return;
		
		try {
			setIsSendingWhatsApp(true);
			const response = await fetch(`/api/bookings/${booking.id}/notify-admin`, {
				method: "POST",
			});
			
			if (!response.ok) throw new Error("Failed to generate WhatsApp notification");

			const data = await response.json();
			if (data.whatsappUrl) {
				window.open(data.whatsappUrl, "_blank");
				toast.success("WhatsApp terbuka!");
			}
		} catch (error) {
			console.error("Send WhatsApp error:", error);
			toast.error("Gagal mengirim notifikasi");
		} finally {
			setIsSendingWhatsApp(false);
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

	if (userLoading || isLoading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<Loader2 className="h-8 w-8 animate-spin text-blue-600" />
				<p className="ml-3 text-slate-600">Memuat detail...</p>
			</div>
		);
	}

	if (!booking) {
		return null;
	}

	return (
		<div className="p-4">
			<div className="border rounded-xl p-4 overflow-y-auto">
				<div className="w-full max-w-4xl mx-auto">
					{/* Header */}
					<div className="mb-6">
						<Button variant="ghost" size="sm" onClick={() => router.push("/riwayat")} className="mb-4 -ml-2">
							<ArrowLeft className="w-4 h-4 mr-2" />
							Kembali ke Riwayat
						</Button>
						<div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
							<div>
								<h1 className="text-2xl font-bold mb-2">{booking.eventName}</h1>
								<p className="text-sm text-muted-foreground">
									Dibuat {format(new Date(booking.createdAt), "dd MMMM yyyy, HH:mm", { locale: id })}
								</p>
							</div>
							{getStatusBadge(booking.status)}
						</div>
					</div>

					{/* WhatsApp Confirmation - Moved to top */}
					{booking.status === "pending" && (
						<Card className="mb-6 border-green-200 bg-green-50">
							<CardContent className="pt-6">
								<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
									<div>
										<p className="font-semibold text-green-900 mb-1">Konfirmasi ke Admin</p>
										<p className="text-sm text-green-700">
											Peminjaman Anda masih dalam status pending. Kirim konfirmasi melalui WhatsApp.
										</p>
									</div>
									<Button 
										onClick={handleSendWhatsApp} 
										disabled={isSendingWhatsApp} 
										className="bg-green-600 hover:bg-green-700 whitespace-nowrap"
									>
										<MessageCircle className="w-4 h-4 mr-2" />
										{isSendingWhatsApp ? "Mengirim..." : "Konfirmasi WA"}
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
										<a href={booking.letterUrl} target="_blank" rel="noopener noreferrer">
											<ExternalLink className="w-4 h-4 mr-2" />
											Lihat
										</a>
									</Button>
									<Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
										<a href={booking.letterUrl} download>
											<Download className="w-4 h-4 mr-2" />
											Unduh
										</a>
									</Button>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
