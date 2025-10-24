import { BookingData, ScheduleValidation } from "./types";

export const validateSchedule = (
  startDate?: Date,
  endDate?: Date
): ScheduleValidation => {
  if (!startDate || !endDate) {
    return null;
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (end <= start) {
    return {
      type: "error",
      message: "Waktu selesai harus lebih lama dari waktu mulai",
    };
  }

  // TODO: Cek tabrakan dengan agenda lain dari database
  return {
    type: "success",
    message: "Jadwal tersedia",
  };
};

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
      const isScheduleValid = scheduleValidation?.type !== "error";
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

  const maxSize = 1 * 1024 * 1024; // 1MB
  if (file.size > maxSize) {
    return "Ukuran file maksimal 1MB";
  }

  return null;
};
