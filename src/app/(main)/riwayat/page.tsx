"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
	Loader2,
	MessageCircle,
	CheckCircle,
	XCircle,
	AlertCircle,
	LogIn,
	Eye,
	History,
	Hourglass,
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { LoadingScreen } from "@/components/ui/loading-screen";

interface Booking {
	id: string;
	organizerName: string;
	eventName: string;
	location: string;
	startDate: string;
	endDate: string;
	status: "pending" | "approved" | "rejected";
	createdAt: string;
	rejectionReason?: string;
}

export default function RiwayatPage() {
	const router = useRouter();
	const { user, isLoading: userLoading } = useUser();
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [ongoingBookings, setOngoingBookings] = useState<Booking[]>([]);
	const [pastBookings, setPastBookings] = useState<Booking[]>([]);
	const [isLoadingOngoing, setIsLoadingOngoing] = useState(false);
	const [isLoadingPast, setIsLoadingPast] = useState(false);
	const [activeTab, setActiveTab] = useState<"ongoing" | "past">("ongoing");
	const [isSendingWhatsApp, setIsSendingWhatsApp] = useState<string | null>(null);

	useEffect(() => {
		if (!userLoading && !user) {
			setShowLoginModal(true);
		}
	}, [user, userLoading]);

	useEffect(() => {
		if (user && activeTab === "ongoing" && ongoingBookings.length === 0) {
			fetchBookings("ongoing");
		}
	}, [user, activeTab, ongoingBookings.length]);

	useEffect(() => {
		if (user && activeTab === "past" && pastBookings.length === 0) {
			fetchBookings("past");
		}
	}, [user, activeTab, pastBookings.length]);

	const fetchBookings = async (type: "ongoing" | "past") => {
		try {
			if (type === "ongoing") setIsLoadingOngoing(true);
			else setIsLoadingPast(true);

			const response = await fetch(`/api/bookings?type=${type}`);
			if (!response.ok) throw new Error("Failed to fetch bookings");

			const data = await response.json();
			if (type === "ongoing") setOngoingBookings(data.bookings);
			else setPastBookings(data.bookings);
		} catch (error) {
			console.error("Fetch bookings error:", error);
			toast.error("Gagal memuat data peminjaman");
		} finally {
			if (type === "ongoing") setIsLoadingOngoing(false);
			else setIsLoadingPast(false);
		}
	};

	const handleSendWhatsApp = async (booking: Booking) => {
		try {
			setIsSendingWhatsApp(booking.id);
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
			setIsSendingWhatsApp(null);
		}
	};

	const getStatusBadge = (status: Booking["status"]) => {
		const badges = {
			pending: <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300"><AlertCircle className="w-3 h-3 mr-1" />Pending</Badge>,
			approved: <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300"><CheckCircle className="w-3 h-3 mr-1" />Disetujui</Badge>,
			rejected: <Badge variant="outline" className="bg-red-50 text-red-700 border-red-300"><XCircle className="w-3 h-3 mr-1" />Ditolak</Badge>,
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

				<div className="flex gap-2 pt-2">
					{booking.status === "pending" && (
						<Button variant="outline" size="sm" onClick={() => handleSendWhatsApp(booking)} disabled={isSendingWhatsApp === booking.id} className="flex-1 bg-green-50 hover:bg-green-100 border-green-300">
							<MessageCircle className="w-3 h-3 mr-1.5" />
							{isSendingWhatsApp === booking.id ? "Mengirim..." : "Konfirmasi WA"}
						</Button>
					)}
					<Link href={`/riwayat/${booking.id}`} className="flex-1">
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
					<p className="ml-3 text-slate-600">Memuat riwayat peminjaman...</p>
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
							{activeTab === "ongoing" ? "Belum ada peminjaman yang sedang berlangsung" : "Belum ada riwayat peminjaman"}
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

	// Show loading screen while checking authentication
	if (userLoading) {
		return (
			<div className="p-4 w-full">
				<div className="w-full h-full flex items-start justify-center p-4 overflow-auto border rounded-xl">
					<LoadingScreen message="Memuat riwayat peminjaman..." />
				</div>
			</div>
		);
	}

	return (
		<>
			<Dialog open={showLoginModal} onOpenChange={(open) => { if (!open) router.push('/'); setShowLoginModal(open); }}>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<div className="flex items-center gap-2 mb-2">
							<div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
								<AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<DialogTitle>Login Diperlukan</DialogTitle>
						</div>
						<DialogDescription className="text-base pt-2">
							Untuk melihat riwayat peminjaman, Anda harus login terlebih dahulu.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
						<Button variant="outline" onClick={() => { setShowLoginModal(false); router.push('/'); }} className="w-full sm:w-auto">
							Kembali ke Home
						</Button>
						<Button onClick={() => router.push('/login')} className="w-full sm:w-auto">
							<LogIn className="w-4 h-4 mr-2" />Login Sekarang
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			{user && (
				<div className="p-4 w-full">
					<div className="w-full h-full flex items-start justify-center p-4 overflow-auto border rounded-xl">
						<div className="w-full max-w-7xl">
							<div className="mb-6">
								<h1 className="text-2xl font-bold mb-1">Riwayat Peminjaman</h1>
								<p className="text-sm text-muted-foreground">Lihat riwayat peminjaman Anda</p>
							</div>

							<Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "ongoing" | "past")} className="w-full">
								<TabsList className="grid w-full max-w-md grid-cols-2">
									<TabsTrigger value="ongoing" className="gap-2">
										<Hourglass className="w-4 h-4" />Berlangsung
									</TabsTrigger>
									<TabsTrigger value="past" className="gap-2">
										<History className="w-4 h-4" />Selesai
									</TabsTrigger>
								</TabsList>

								<TabsContent value="ongoing" className="mt-6">
									{renderBookingList(ongoingBookings, isLoadingOngoing)}
								</TabsContent>

								<TabsContent value="past" className="mt-6">
									{renderBookingList(pastBookings, isLoadingPast)}
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
