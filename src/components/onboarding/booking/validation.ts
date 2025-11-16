import { BookingData, ScheduleValidation } from "./types";

export interface ValidationError {
  field: string;
  message: string;
}

export const validateContactInfo = (formData: Partial<BookingData>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!formData.contactName || formData.contactName.trim().length === 0) {
    errors.push({ field: "contactName", message: "Nama narahubung wajib diisi" });
  } else if (formData.contactName.trim().length < 3) {
    errors.push({ field: "contactName", message: "Nama narahubung minimal 3 karakter" });
  } else if (formData.contactName.trim().length > 100) {
    errors.push({ field: "contactName", message: "Nama narahubung maksimal 100 karakter" });
  } else if (!/^[a-zA-Z\s.'-]+$/.test(formData.contactName)) {
    errors.push({ field: "contactName", message: "Nama hanya boleh mengandung huruf, spasi, titik, apostrof, dan tanda hubung" });
  }

  if (!formData.contactPhone || formData.contactPhone.trim().length === 0) {
    errors.push({ field: "contactPhone", message: "Nomor telepon wajib diisi" });
  } else {
    const phone = formData.contactPhone.replace(/[^\d]/g, "");
    if (phone.length < 10) {
      errors.push({ field: "contactPhone", message: "Nomor telepon minimal 10 digit" });
    } else if (phone.length > 15) {
      errors.push({ field: "contactPhone", message: "Nomor telepon maksimal 15 digit" });
    } else if (!phone.startsWith("08") && !phone.startsWith("628") && !phone.startsWith("62")) {
      errors.push({ field: "contactPhone", message: "Format nomor telepon tidak valid. Gunakan format: 08xxxxxxxxxx" });
    }
  }

  return errors;
};

export const validateEventDetails = (formData: Partial<BookingData>): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!formData.organizerName || formData.organizerName.trim().length === 0) {
    errors.push({ field: "organizerName", message: "Nama penyelenggara wajib diisi" });
  } else if (formData.organizerName.trim().length < 3) {
    errors.push({ field: "organizerName", message: "Nama penyelenggara minimal 3 karakter" });
  } else if (formData.organizerName.trim().length > 150) {
    errors.push({ field: "organizerName", message: "Nama penyelenggara maksimal 150 karakter" });
  }

  if (!formData.eventName || formData.eventName.trim().length === 0) {
    errors.push({ field: "eventName", message: "Nama kegiatan wajib diisi" });
  } else if (formData.eventName.trim().length < 5) {
    errors.push({ field: "eventName", message: "Nama kegiatan minimal 5 karakter" });
  } else if (formData.eventName.trim().length > 200) {
    errors.push({ field: "eventName", message: "Nama kegiatan maksimal 200 karakter" });
  }

  if (!formData.letterFile || !formData.letterFileName) {
    errors.push({ field: "letterFile", message: "Surat peminjaman wajib diupload" });
  }

  return errors;
};

export const validateSchedule = (
  formData: Partial<BookingData>,
  scheduleValidation: ScheduleValidation
): ValidationError[] => {
  const errors: ValidationError[] = [];

  if (!formData.location || formData.location.trim().length === 0) {
    errors.push({ field: "location", message: "Lokasi wajib dipilih" });
  }

  if (!formData.startDate) {
    errors.push({ field: "startDate", message: "Tanggal mulai wajib diisi" });
  }

  if (!formData.endDate) {
    errors.push({ field: "endDate", message: "Tanggal selesai wajib diisi" });
  }

  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    
    if (end <= start) {
      errors.push({ field: "endDate", message: "Waktu selesai harus lebih lama dari waktu mulai" });
    }
  }

  if (scheduleValidation?.type === "error") {
    errors.push({ field: "schedule", message: scheduleValidation.message });
  }

  if (!scheduleValidation || scheduleValidation.type !== "success") {
    if (formData.location && formData.startDate && formData.endDate && errors.length === 0) {
      errors.push({ field: "schedule", message: "Menunggu pengecekan ketersediaan jadwal..." });
    }
  }

  return errors;
};

export const validateStep = (
  step: number,
  formData: Partial<BookingData>,
  scheduleValidation: ScheduleValidation
): boolean => {
  switch (step) {
    case 0: // Informasi Narahubung
      return validateContactInfo(formData).length === 0;
    
    case 1: // Detail Kegiatan
      return validateEventDetails(formData).length === 0;
    
    case 2: // Jadwal Peminjaman
      return validateSchedule(formData, scheduleValidation).length === 0;
    
    case 3: // Konfirmasi
      return true;
    
    default:
      return false;
  }
};

export const getStepValidationErrors = (
  step: number,
  formData: Partial<BookingData>,
  scheduleValidation: ScheduleValidation
): ValidationError[] => {
  switch (step) {
    case 0:
      return validateContactInfo(formData);
    case 1:
      return validateEventDetails(formData);
    case 2:
      return validateSchedule(formData, scheduleValidation);
    default:
      return [];
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
