"use client";

import React from "react";
import { useCalendar } from "@/components/modules/components/calendar/contexts/calendar-context";
import { AgendaEvents } from "@/components/modules/components/calendar/views/agenda-view/agenda-events";
import { CalendarMonthView } from "@/components/modules/components/calendar/views/month-view/calendar-month-view";
import { CalendarDayView } from "@/components/modules/components/calendar/views/week-and-day-view/calendar-day-view";
import { CalendarWeekView } from "@/components/modules/components/calendar/views/week-and-day-view/calendar-week-view";

export function CalendarBody() {
	const { view, events } = useCalendar();

	// No longer separate single-day and multi-day events - all events are treated the same
	const allEvents = events;

	return (
		<div className="flex-1 w-full overflow-auto relative">
			<div className="h-full">
				{view === "month" && (
					<CalendarMonthView
						events={allEvents}
					/>
				)}
				{view === "week" && (
					<CalendarWeekView
						events={allEvents}
					/>
				)}
				{view === "threeDays" && (
					<CalendarDayView
						events={allEvents}
						daysCount={3}
					/>
				)}
				{view === "agenda" && (
					<div>
						<AgendaEvents />
					</div>
				)}
			</div>
		</div>
	);
}
