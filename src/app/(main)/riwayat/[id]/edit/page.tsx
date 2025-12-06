"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useUser } from "@/hooks/use-user";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingScreen } from "@/components/ui/loading-screen";
import {
	ArrowLeft,
	Loader2,
	Save,
	FileText,
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";

const bookingSchema = z.object({
	contactName: z.string().min(1, "Nama kontak wajib diisi"),
	contactPhone: z.string().min(1, "Nomor telepon wajib diisi"),
	organizerName: z.string().min(1, "Nama penyelenggara wajib diisi"),
	eventName: z.string().min(1, "Nama acara wajib diisi"),
	location: z.string().min(1, "Lokasi wajib dipilih"),
	startDate: z.date(),
	endDate: z.date(),
}).refine((data) => data.endDate > data.startDate, {
	message: "Waktu selesai harus lebih besar dari waktu mulai",
	path: ["endDate"],
});

type BookingFormData = z.infer<typeof bookingSchema>;

interface Booking {
	id: string;
	contactName: string;
	contactPhone: string;
	organizerName: string;
	eventName: string;
	location: string;
	startDate: string;
	endDate: string;
	status: string;
	letterUrl?: string;
	letterFileName?: string;
}

export default function EditBookingPage() {
	const router = useRouter();
	const params = useParams();
	const { user, isLoading: userLoading } = useUser();
	const [booking, setBooking] = useState<Booking | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newLetterFile, setNewLetterFile] = useState<File | null>(null);

	const {
		register,
		handleSubmit,
		formState: { errors },
		setValue,
		watch,
		control,
	} = useForm<BookingFormData>({
		resolver: zodResolver(bookingSchema),
	});

	const startDate = watch("startDate");
	const endDate = watch("endDate");
	const location = watch("location");

	useEffect(() => {
		if (!userLoading && !user) {
			router.push("/login");
		}
	}, [user, userLoading, router]);

	useEffect(() => {
		const fetchBooking = async () => {
			if (!params.id) return;

			try {
				setIsLoading(true);
				const response = await fetch(`/api/bookings/${params.id}`);
				
				if (!response.ok) {
					throw new Error("Failed to fetch booking");
				}

				const data = await response.json();
				
				if (data.booking.status !== "pending") {
					toast.error("Booking ini tidak dapat diedit");
					router.push("/riwayat");
					return;
				}

				setBooking(data.booking);
				
				// Set form values
				setValue("contactName", data.booking.contactName);
				setValue("contactPhone", data.booking.contactPhone);
				setValue("organizerName", data.booking.organizerName);
				setValue("eventName", data.booking.eventName);
				setValue("location", data.booking.location);
				setValue("startDate", new Date(data.booking.startDate));
				setValue("endDate", new Date(data.booking.endDate));
			} catch (error) {
				console.error("Fetch booking error:", error);
				toast.error("Gagal memuat data booking");
				router.push("/riwayat");
			} finally {
				setIsLoading(false);
			}
		};

		if (user) {
			fetchBooking();
		}
	}, [params.id, user, router, setValue]);

	const onSubmit = async (data: BookingFormData) => {
		try {
			setIsSubmitting(true);

			toast.loading("Menyimpan perubahan...", { id: "update-booking" });

			// Check availability first
			const availabilityResponse = await fetch("/api/bookings/check-availability", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					location: data.location,
					startDate: data.startDate.toISOString(),
					endDate: data.endDate.toISOString(),
					excludeBookingId: params.id, // Exclude current booking from check
				}),
			});

			const availabilityData = await availabilityResponse.json();

			if (!availabilityData.available) {
				toast.dismiss("update-booking");
				toast.error("Waktu tidak tersedia", {
					description: "Lokasi sudah dibooking pada waktu tersebut",
				});
				return;
			}

			// Update booking
			const response = await fetch(`/api/bookings/${params.id}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					contactName: data.contactName,
					contactPhone: data.contactPhone,
					organizerName: data.organizerName,
					eventName: data.eventName,
					location: data.location,
					startDate: data.startDate.toISOString(),
					endDate: data.endDate.toISOString(),
				}),
			});

			if (!response.ok) {
				const result = await response.json();
				throw new Error(result.error || "Failed to update booking");
			}

			// Upload new letter file if provided
			if (newLetterFile) {
				const formData = new FormData();
				formData.append("letterFile", newLetterFile);
				formData.append("bookingId", params.id as string);

				const uploadResponse = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});

				if (!uploadResponse.ok) {
					console.error("Failed to upload new letter file");
				}
			}

			toast.dismiss("update-booking");
			toast.success("Booking berhasil diperbarui!");
			router.push("/riwayat");
		} catch (error) {
			console.error("Update booking error:", error);
			toast.dismiss("update-booking");
			toast.error(
				error instanceof Error ? error.message : "Gagal memperbarui booking"
			);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			// Validate file type
			const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
			if (!validTypes.includes(file.type)) {
				toast.error("File harus berupa PDF atau gambar (JPG/PNG)");
				return;
			}

			// Validate file size (max 5MB)
			if (file.size > 5 * 1024 * 1024) {
				toast.error("Ukuran file maksimal 5MB");
				return;
			}

			setNewLetterFile(file);
			toast.success("File dipilih: " + file.name);
		}
	};

	if (userLoading || isLoading) {
		return (
			<div className="w-full h-full p-4 lg:p-6">
				<div className="w-full h-full max-w-[1400px] mx-auto border rounded-xl overflow-auto">
					<div className="p-6 flex items-center justify-center h-full">
						<LoadingScreen message="Memuat data booking..." />
					</div>
				</div>
			</div>
		);
	}

	if (!booking) {
		return null;
	}

	return (
		<div className="w-full h-full p-4 lg:p-6">
			<div className="w-full h-full max-w-[1400px] mx-auto border rounded-xl overflow-auto">
				<div className="p-4 lg:p-6">
					<div className="mb-6">
						<Link href="/riwayat">
							<Button variant="ghost" size="sm" className="mb-4">
								<ArrowLeft className="w-4 h-4 mr-2" />
								Kembali
							</Button>
						</Link>
						<h1 className="text-2xl font-bold">Edit Peminjaman</h1>
						<p className="text-sm text-muted-foreground">
							Ubah detail peminjaman Anda
						</p>
					</div>

					<form onSubmit={handleSubmit(onSubmit)}>
						<div className="grid gap-6 md:grid-cols-2">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Informasi Kontak</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="contactName">Nama Kontak</Label>
										<Input
											id="contactName"
											{...register("contactName")}
											placeholder="Masukkan nama kontak"
										/>
										{errors.contactName && (
											<p className="text-sm text-red-500">
												{errors.contactName.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="contactPhone">Nomor Telepon</Label>
										<Input
											id="contactPhone"
											{...register("contactPhone")}
											placeholder="Contoh: 081234567890"
										/>
										{errors.contactPhone && (
											<p className="text-sm text-red-500">
												{errors.contactPhone.message}
											</p>
										)}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Informasi Acara</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="organizerName">Nama Penyelenggara</Label>
										<Input
											id="organizerName"
											{...register("organizerName")}
											placeholder="Nama organisasi/perusahaan"
										/>
										{errors.organizerName && (
											<p className="text-sm text-red-500">
												{errors.organizerName.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="eventName">Nama Acara</Label>
										<Input
											id="eventName"
											{...register("eventName")}
											placeholder="Masukkan nama acara"
										/>
										{errors.eventName && (
											<p className="text-sm text-red-500">
												{errors.eventName.message}
											</p>
										)}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Lokasi & Waktu</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label htmlFor="location">Lokasi</Label>
										<select
											id="location"
											{...register("location")}
											className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
										>
											<option value="">Pilih lokasi</option>
											<option value="aula-lantai-1">Aula Lantai 1</option>
											<option value="aula-lantai-2">Aula Lantai 2</option>
										</select>
										{errors.location && (
											<p className="text-sm text-red-500">
												{errors.location.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label>Waktu Mulai</Label>
										<Controller
											name="startDate"
											control={control}
											render={({ field }) => (
												<div className="space-y-2">
													<Popover>
														<PopoverTrigger asChild>
															<Button
																variant="outline"
																className="w-full justify-start text-left font-normal"
															>
																<CalendarIcon className="mr-2 h-4 w-4" />
																{field.value ? (
																	format(field.value, "dd MMMM yyyy, HH:mm", { locale: id })
																) : (
																	<span>Pilih tanggal dan waktu</span>
																)}
															</Button>
														</PopoverTrigger>
														<PopoverContent className="w-auto p-0" align="start">
															<Calendar
																mode="single"
																selected={field.value}
																onSelect={(date) => {
																	if (date) {
																		const newDate = new Date(date);
																		if (field.value) {
																			newDate.setHours(field.value.getHours());
																			newDate.setMinutes(field.value.getMinutes());
																		}
																		field.onChange(newDate);
																	}
																}}
																initialFocus
															/>
															<div className="p-3 border-t">
																<Label className="text-sm mb-2 block">Waktu</Label>
																<div className="flex gap-2">
																	<Input
																		type="number"
																		min="0"
																		max="23"
																		placeholder="HH"
																		value={field.value?.getHours() || 0}
																		onChange={(e) => {
																			const newDate = new Date(field.value || new Date());
																			newDate.setHours(parseInt(e.target.value) || 0);
																			field.onChange(newDate);
																		}}
																		className="w-20"
																	/>
																	<span className="text-2xl">:</span>
																	<Input
																		type="number"
																		min="0"
																		max="59"
																		placeholder="MM"
																		value={field.value?.getMinutes() || 0}
																		onChange={(e) => {
																			const newDate = new Date(field.value || new Date());
																			newDate.setMinutes(parseInt(e.target.value) || 0);
																			field.onChange(newDate);
																		}}
																		className="w-20"
																	/>
																</div>
															</div>
														</PopoverContent>
													</Popover>
												</div>
											)}
										/>
										{errors.startDate && (
											<p className="text-sm text-red-500">
												{errors.startDate.message}
											</p>
										)}
									</div>

									<div className="space-y-2">
										<Label>Waktu Selesai</Label>
										<Controller
											name="endDate"
											control={control}
											render={({ field }) => (
												<div className="space-y-2">
													<Popover>
														<PopoverTrigger asChild>
															<Button
																variant="outline"
																className="w-full justify-start text-left font-normal"
															>
																<CalendarIcon className="mr-2 h-4 w-4" />
																{field.value ? (
																	format(field.value, "dd MMMM yyyy, HH:mm", { locale: id })
																) : (
																	<span>Pilih tanggal dan waktu</span>
																)}
															</Button>
														</PopoverTrigger>
														<PopoverContent className="w-auto p-0" align="start">
															<Calendar
																mode="single"
																selected={field.value}
																onSelect={(date) => {
																	if (date) {
																		const newDate = new Date(date);
																		if (field.value) {
																			newDate.setHours(field.value.getHours());
																			newDate.setMinutes(field.value.getMinutes());
																		}
																		field.onChange(newDate);
																	}
																}}
																initialFocus
															/>
															<div className="p-3 border-t">
																<Label className="text-sm mb-2 block">Waktu</Label>
																<div className="flex gap-2">
																	<Input
																		type="number"
																		min="0"
																		max="23"
																		placeholder="HH"
																		value={field.value?.getHours() || 0}
																		onChange={(e) => {
																			const newDate = new Date(field.value || new Date());
																			newDate.setHours(parseInt(e.target.value) || 0);
																			field.onChange(newDate);
																		}}
																		className="w-20"
																	/>
																	<span className="text-2xl">:</span>
																	<Input
																		type="number"
																		min="0"
																		max="59"
																		placeholder="MM"
																		value={field.value?.getMinutes() || 0}
																		onChange={(e) => {
																			const newDate = new Date(field.value || new Date());
																			newDate.setMinutes(parseInt(e.target.value) || 0);
																			field.onChange(newDate);
																		}}
																		className="w-20"
																	/>
																</div>
															</div>
														</PopoverContent>
													</Popover>
												</div>
											)}
										/>
										{errors.endDate && (
											<p className="text-sm text-red-500">
												{errors.endDate.message}
											</p>
										)}
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Dokumen</CardTitle>
								</CardHeader>
								<CardContent className="space-y-4">
									<div className="space-y-2">
										<Label>Surat Peminjaman Saat Ini</Label>
										{booking.letterUrl && (
											<a
												href={booking.letterUrl}
												target="_blank"
												rel="noopener noreferrer"
												className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
											>
												<FileText className="w-4 h-4" />
												{booking.letterFileName || "Lihat file"}
											</a>
										)}
									</div>

									<div className="space-y-2">
										<Label htmlFor="letterFile">
											Upload Surat Baru (Opsional)
										</Label>
										<div className="flex items-center gap-2">
											<Input
												id="letterFile"
												type="file"
												accept=".pdf,.jpg,.jpeg,.png"
												onChange={handleFileChange}
												className="cursor-pointer"
											/>
										</div>
										{newLetterFile && (
											<p className="text-xs text-green-600">
												File baru dipilih: {newLetterFile.name}
											</p>
										)}
										<p className="text-xs text-muted-foreground">
											PDF atau gambar (max 5MB)
										</p>
									</div>
								</CardContent>
							</Card>
						</div>

						<div className="mt-6 flex gap-3 justify-end">
							<Link href="/riwayat">
								<Button
									type="button"
									variant="outline"
									disabled={isSubmitting}
								>
									Batal
								</Button>
							</Link>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="w-4 h-4 mr-2 animate-spin" />
										Menyimpan...
									</>
								) : (
									<>
										<Save className="w-4 h-4 mr-2" />
										Simpan Perubahan
									</>
								)}
							</Button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
