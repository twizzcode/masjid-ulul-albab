import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DayPicker } from "@/components/ui/day-picker";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

interface DateTimePickerProps {
  date?: Date;
  onDateChange: (date: Date) => void;
  placeholder?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DateTimePicker({
  date,
  onDateChange,
  placeholder = "Pilih tanggal",
  open,
  onOpenChange,
}: DateTimePickerProps) {
  return (
    <div className="flex gap-2">
      <Popover open={open} onOpenChange={onOpenChange}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="flex-1 justify-start text-left font-normal text-xs"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, "dd MMM yyyy", { locale: id }) : placeholder}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-[100]" align="start">
          <DayPicker
            mode="single"
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                const newDate = date ? new Date(date) : new Date();
                newDate.setFullYear(
                  selectedDate.getFullYear(),
                  selectedDate.getMonth(),
                  selectedDate.getDate()
                );
                onDateChange(newDate);
                onOpenChange(false);
              }
            }}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <Input
        type="time"
        className="w-auto text-xs"
        value={date ? format(date, "HH:mm") : ""}
        onChange={(e) => {
          if (e.target.value) {
            const [hours, minutes] = e.target.value.split(":");
            const newDate = date ? new Date(date) : new Date();
            newDate.setHours(parseInt(hours), parseInt(minutes));
            onDateChange(newDate);
          }
        }}
      />
    </div>
  );
}
