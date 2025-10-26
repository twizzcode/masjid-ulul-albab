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
		<div>
			<div className="grid grid-cols-7">
				{WEEK_DAYS.map((day) => (
					<div
						key={day}
						className="flex items-center justify-center py-2"
					>
						<span className="text-xs font-medium text-t-quaternary">{day}</span>
					</div>
				))}
			</div>

			<div className="grid grid-cols-7 overflow-hidden min-h-[450px] h-full">
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
	);
}
