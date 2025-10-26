import { formatDate } from "date-fns";
import { Button } from "@/components/ui/button";
import { useCalendar } from "@/components/modules/components/calendar/contexts/calendar-context";

export function TodayButton() {
	const { setSelectedDate } = useCalendar();

	const today = new Date();
	const handleClick = () => setSelectedDate(today);

	return (
		<Button
			variant="outline"
			className="flex h-14 w-14 flex-col items-center justify-center p-0 text-center"
			onClick={handleClick}
		>
			<span className="w-full bg-primary py-1 text-xs font-semibold text-primary-foreground">
				{formatDate(today, "MMM").toUpperCase()}
			</span>
			<span className="text-lg font-bold">
				{today.getDate()}
			</span>
		</Button>
	);
}
