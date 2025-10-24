export interface BookingData {
  contactName: string;
  contactPhone: string;
  organizerName: string;
  eventName: string;
  startDate: Date;
  endDate: Date;
  letterFile?: File;
  letterFileName?: string;
  location?: string;
}

export interface BookingOnboardingProps {
  onComplete?: (data: BookingData) => void;
  defaultValues?: Partial<BookingData>;
}

export type ScheduleValidation = {
  type: "error" | "success";
  message: string;
} | null;
