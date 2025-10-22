"use client";

import { enUS } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { DayPicker as ReactDayPicker } from "react-day-picker";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type TDayPickerProps = ComponentProps<typeof ReactDayPicker>;

function DayPicker({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: TDayPickerProps) {
	return (
		<ReactDayPicker
			showOutsideDays={showOutsideDays}
			navLayout="after"
			className={cn("p-3", className)}
			classNames={{
				months:
					"flex flex-col select-none sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
				month: "space-y-4",

				month_caption: "flex justify-between items-center h-10 px-2",
				caption_label: "text-sm font-medium flex-1 text-center",
				nav: "flex items-center gap-1 flex-shrink-0",
				button_previous: cn(
					buttonVariants({ variant: "outline" }),
					"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
				),
				button_next: cn(
					buttonVariants({ variant: "outline" }),
					"h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
				),
				month_grid: "w-full border-collapse mt-4",
				weekdays: "grid grid-cols-7",
				weekday: "w-9 h-9 font-medium text-xs text-muted-foreground flex items-center justify-center",
				weeks: "w-full",
				week: "grid grid-cols-7 mt-2",
				day: "w-9 h-9 text-center text-sm p-0 relative flex items-center justify-center",
				day_button: cn(
					"h-9 w-9 p-0 font-normal rounded-full hover:bg-accent hover:text-accent-foreground transition-colors",
					"aria-selected:bg-primary aria-selected:text-primary-foreground aria-selected:font-semibold",
					"aria-selected:hover:bg-primary aria-selected:hover:text-primary-foreground",
				),
				today: "bg-accent text-accent-foreground font-semibold",
				outside: "text-muted-foreground opacity-50",
				disabled: "text-muted-foreground opacity-50",
				hidden: "invisible",
				...classNames,
			}}
			components={{
				Chevron: ({ orientation }) =>
					orientation === "left" ? (
						<ChevronLeft className="size-4" />
					) : (
						<ChevronRight className="size-4" />
					),
			}}
			locale={enUS}
			{...props}
		/>
	);
}

export { DayPicker };
