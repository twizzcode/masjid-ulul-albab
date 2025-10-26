// src/components/onboarding/booking/types.ts
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
	isSubmitting?: boolean;
}

export type ScheduleValidation = {
  type: "error" | "success";
  message: string;
} | null;
