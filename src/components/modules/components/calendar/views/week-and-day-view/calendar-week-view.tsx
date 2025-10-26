import {addDays, format, parseISO, startOfWeek} from "date-fns";
import {useCalendar} from "@/components/modules/components/calendar/contexts/calendar-context";
import {groupEvents} from "@/components/modules/components/calendar/helpers";
import type {IEvent} from "@/components/modules/components/calendar/interfaces";
import {CalendarTimeline} from "@/components/modules/components/calendar/views/week-and-day-view/calendar-time-line";
import {RenderGroupedEvents} from "@/components/modules/components/calendar/views/week-and-day-view/render-grouped-events";

interface IProps {
    events: IEvent[];
}

export function CalendarWeekView({events}: IProps) {
    const {selectedDate, use24HourFormat} = useCalendar();

    const weekStart = startOfWeek(selectedDate);
    const weekDays = Array.from({length: 7}, (_, i) => addDays(weekStart, i));
    const hours = Array.from({length: 24}, (_, i) => i);

    return (
        <div>
            <div className="flex flex-col items-center justify-center border-b p-4 text-sm sm:hidden">
                <p>Weekly view is not recommended on smaller devices.</p>
                <p>Please switch to a desktop device or use the daily view instead.</p>
            </div>

            <div className="flex-col sm:flex h-full">
                {/* Week header - Fixed */}
                <div className="relative z-20 flex border-b bg-background">
                    {/* Time column header - responsive width */}
                    <div className="w-18"></div>
                    <div className="grid flex-1 grid-cols-7  border-l">
                        {weekDays.map((day, index) => (
                            <span
                                key={index}
                                className="py-1 sm:py-2 text-center text-xs font-medium text-t-quaternary"
                            >
                                {/* Mobile: Show only day abbreviation and number */}
                                <span className="block sm:hidden">
                                    {format(day, "EEE").charAt(0)}
                                    <span className="block font-semibold text-t-secondary text-xs">
                                        {format(day, "d")}
                                    </span>
                                </span>
                                {/* Desktop: Show full format */}
                                <span className="hidden sm:inline">
                                    {format(day, "EE")}{" "}
                                    <span className="ml-1 font-semibold text-t-secondary">
                                        {format(day, "d")}
                                    </span>
                                </span>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Scrollable grid area */}
                <div className="flex flex-1 overflow-auto">
                    <div className="flex w-full">
                        {/* Hours column */}
                        <div className="relative w-18 flex-shrink-0">
                            {hours.map((hour, index) => (
                                <div
                                    key={hour}
                                    className="relative"
                                    style={{height: "30px"}}
                                >
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
                        </div>

                        {/* Week grid */}
                        <div className="relative flex-1 border-l">
                            <div className="grid grid-cols-7 relative">
                                {weekDays.map((day, dayIndex) => {
                                    const dayStart = new Date(day);
                                    dayStart.setHours(0, 0, 0, 0);
                                    const dayEnd = new Date(day);
                                    dayEnd.setHours(23, 59, 59, 999);

                                    const dayEvents = events.filter((event) => {
                                        const eventStart = parseISO(event.startDate);
                                        const eventEnd = parseISO(event.endDate);
                                        // Check if event overlaps with this day
                                        return eventStart <= dayEnd && eventEnd >= dayStart;
                                    });
                                    const groupedEvents = groupEvents(dayEvents);

                                    return (
                                        <div
                                            key={dayIndex}
                                            className="relative"
                                        >
                                            {/* Vertical line that extends full height - 24 hours × 30px = 720px */}
                                            {dayIndex > 0 && <div className="absolute left-0 top-0 w-px bg-border z-10" style={{ height: '720px' }} />}
                                        
                                            {hours.map((hour, index) => (
                                                <div
                                                    key={hour}
                                                    className="relative"
                                                    style={{height: "30px"}}
                                                >
                                                    {index !== 0 && (
                                                        <div
                                                            className="pointer-events-none absolute inset-x-0 top-0 border-b"></div>
                                                    )}

                                                    <div
                                                        className="pointer-events-none absolute inset-x-0 top-1/2 border-b border-dashed border-b-tertiary"></div>
                                                </div>
                                            ))}

                                            <RenderGroupedEvents
                                                groupedEvents={groupedEvents}
                                                day={day}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <CalendarTimeline/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
