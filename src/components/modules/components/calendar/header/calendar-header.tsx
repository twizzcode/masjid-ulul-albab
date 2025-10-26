"use client";

import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { useCalendar } from "@/components/modules/components/calendar/contexts/calendar-context";
import { DateNavigator } from "@/components/modules/components/calendar/header/date-navigator";
import { TodayButton } from "@/components/modules/components/calendar/header/today-button";
import Views from "./view-tabs";

export function CalendarHeader() {
	const { view, events } = useCalendar();
	const router = useRouter();

	return (
		<div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
			<div className="flex items-center gap-3">
				<TodayButton />
				<DateNavigator view={view} events={events} />
			</div>

			<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-1.5">
				<div className="options flex-wrap flex items-center gap-4 md:gap-2">
					<Views />
				</div>

				<Button onClick={() => router.push("/pinjam")}>
					<Plus className="h-4 w-4" />
					Ajukan Peminjaman
				</Button>
			</div>
		</div>
	);
}
