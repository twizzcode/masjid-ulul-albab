import { addDays, format, isWithinInterval, parseISO } from "date-fns";
import { Calendar, Clock, User } from "lucide-react";
import { useRef } from "react";
import { DayPicker } from "@/components/ui/day-picker";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCalendar } from "@/components/modules/components/calendar/contexts/calendar-context";

import { AddEditEventDialog } from "@/components/modules/components/calendar/dialogs/add-edit-event-dialog";
import { groupEvents } from "@/components/modules/components/calendar/helpers";
import type { IEvent } from "@/components/modules/components/calendar/interfaces";
import { CalendarTimeline } from "@/components/modules/components/calendar/views/week-and-day-view/calendar-time-line";
import { RenderGroupedEvents } from "@/components/modules/components/calendar/views/week-and-day-view/render-grouped-events";

interface IProps {
	events: IEvent[];
	daysCount?: number;
}

export function CalendarDayView({ events, daysCount = 1 }: IProps) {
	const { selectedDate, setSelectedDate, users, use24HourFormat } =
		useCalendar();
	const scrollAreaRef = useRef<HTMLDivElement>(null);

	const hours = Array.from({ length: 24 }, (_, i) => i);
	
	// Generate array of dates to display
	const daysToDisplay = Array.from({ length: daysCount }, (_, i) => 
		addDays(selectedDate, i)
	);

	const getCurrentEvents = (allEvents: IEvent[]) => {
		const now = new Date();

		return (
			allEvents.filter((event) =>
				isWithinInterval(now, {
					start: parseISO(event.startDate),
					end: parseISO(event.endDate),
				}),
			) || []
		);
	};

	const currentEvents = getCurrentEvents(events);

	// Get events for all displayed days - including multi-day events that span across this day
	const getDayEvents = (day: Date) => {
		const dayStart = new Date(day);
		dayStart.setHours(0, 0, 0, 0);
		const dayEnd = new Date(day);
		dayEnd.setHours(23, 59, 59, 999);

		return events.filter((event) => {
			const eventStart = parseISO(event.startDate);
			const eventEnd = parseISO(event.endDate);
			
			// Check if event overlaps with this day
			return eventStart <= dayEnd && eventEnd >= dayStart;
		});
	};

	return (
		<div className="flex h-full">
			<div className="flex flex-1 flex-col">
				{/* Day header - Fixed */}
				<div className="relative z-20 flex border-b bg-background">
					<div className="w-18"></div>
					{daysToDisplay.map((day) => (
						<span key={day.toISOString()} className="flex-1 border-l py-2 text-center text-xs font-medium text-t-quaternary">
							{format(day, "EE")}{" "}
							<span className="font-semibold text-t-secondary">
								{format(day, "d")}
							</span>
						</span>
					))}
				</div>

				{/* Scrollable grid area */}
				<div className="flex flex-1 overflow-auto">
					<div className="flex w-full">
						{/* Hours column */}
						<div className="relative w-18 flex-shrink-0">
							{hours.map((hour, index) => (
								<div key={hour} className="relative" style={{ height: "30px" }}>
									<div className="absolute -top-2 right-2 flex h-4 items-center">
										{index !== 0 && (
											<span className="text-[10px] text-t-quaternary">
												{format(
													new Date().setHours(hour, 0, 0, 0),
													use24HourFormat ? "HH:00" : "h a",
												)}
											</span>
										)}
									</div>
								</div>
							))}
						</div>						{/* Day grid - Loop through each day */}
						<div className="flex flex-1 relative">
							{daysToDisplay.map((day, dayIdx) => {
								const eventsForDay = getDayEvents(day);
								const groupedEventsForDay = groupEvents(eventsForDay);
								
								return (
									<div key={day.toISOString()} className="relative flex-1">
										{/* Vertical line that extends full height - 24 hours × 30px = 720px */}
										{dayIdx > 0 && <div className="absolute left-0 top-0 w-px bg-border z-10" style={{ height: '720px' }} />}
										
										<div className="relative">
											{hours.map((hour, index) => (
												<div
													key={hour}
													className="relative border-b"
													style={{ height: "30px" }}
												>
													<AddEditEventDialog
														startDate={day}
														startTime={{ hour, minute: 0 }}
													>
														<div className="absolute inset-x-0 top-0 h-[15px] cursor-pointer transition-colors hover:bg-secondary" />
													</AddEditEventDialog>

													<div className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed border-b-tertiary"></div>

													<AddEditEventDialog
														startDate={day}
														startTime={{ hour, minute: 30 }}
													>
														<div className="absolute inset-x-0 bottom-0 h-[15px] cursor-pointer transition-colors hover:bg-secondary" />
													</AddEditEventDialog>
												</div>
											))}
											<RenderGroupedEvents
												groupedEvents={groupedEventsForDay}
												day={day}
											/>
										</div>

										{daysCount === 1 && <CalendarTimeline />}
									</div>
								);
							})}
						</div>
					</div>
				</div>
			</div>			<div className="hidden w-72 divide-y border-l md:block">
				<DayPicker
					className="mx-auto w-fit"
					mode="single"
					selected={selectedDate}
					onSelect={(date) => date && setSelectedDate(date)}
					initialFocus
				/>

				<div className="flex-1 space-y-3">
					{currentEvents.length > 0 ? (
						<div className="flex items-start gap-2 px-4 pt-4">
							<span className="relative mt-[5px] flex size-2.5">
								<span className="absolute inline-flex size-full animate-ping rounded-full bg-green-400 opacity-75"></span>
								<span className="relative inline-flex size-2.5 rounded-full bg-green-600"></span>
							</span>

							<p className="text-sm font-semibold text-t-secondary">
								Happening now
							</p>
						</div>
					) : (
						<p className="p-4 text-center text-sm italic text-t-tertiary">
							No appointments or consultations at the moment
						</p>
					)}

					{currentEvents.length > 0 && (
						<ScrollArea className="h-[422px] px-4" type="always">
							<div className="space-y-6 pb-4">
								{currentEvents.map((event) => {
									const user = users.find((user) => user.id === event.user.id);

									return (
										<div key={event.id} className="space-y-1.5">
											<p className="line-clamp-2 text-sm font-semibold">
												{event.title}
											</p>

											{user && (
												<div className="flex items-center gap-1.5">
													<User className="size-4 text-t-quinary" />
													<span className="text-sm text-t-tertiary">
														{user.name}
													</span>
												</div>
											)}

											<div className="flex items-center gap-1.5">
												<Calendar className="size-4 text-t-quinary" />
												<span className="text-sm text-t-tertiary">
													{format(new Date(event.startDate), "MMM d, yyyy")}
												</span>
											</div>

											<div className="flex items-center gap-1.5">
												<Clock className="size-4 text-t-quinary" />
												<span className="text-sm text-t-tertiary">
													{format(
														parseISO(event.startDate),
														use24HourFormat ? "HH:mm" : "hh:mm a",
													)}{" "}
													-
													{format(
														parseISO(event.endDate),
														use24HourFormat ? "HH:mm" : "hh:mm a",
													)}
												</span>
											</div>
										</div>
									);
								})}
							</div>
						</ScrollArea>
					)}
				</div>
			</div>
		</div>
	);
}
