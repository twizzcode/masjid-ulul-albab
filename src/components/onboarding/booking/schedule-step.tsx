import { OnboardingStep } from "../onboarding";
import { Field, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "lucide-react";
import { BookingData, ScheduleValidation } from "./types";
import { DateTimePicker } from "./date-time-picker";
import { ScheduleValidationAlert } from "./schedule-validation-alert";

interface ScheduleStepProps {
  formData: Partial<BookingData>;
  scheduleValidation: ScheduleValidation;
  startDateOpen: boolean;
  endDateOpen: boolean;
  onUpdate: (field: keyof BookingData, value: any) => void;
  onStartDateOpenChange: (open: boolean) => void;
  onEndDateOpenChange: (open: boolean) => void;
}

export function ScheduleStep({
  formData,
  scheduleValidation,
  startDateOpen,
  endDateOpen,
  onUpdate,
  onStartDateOpenChange,
  onEndDateOpenChange,
}: ScheduleStepProps) {
  return (
    <OnboardingStep
      title="Jadwal Peminjaman"
      description="Masukkan jadwal peminjaman tempat"
      icon={<Calendar className="h-5 w-5 text-primary" />}
    >
      <div className="space-y-4">
        <Field>
          <FieldLabel>
            Pilih Tempat <span className="text-red-500">*</span>
          </FieldLabel>
          <Select
            value={formData.location}
            onValueChange={(value) => onUpdate("location", value)}
          >
            <SelectTrigger className="text-xs">
              <SelectValue placeholder="Pilih lokasi tempat" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="aula-lantai-1" className="text-xs">
                Aula Lantai 1
              </SelectItem>
              <SelectItem value="aula-lantai-2" className="text-xs">
                Aula Lantai 2
              </SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <Field>
          <FieldLabel>
            Tanggal & Waktu Mulai <span className="text-red-500">*</span>
          </FieldLabel>
          <DateTimePicker
            date={formData.startDate}
            onDateChange={(date) => onUpdate("startDate", date)}
            open={startDateOpen}
            onOpenChange={onStartDateOpenChange}
          />
        </Field>

        <Field>
          <FieldLabel>
            Tanggal & Waktu Selesai <span className="text-red-500">*</span>
          </FieldLabel>
          <DateTimePicker
            date={formData.endDate}
            onDateChange={(date) => onUpdate("endDate", date)}
            open={endDateOpen}
            onOpenChange={onEndDateOpenChange}
          />
        </Field>

        <ScheduleValidationAlert validation={scheduleValidation} />
      </div>
    </OnboardingStep>
  );
}
