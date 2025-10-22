import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { cn } from "@/lib/utils";
import { useCalendar } from "../contexts/calendar-context";
import {
  CalendarRange,
  Calendar,
  Columns,
  Grid3X3,
} from "lucide-react";
import { TCalendarView } from "../types";
import { memo } from "react";

const tabs = [
  {
    name: "3 Days",
    value: "threeDays",
    icon: () => <Calendar className="h-4 w-4" />,
    mobileOnly: true,
  },
  {
    name: "Week",
    value: "week",
    icon: () => <Columns className="h-4 w-4" />,
    desktopOnly: true,
  },
  {
    name: "Month",
    value: "month",
    icon: () => <Grid3X3 className="h-4 w-4" />,
  },
  {
    name: "Agenda",
    value: "agenda",
    icon: () => <CalendarRange className="h-4 w-4" />,
  },
];

function Views() {
  const { view, setView } = useCalendar();

  return (
    <Tabs
      value={view}
      onValueChange={(value) => setView(value as TCalendarView)}
      className="gap-4 sm:w-auto w-full"
    >
      <TabsList className="h-auto gap-2 rounded-xl p-1 w-full sm:w-auto">
        {tabs.map(({ icon: Icon, name, value, mobileOnly, desktopOnly }) => {
          const isActive = view === value;

          return (
            <TabsTrigger
              key={value}
              value={value}
              className={cn(
                "flex h-9 items-center gap-2 rounded-lg px-3 transition-all",
                isActive 
                  ? "!bg-primary !text-primary-foreground shadow-sm font-semibold" 
                  : "bg-transparent hover:bg-muted text-foreground",
                mobileOnly && "sm:hidden",
                desktopOnly && "hidden sm:flex"
              )}
              onClick={() => setView(value as TCalendarView)}
            >
              <Icon />
              <span className="font-medium text-sm">{name}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
    </Tabs>
  );
}

export default memo(Views);