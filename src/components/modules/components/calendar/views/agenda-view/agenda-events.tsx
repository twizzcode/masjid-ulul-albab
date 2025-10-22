import {differenceInMinutes, format, parseISO} from "date-fns";
import type {FC} from "react";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {cn} from "@/lib/utils";
import {useCalendar} from "@/components/modules/components/calendar/contexts/calendar-context";
import {EventDetailsDialog} from "@/components/modules/components/calendar/dialogs/event-details-dialog";
import {
    formatTime,
    getBgColor,
    getColorClass, getEventsForMonth,
    getFirstLetters,
    toCapitalize,
} from "@/components/modules/components/calendar/helpers";
import {EventBullet} from "@/components/modules/components/calendar/views/month-view/event-bullet";
import type {IEvent} from "@/components/modules/components/calendar/interfaces";

// Calculate event height based on duration (30px per hour)
const getEventHeight = (event: IEvent): number => {
    const startDate = typeof event.startDate === 'string' ? parseISO(event.startDate) : event.startDate;
    const endDate = typeof event.endDate === 'string' ? parseISO(event.endDate) : event.endDate;
    const durationMinutes = differenceInMinutes(endDate, startDate);
    const durationHours = durationMinutes / 60;
    // Total height includes padding: 30px per hour (matching week/day view)
    const height = Math.max(30, durationHours * 30);
    return height;
};

export const AgendaEvents: FC = () => {
    const {events, use24HourFormat, badgeVariant, agendaModeGroupBy, selectedDate} =
        useCalendar();

    const monthEvents = getEventsForMonth(events, selectedDate)

    const agendaEvents = Object.groupBy(monthEvents, (event) => {
        return agendaModeGroupBy === "date"
            ? format(parseISO(event.startDate), "yyyy-MM-dd")
            : event.color;
    });

    const groupedAndSortedEvents = Object.entries(agendaEvents).sort(
        (a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime(),
    );

    return (
        <Command className="py-2 h-auto max-h-[720px] bg-transparent">
            <div className="mb-2 mx-4">
                <CommandInput placeholder="Type a command or search..."/>
            </div>
            <CommandList className="max-h-[650px] px-3 border-t">
                {groupedAndSortedEvents.map(([date, groupedEvents]) => (
                    <CommandGroup
                        key={date}
                        heading={
                            agendaModeGroupBy === "date"
                                ? format(parseISO(date), "EEEE, MMMM d, yyyy")
                                : toCapitalize(groupedEvents![0].color)
                        }
                    >
                        {groupedEvents!.map((event) => {
                            const eventHeight = getEventHeight(event);
                            return (
                                <CommandItem
                                    key={event.id}
                                    style={{ height: `${eventHeight}px` }}
                                    className={cn(
                                        "mb-1.5 p-1.5 border rounded-md data-[selected=true]:bg-bg transition-all data-[selected=true]:text-none hover:cursor-pointer overflow-hidden",
                                        {
                                            [getColorClass(event.color)]: badgeVariant === "colored",
                                            "hover:bg-zinc-200 dark:hover:bg-gray-900":
                                                badgeVariant === "dot",
                                            "hover:opacity-60": badgeVariant === "colored",
                                        },
                                    )}
                                >
                                    <EventDetailsDialog event={event}>
                                        <div className="w-full flex items-center justify-between gap-3">
                                            <div className="flex items-center gap-2">
                                                {badgeVariant === "dot" ? (
                                                    <EventBullet color={event.color}/>
                                                ) : (
                                                    <Avatar className="h-8 w-8">
                                                        <AvatarImage src="" alt="@shadcn"/>
                                                        <AvatarFallback className={getBgColor(event.color)}>
                                                            {getFirstLetters(event.title)}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                )}
                                                <div className="flex flex-col">
                                                    <p
                                                        className={cn("text-sm", {
                                                            "font-medium": badgeVariant === "dot",
                                                            "text-foreground": badgeVariant === "dot",
                                                        })}
                                                    >
                                                        {event.title}
                                                    </p>
                                                    <p className="text-muted-foreground text-xs line-clamp-1 text-ellipsis md:text-clip w-1/3">
                                                        {event.description}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="w-36 flex justify-center items-center gap-1">
                                                {agendaModeGroupBy === "date" ? (
                                                    <>
                                                        <p className="text-xs">
                                                            {formatTime(event.startDate, use24HourFormat)}
                                                        </p>
                                                        <span className="text-muted-foreground text-xs">-</span>
                                                        <p className="text-xs">
                                                            {formatTime(event.endDate, use24HourFormat)}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="text-xs">
                                                            {format(event.startDate, "MM/dd/yyyy")}
                                                        </p>
                                                        <span className="text-xs">at</span>
                                                        <p className="text-xs">
                                                            {formatTime(event.startDate, use24HourFormat)}
                                                        </p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </EventDetailsDialog>
                                </CommandItem>
                            );
                        })}
                    </CommandGroup>
                ))}
                <CommandEmpty>No results found.</CommandEmpty>
            </CommandList>
        </Command>
    );
};
