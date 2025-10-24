"use client";

import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
	slideFromLeft,
	slideFromRight,
	transition,
} from "@/components/modules/components/calendar/animations";
import { useCalendar } from "@/components/modules/components/calendar/contexts/calendar-context";
import { DateNavigator } from "@/components/modules/components/calendar/header/date-navigator";
import { TodayButton } from "@/components/modules/components/calendar/header/today-button";
import Views from "./view-tabs";

export function CalendarHeader() {
	const { view, events } = useCalendar();
	const router = useRouter();

	return (
		<div className="flex flex-col gap-4 border-b p-4 lg:flex-row lg:items-center lg:justify-between">
			<motion.div
				className="flex items-center gap-3"
				variants={slideFromLeft}
				initial="initial"
				animate="animate"
				transition={transition}
			>
				<TodayButton />
				<DateNavigator view={view} events={events} />
			</motion.div>

			<motion.div
				className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-1.5"
				variants={slideFromRight}
				initial="initial"
				animate="animate"
				transition={transition}
			>
				<div className="options flex-wrap flex items-center gap-4 md:gap-2">
					<Views />
				</div>

				<Button onClick={() => router.push("/pinjam")}>
					<Plus className="h-4 w-4" />
					Ajukan Peminjaman
				</Button>
			</motion.div>
		</div>
	);
}
