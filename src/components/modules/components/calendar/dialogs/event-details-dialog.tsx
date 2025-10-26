"use client";

import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import { Calendar, Clock, User, Phone, Building2, MapPin, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import {
	Dialog,
	DialogClose,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { IEvent } from "@/components/modules/components/calendar/interfaces";

interface IProps {
	event: IEvent;
	children: ReactNode;
}

export function EventDetailsDialog({ event, children }: IProps) {
	const startDate = parseISO(event.startDate);
	const endDate = parseISO(event.endDate);

	const getStatusBadge = (status: IEvent["status"]) => {
		switch (status) {
			case "pending":
				return (
					<Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-300">
						<AlertCircle className="w-3 h-3 mr-1" /> Menunggu Persetujuan
					</Badge>
				);
			case "approved":
				return (
					<Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">
						<CheckCircle className="w-3 h-3 mr-1" /> Disetujui
					</Badge>
				);
			case "rejected":
				return (
					<Badge variant="outline" className="bg-red-50 text-red-700 border-red-300">
						<XCircle className="w-3 h-3 mr-1" /> Ditolak
					</Badge>
				);
		}
	};

	const getLocationName = (location?: string) => {
		if (!location) return "-";
		const map: Record<string, string> = {
			"aula-lantai-1": "Aula Lantai 1",
			"aula-lantai-2": "Aula Lantai 2",
		};
		return map[location] || location;
	};

	return (
		<Dialog>
			<DialogTrigger asChild>{children}</DialogTrigger>
			<DialogContent className="max-w-md">
				<DialogHeader className="px-4 pt-4">
					<div className="flex items-start justify-between gap-3">
						<DialogTitle className="text-xl">{event.title}</DialogTitle>
					</div>
				</DialogHeader>

				<ScrollArea className="max-h-[70vh] px-4">
					<div className="space-y-4 pb-4">
						{/* Status */}
						<div className="pb-3 border-b">
							<p className="text-xs text-muted-foreground mb-2">Status Peminjaman</p>
							{getStatusBadge(event.status)}
						</div>

						{/* Narahubung */}
						{event.contactName && (
							<div className="flex items-start gap-3">
								<User className="mt-0.5 size-5 shrink-0 text-primary" />
								<div className="flex-1">
									<p className="text-sm font-semibold text-foreground">Narahubung</p>
									<p className="text-sm text-muted-foreground">{event.contactName}</p>
								</div>
							</div>
						)}

						{/* Kontak */}
						{event.contactPhone && (
							<div className="flex items-start gap-3">
								<Phone className="mt-0.5 size-5 shrink-0 text-primary" />
								<div className="flex-1">
									<p className="text-sm font-semibold text-foreground">Kontak</p>
									<p className="text-sm text-muted-foreground">{event.contactPhone}</p>
								</div>
							</div>
						)}

						{/* Penyelenggara */}
						{event.organizerName && (
							<div className="flex items-start gap-3">
								<Building2 className="mt-0.5 size-5 shrink-0 text-primary" />
								<div className="flex-1">
									<p className="text-sm font-semibold text-foreground">Penyelenggara</p>
									<p className="text-sm text-muted-foreground">{event.organizerName}</p>
								</div>
							</div>
						)}

						{/* Lokasi */}
						{event.location && (
							<div className="flex items-start gap-3">
								<MapPin className="mt-0.5 size-5 shrink-0 text-primary" />
								<div className="flex-1">
									<p className="text-sm font-semibold text-foreground">Lokasi</p>
									<p className="text-sm text-muted-foreground">{getLocationName(event.location)}</p>
								</div>
							</div>
						)}

						{/* Waktu Mulai */}
						<div className="flex items-start gap-3">
							<Calendar className="mt-0.5 size-5 shrink-0 text-primary" />
							<div className="flex-1">
								<p className="text-sm font-semibold text-foreground">Waktu Mulai</p>
								<p className="text-sm text-muted-foreground">
									{format(startDate, "EEEE, dd MMMM yyyy - HH:mm", { locale: id })} WIB
								</p>
							</div>
						</div>

						{/* Waktu Akhir */}
						<div className="flex items-start gap-3">
							<Clock className="mt-0.5 size-5 shrink-0 text-primary" />
							<div className="flex-1">
								<p className="text-sm font-semibold text-foreground">Waktu Akhir</p>
								<p className="text-sm text-muted-foreground">
									{format(endDate, "EEEE, dd MMMM yyyy - HH:mm", { locale: id })} WIB
								</p>
							</div>
						</div>
					</div>
				</ScrollArea>
				<DialogClose />
			</DialogContent>
		</Dialog>
	);
}
