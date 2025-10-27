"use client";

import { BookingOnboarding } from "@/components/onboarding";
import { BookingData } from "@/components/onboarding/booking/types";
import { useUser } from "@/hooks/use-user";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogIn, AlertCircle } from "lucide-react";
import { LoadingScreen } from "@/components/ui/loading-screen";

export default function PinjamPage() {
	const router = useRouter();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [showLoginModal, setShowLoginModal] = useState(false);
	const { user, isLoading } = useUser();

	// Check if user is logged in
	useEffect(() => {
		if (!isLoading && !user) {
			setShowLoginModal(true);
		}
	}, [user, isLoading]);

	const handleComplete = async (data: BookingData) => {
		try {
			setIsSubmitting(true);

			// Validasi file
			if (!data.letterFile) {
				throw new Error("File surat peminjaman wajib diupload");
			}

			// Show loading toast
			toast.loading("Mengupload file dan menyimpan data...", {
				id: "submit-booking",
			});

			// Prepare FormData untuk multipart upload
			const formData = new FormData();
			formData.append("contactName", data.contactName);
			formData.append("contactPhone", data.contactPhone);
			formData.append("organizerName", data.organizerName);
			formData.append("eventName", data.eventName);
			formData.append("location", data.location || "");
			formData.append("startDate", data.startDate.toISOString());
			formData.append("endDate", data.endDate.toISOString());
			formData.append("letterFile", data.letterFile);

			const response = await fetch("/api/bookings", {
				method: "POST",
				body: formData,
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || "Failed to create booking");
			}

			// Dismiss loading toast
			toast.dismiss("submit-booking");

			toast.success("Booking berhasil diajukan!", {
				description: "Pengajuan Anda sedang menunggu persetujuan admin.",
			});

			// Redirect to riwayat page
			router.push("/riwayat");
		} catch (error) {
			console.error("Submit booking error:", error);
			
			// Dismiss loading toast
			toast.dismiss("submit-booking");
			
			toast.error("Gagal mengajukan booking", {
				description:
					error instanceof Error ? error.message : "Terjadi kesalahan. Silakan coba lagi.",
			});
		} finally {
			setIsSubmitting(false);
		}
	};

	// Show loading screen while checking authentication
	if (isLoading) {
		return (
			<div className="w-full h-full p-4 lg:p-6">
				<div className="w-full h-full max-w-[1400px] mx-auto border rounded-xl overflow-auto">
					<div className="p-6 flex items-center justify-center h-full">
						<LoadingScreen message="Memuat halaman peminjaman..." />
					</div>
				</div>
			</div>
		);
	}

	return (
		<>
			<Dialog 
				open={showLoginModal} 
				onOpenChange={(open) => {
					if (!open) {
						router.push('/');
					}
					setShowLoginModal(open);
				}}
			>
				<DialogContent className="sm:max-w-md">
					<DialogHeader>
						<div className="flex items-center gap-2 mb-2">
							<div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-full">
								<AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400" />
							</div>
							<DialogTitle>Login Diperlukan</DialogTitle>
						</div>
						<DialogDescription className="text-base pt-2">
							Untuk mengajukan peminjaman tempat, Anda harus login terlebih dahulu.
							Silakan login untuk melanjutkan.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
						<Button
							variant="outline"
							onClick={() => {
								setShowLoginModal(false);
								router.push('/');
							}}
							className="w-full sm:w-auto"
						>
							Kembali ke Home
						</Button>
						<Button
							onClick={() => router.push('/login')}
							className="w-full sm:w-auto"
						>
							<LogIn className="w-4 h-4 mr-2" />
							Login Sekarang
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<div className="w-full h-full p-4 lg:p-6">
				<div className="w-full h-full max-w-[1400px] mx-auto border rounded-xl overflow-auto lg:flex lg:items-center lg:justify-center">
					<div className="p-4 lg:p-6 w-full lg:max-w-4xl">
						{user && <BookingOnboarding onComplete={handleComplete} isSubmitting={isSubmitting} />}
					</div>
				</div>
			</div>
		</>
	);
}
