import { BookingData, ScheduleValidation } from "./types";

export const validateStep = (
  step: number,
  formData: Partial<BookingData>,
  scheduleValidation: ScheduleValidation
): boolean => {
  switch (step) {
    case 0: // Informasi Narahubung
      return !!(formData.contactName && formData.contactPhone);
    
    case 1: // Detail Kegiatan
      return !!(formData.organizerName && formData.eventName && formData.letterFileName);
    
    case 2: // Jadwal Peminjaman
      const hasAllScheduleFields = !!(
        formData.location &&
        formData.startDate &&
        formData.endDate
      );
      const isScheduleValid = scheduleValidation?.type === "success";
      return hasAllScheduleFields && isScheduleValid;
    
    case 3: // Konfirmasi
      return true;
    
    default:
      return false;
  }
};

export const validateFile = (file: File): string | null => {
  if (file.type !== "application/pdf") {
    return "Hanya file PDF yang diperbolehkan";
  }

  const maxSize = 2 * 1024 * 1024; // 2MB
  if (file.size > maxSize) {
    return "Ukuran file maksimal 2MB";
  }

  return null;
};
