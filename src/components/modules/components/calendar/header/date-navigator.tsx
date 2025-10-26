import { formatDate } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/components/modules/components/calendar/contexts/calendar-context";

import {
	getEventsCount,
	navigateDate,
	rangeText,
} from "@/components/modules/components/calendar/helpers";

import type { IEvent } from "@/components/modules/components/calendar/interfaces";
import type { TCalendarView } from "@/components/modules/components/calendar/types";

interface IProps {
	view: TCalendarView;
	events: IEvent[];
}

export function DateNavigator({ view, events }: IProps) {
	const { selectedDate, setSelectedDate } = useCalendar();
	const [mounted, setMounted] = useState(false);

	const month = formatDate(selectedDate, "MMMM");
	const year = selectedDate.getFullYear();

	const eventCount = useMemo(
		() => getEventsCount(events, selectedDate, view),
		[events, selectedDate, view],
	);

	const dateRange = useMemo(
		() => rangeText(view, selectedDate),
		[view, selectedDate],
	);

	useEffect(() => {
		setMounted(true);
	}, []);

	const handlePrevious = () =>
		setSelectedDate(navigateDate(selectedDate, view, "previous"));
	const handleNext = () =>
		setSelectedDate(navigateDate(selectedDate, view, "next"));

	return (
		<div className="space-y-0.5">
			<div className="flex items-center gap-2">
				<span className="text-lg font-semibold">
					{month} {year}
				</span>
				<Badge variant="secondary">
					{eventCount} events
				</Badge>
			</div>

			<div className="flex items-center gap-2">
				<Button
					variant="outline"
					size="icon"
					className="h-6 w-6"
					onClick={handlePrevious}
				>
					<ChevronLeft className="h-4 w-4" />
				</Button>

				<p className="text-sm text-muted-foreground" suppressHydrationWarning>
					{mounted ? dateRange : "\u00A0"}
				</p>

				<Button
					variant="outline"
					size="icon"
					className="h-6 w-6"
					onClick={handleNext}
				>
					<ChevronRight className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);
}
