import { useMemo } from "react";
import { useCalendar } from "@/components/modules/components/calendar/contexts/calendar-context";

import {
	calculateMonthEventPositions,
	getCalendarCells,
} from "@/components/modules/components/calendar/helpers";

import type { IEvent } from "@/components/modules/components/calendar/interfaces";
import { DayCell } from "@/components/modules/components/calendar/views/month-view/day-cell";

interface IProps {
	events: IEvent[];
}

const WEEK_DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView({ events }: IProps) {
	const { selectedDate } = useCalendar();

	const cells = useMemo(() => getCalendarCells(selectedDate), [selectedDate]);

	const eventPositions = useMemo(
		() =>
			calculateMonthEventPositions(
				events,
				selectedDate,
			),
		[events, selectedDate],
	);

	return (
		<div className="flex flex-col h-full">
			{/* Header hari - tidak ikut scroll */}
			<div className="grid grid-cols-7 border-b border-border bg-background sticky top-0 z-10">
				{WEEK_DAYS.map((day) => (
					<div
						key={day}
						className="flex items-center justify-center py-3 border-r border-border last:border-r-0"
					>
						<span className="text-sm font-semibold text-foreground">{day}</span>
					</div>
				))}
			</div>

			{/* Grid tanggal - bisa scroll */}
			<div className="flex-1 overflow-auto scrollbar-hide">
				<div className="grid grid-cols-7 min-h-[500px]">
					{cells.map((cell, index) => (
						<DayCell
							key={index}
							cell={cell}
							events={events}
							eventPositions={eventPositions}
						/>
					))}
				</div>
			</div>
		</div>
	);
}
