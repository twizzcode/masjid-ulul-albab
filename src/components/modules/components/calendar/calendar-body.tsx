"use client";

import { motion } from "framer-motion";
import React from "react";
import { fadeIn, transition } from "@/components/modules/components/calendar/animations";
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
			<motion.div
				key={view}
				initial="initial"
				animate="animate"
				exit="exit"
				variants={fadeIn}
				transition={transition}
				className="h-full"
			>
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
					<motion.div
						key="agenda"
						initial="initial"
						animate="animate"
						exit="exit"
						variants={fadeIn}
						transition={transition}
					>
						<AgendaEvents />
					</motion.div>
				)}
			</motion.div>
		</div>
	);
}
