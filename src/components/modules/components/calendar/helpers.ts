import {
	addDays,
	addMonths,
	addWeeks,
	differenceInDays,
	differenceInMinutes,
	eachDayOfInterval,
	endOfMonth,
	endOfWeek,
	format,
	isSameDay,
	isSameMonth,
	isSameWeek,
	isValid,
	parseISO,
	startOfDay,
	startOfMonth,
	startOfWeek,
	subDays,
	subMonths,
	subWeeks,
} from "date-fns";
import { useCalendar } from "@/components/modules/components/calendar/contexts/calendar-context";
import type {
	ICalendarCell,
	IEvent,
} from "@/components/modules/components/calendar/interfaces";
import type {
	TCalendarView,
	TEventColor,
} from "@/components/modules/components/calendar/types";

const FORMAT_STRING = "MMM d, yyyy";

export function rangeText(view: TCalendarView, date: Date): string {
	let start: Date;
	let end: Date;

	switch (view) {
		case "month":
			start = startOfMonth(date);
			end = endOfMonth(date);
			break;
		case "week":
			start = startOfWeek(date);
			end = endOfWeek(date);
			break;
		case "threeDays":
			start = date;
			end = addDays(date, 2);
			break;
		case "agenda":
			start = startOfMonth(date);
			end = endOfMonth(date);
			break;
		default:
			return "Error while formatting";
	}

	return `${format(start, FORMAT_STRING)} - ${format(end, FORMAT_STRING)}`;
}

export function navigateDate(
	date: Date,
	view: TCalendarView,
	direction: "previous" | "next",
): Date {
const operations: Record<TCalendarView, (d: Date, n: number) => Date> = {
	month: direction === "next" ? addMonths : subMonths,
	week: direction === "next" ? addWeeks : subWeeks,
	threeDays: direction === "next" ? addDays : subDays,
	agenda: direction === "next" ? addMonths : subMonths,
};	return operations[view](date, view === "threeDays" ? 3 : 1);
}

export function getEventsCount(
	events: IEvent[],
	date: Date,
	view: TCalendarView,
): number {
	if (view === "threeDays") {
		// For threeDays view, count events in the next 3 days starting from selected date
		const day1 = startOfDay(date);
		const day2 = addDays(day1, 1);
		const day3 = addDays(day1, 2);
		
		return events.filter((event) => {
			const eventDate = parseISO(event.startDate);
			return isSameDay(eventDate, day1) || 
			       isSameDay(eventDate, day2) || 
			       isSameDay(eventDate, day3);
		}).length;
	}

	const compareFns: Record<Exclude<TCalendarView, "threeDays">, (d1: Date, d2: Date) => boolean> = {
		week: isSameWeek,
		month: isSameMonth,
		agenda: isSameMonth,
	};
	
	const compareFn = compareFns[view];
	return events.filter((event) => compareFn(parseISO(event.startDate), date))
		.length;
}

export function groupEvents(dayEvents: IEvent[]): IEvent[][] {
	const sortedEvents = dayEvents.sort(
		(a, b) => parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime(),
	);
	const groups: IEvent[][] = [];

	for (const event of sortedEvents) {
		const eventStart = parseISO(event.startDate);
		let placed = false;

		for (const group of groups) {
			const lastEventInGroup = group[group.length - 1];
			const lastEventEnd = parseISO(lastEventInGroup.endDate);

			if (eventStart >= lastEventEnd) {
				group.push(event);
				placed = true;
				break;
			}
		}

		if (!placed) groups.push([event]);
	}

	return groups;
}

export function getEventBlockStyle(
	event: IEvent,
	day: Date,
	groupIndex: number,
	groupSize: number,
) {
	const eventStartDate = parseISO(event.startDate);
	const eventEndDate = parseISO(event.endDate);
	const dayStart = startOfDay(day);
	const dayEnd = new Date(day);
	dayEnd.setHours(23, 59, 59, 999);

	// Clip event start/end to the current day
	const effectiveStart = eventStartDate < dayStart ? dayStart : eventStartDate;
	const effectiveEnd = eventEndDate > dayEnd ? dayEnd : eventEndDate;

	const startMinutes = differenceInMinutes(effectiveStart, dayStart);
	const durationMinutes = differenceInMinutes(effectiveEnd, effectiveStart);

	const top = (startMinutes / 1440) * 100; // 1440 minutes in a day
	const height = (durationMinutes / 1440) * 100; // height as percentage
	const width = 100 / groupSize;
	const left = groupIndex * width;

	return { 
		top: `${top}%`, 
		height: `${height}%`,
		width: `${width}%`, 
		left: `${left}%` 
	};
}

export function getCalendarCells(selectedDate: Date): ICalendarCell[] {
	const year = selectedDate.getFullYear();
	const month = selectedDate.getMonth();

	const daysInMonth = endOfMonth(selectedDate).getDate(); // Faster than new Date(year, month + 1, 0)
	const firstDayOfMonth = startOfMonth(selectedDate).getDay();
	const daysInPrevMonth = endOfMonth(new Date(year, month - 1)).getDate();
	const totalDays = firstDayOfMonth + daysInMonth;

	const prevMonthCells = Array.from({ length: firstDayOfMonth }, (_, i) => ({
		day: daysInPrevMonth - firstDayOfMonth + i + 1,
		currentMonth: false,
		date: new Date(year, month - 1, daysInPrevMonth - firstDayOfMonth + i + 1),
	}));

	const currentMonthCells = Array.from({ length: daysInMonth }, (_, i) => ({
		day: i + 1,
		currentMonth: true,
		date: new Date(year, month, i + 1),
	}));

	const nextMonthCells = Array.from(
		{ length: (7 - (totalDays % 7)) % 7 },
		(_, i) => ({
			day: i + 1,
			currentMonth: false,
			date: new Date(year, month + 1, i + 1),
		}),
	);

	return [...prevMonthCells, ...currentMonthCells, ...nextMonthCells];
}

export function calculateMonthEventPositions(
	events: IEvent[],
	selectedDate: Date,
): Record<string, number> {
	const monthStart = startOfMonth(selectedDate);
	const monthEnd = endOfMonth(selectedDate);

	const eventPositions: Record<string, number> = {};
	const occupiedPositions: Record<string, boolean[]> = {};

	eachDayOfInterval({ start: monthStart, end: monthEnd }).forEach((day) => {
		occupiedPositions[day.toISOString()] = [false, false, false];
	});

	const sortedEvents = events.sort((a, b) => {
		const aDuration = differenceInDays(
			parseISO(a.endDate),
			parseISO(a.startDate),
		);
		const bDuration = differenceInDays(
			parseISO(b.endDate),
			parseISO(b.startDate),
		);
		return (
			bDuration - aDuration ||
			parseISO(a.startDate).getTime() - parseISO(b.startDate).getTime()
		);
	});

	sortedEvents.forEach((event) => {
		const eventStart = parseISO(event.startDate);
		const eventEnd = parseISO(event.endDate);
		const eventDays = eachDayOfInterval({
			start: eventStart < monthStart ? monthStart : eventStart,
			end: eventEnd > monthEnd ? monthEnd : eventEnd,
		});

		let position = -1;

		for (let i = 0; i < 3; i++) {
			if (
				eventDays.every((day) => {
					const dayPositions = occupiedPositions[startOfDay(day).toISOString()];
					return dayPositions && !dayPositions[i];
				})
			) {
				position = i;
				break;
			}
		}

		if (position !== -1) {
			eventDays.forEach((day) => {
				const dayKey = startOfDay(day).toISOString();
				occupiedPositions[dayKey][position] = true;
			});
			eventPositions[event.id] = position;
		}
	});

	return eventPositions;
}

export function getMonthCellEvents(
	date: Date,
	events: IEvent[],
	eventPositions: Record<string, number>,
) {
	const dayStart = startOfDay(date);
	const eventsForDate = events.filter((event) => {
		const eventStart = parseISO(event.startDate);
		const eventEnd = parseISO(event.endDate);
		return (
			(dayStart >= eventStart && dayStart <= eventEnd) ||
			isSameDay(dayStart, eventStart) ||
			isSameDay(dayStart, eventEnd)
		);
	});

	return eventsForDate
		.map((event) => ({
			...event,
			position: eventPositions[event.id] ?? -1,
			isMultiDay: event.startDate !== event.endDate,
		}))
		.sort((a, b) => {
			if (a.isMultiDay && !b.isMultiDay) return -1;
			if (!a.isMultiDay && b.isMultiDay) return 1;
			return a.position - b.position;
		});
}

export function formatTime(
	date: Date | string,
	use24HourFormat: boolean,
): string {
	const parsedDate = typeof date === "string" ? parseISO(date) : date;
	if (!isValid(parsedDate)) return "";
	return format(parsedDate, use24HourFormat ? "HH:mm" : "h:mm a");
}

export const getFirstLetters = (str: string): string => {
	if (!str) return "";
	const words = str.split(" ");
	if (words.length === 1) return words[0].charAt(0).toUpperCase();
	return `${words[0].charAt(0).toUpperCase()}${words[1].charAt(0).toUpperCase()}`;
};

export const getEventsForDay = (
	events: IEvent[],
	date: Date,
	isWeek = false,
): IEvent[] => {
	const targetDate = startOfDay(date);
	return events
		.filter((event) => {
			const startOfDayForEventStart = startOfDay(parseISO(event.startDate));
			const startOfDayForEventEnd = startOfDay(parseISO(event.endDate));
			if (isWeek) {
				return (
					event.startDate !== event.endDate &&
					startOfDayForEventStart <= targetDate &&
					startOfDayForEventEnd >= targetDate
				);
			}
			return (
				startOfDayForEventStart <= targetDate &&
				startOfDayForEventEnd >= targetDate
			);
		})
		.map((event) => {
			const eventStart = startOfDay(parseISO(event.startDate));
			const eventEnd = startOfDay(parseISO(event.endDate));
			let point: "start" | "end" | "none" | undefined;

			if (isSameDay(eventStart, eventEnd)) {
				point = "none";
			} else if (isSameDay(eventStart, targetDate)) {
				point = "start";
			} else if (isSameDay(eventEnd, targetDate)) {
				point = "end";
			}

			return { ...event, point };
		});
};

export const getWeekDates = (date: Date): Date[] => {
	const startDate = startOfWeek(date, { weekStartsOn: 1 });
	return Array.from({ length: 7 }, (_, i) => addDays(startDate, i));
};

export const getEventsForWeek = (events: IEvent[], date: Date): IEvent[] => {
	const weekDates = getWeekDates(date);
	const startOfWeekDate = weekDates[0];
	const endOfWeekDate = weekDates[6];

	return events.filter((event) => {
		const eventStart = parseISO(event.startDate);
		const eventEnd = parseISO(event.endDate);
		return (
			isValid(eventStart) &&
			isValid(eventEnd) &&
			eventStart <= endOfWeekDate &&
			eventEnd >= startOfWeekDate
		);
	});
};

export const getEventsForMonth = (events: IEvent[], date: Date): IEvent[] => {
	const startOfMonthDate = startOfMonth(date);
	const endOfMonthDate = endOfMonth(date);

	return events.filter((event) => {
		const eventStart = parseISO(event.startDate);
		const eventEnd = parseISO(event.endDate);
		return (
			isValid(eventStart) &&
			isValid(eventEnd) &&
			eventStart <= endOfMonthDate &&
			eventEnd >= startOfMonthDate
		);
	});
};

export const getColorClass = (color: string): string => {
	const colorClasses: Record<TEventColor, string> = {
		red: "border-red-200 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300",
		yellow:
			"border-yellow-200 bg-yellow-50 text-yellow-700 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-300",
		green:
			"border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300",
		blue: "border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300",
		orange:
			"border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-800 dark:bg-orange-950 dark:text-orange-300",
		purple:
			"border-purple-200 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950 dark:text-purple-300",
	};
	return colorClasses[color as TEventColor] || "";
};

export const getBgColor = (color: string): string => {
	const colorClasses: Record<TEventColor, string> = {
		red: "bg-red-400 dark:bg-red-600",
		yellow: "bg-yellow-400 dark:bg-yellow-600",
		green: "bg-green-400 dark:bg-green-600",
		blue: "bg-blue-400 dark:bg-blue-600",
		orange: "bg-orange-400 dark:bg-orange-600",
		purple: "bg-purple-400 dark:bg-purple-600",
	};
	return colorClasses[color as TEventColor] || "";
};

export const useGetEventsByMode = (events: IEvent[]) => {
	const { view, selectedDate } = useCalendar();

	switch (view) {
		case "threeDays":
			return getEventsForDay(events, selectedDate);
		case "week":
			return getEventsForWeek(events, selectedDate);
		case "agenda":
		case "month":
			return getEventsForMonth(events, selectedDate);
		default:
			return [];
	}
};

export const toCapitalize = (str: string): string => {
	if (!str) return "";
	return str.charAt(0).toUpperCase() + str.slice(1);
};
