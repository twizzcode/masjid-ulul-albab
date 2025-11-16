import validator from "validator";
import sanitizeHtml from "sanitize-html";
import { z } from "zod";

/**
 * Sanitize string input to prevent XSS attacks
 * Removes all HTML tags and trims whitespace
 */
export function sanitizeString(input: string): string {
  if (!input || typeof input !== "string") return "";
  
  // Remove all HTML tags
  const sanitized = sanitizeHtml(input, {
    allowedTags: [],
    allowedAttributes: {},
  });
  
  // Trim whitespace and normalize
  return sanitized.trim();
}

/**
 * Validate and sanitize phone number
 * Accepts Indonesian phone format: 08xx, +628xx, 628xx
 */
export function sanitizePhoneNumber(phone: string): {
  isValid: boolean;
  sanitized: string;
  error?: string;
} {
  if (!phone || typeof phone !== "string") {
    return { isValid: false, sanitized: "", error: "Nomor telepon tidak boleh kosong" };
  }

  // Remove all non-digit characters except +
  let cleaned = phone.replace(/[^\d+]/g, "");

  // Normalize Indonesian phone numbers
  if (cleaned.startsWith("0")) {
    cleaned = "+62" + cleaned.substring(1);
  } else if (cleaned.startsWith("62")) {
    cleaned = "+" + cleaned;
  } else if (!cleaned.startsWith("+")) {
    cleaned = "+62" + cleaned;
  }

  // Validate phone number format
  if (!validator.isMobilePhone(cleaned, "id-ID")) {
    return {
      isValid: false,
      sanitized: cleaned,
      error: "Format nomor telepon tidak valid. Gunakan format: 08xxxxxxxxxx",
    };
  }

  return { isValid: true, sanitized: cleaned };
}

/**
 * Validate email address
 */
export function validateEmail(email: string): {
  isValid: boolean;
  error?: string;
} {
  if (!email || typeof email !== "string") {
    return { isValid: false, error: "Email tidak boleh kosong" };
  }

  const sanitized = sanitizeString(email);

  if (!validator.isEmail(sanitized)) {
    return { isValid: false, error: "Format email tidak valid" };
  }

  return { isValid: true };
}

/**
 * Validate date range
 */
export function validateDateRange(
  startDate: string | Date,
  endDate: string | Date
): {
  isValid: boolean;
  start?: Date;
  end?: Date;
  error?: string;
} {
  try {
    const start = typeof startDate === "string" ? new Date(startDate) : startDate;
    const end = typeof endDate === "string" ? new Date(endDate) : endDate;

    // Check if dates are valid
    if (isNaN(start.getTime())) {
      return { isValid: false, error: "Tanggal mulai tidak valid" };
    }

    if (isNaN(end.getTime())) {
      return { isValid: false, error: "Tanggal selesai tidak valid" };
    }

    // Check if end is after start
    if (end <= start) {
      return { isValid: false, error: "Tanggal selesai harus setelah tanggal mulai" };
    }

    // Check if dates are not too far in the past
    const now = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(now.getFullYear() - 1);

    if (start < oneYearAgo) {
      return { isValid: false, error: "Tanggal mulai tidak boleh lebih dari 1 tahun yang lalu" };
    }

    return { isValid: true, start, end };
  } catch {
    return { isValid: false, error: "Format tanggal tidak valid" };
  }
}

/**
 * Schema validation for booking creation
 */
export const bookingCreateSchema = z.object({
  contactName: z
    .string()
    .min(3, "Nama kontak minimal 3 karakter")
    .max(100, "Nama kontak maksimal 100 karakter")
    .refine((val) => /^[a-zA-Z\s.'\-]+$/.test(val), {
      message: "Nama hanya boleh mengandung huruf, spasi, titik, apostrof, dan tanda hubung",
    }),
  contactPhone: z
    .string()
    .min(10, "Nomor telepon minimal 10 digit")
    .max(15, "Nomor telepon maksimal 15 digit"),
  organizerName: z
    .string()
    .min(3, "Nama penyelenggara minimal 3 karakter")
    .max(150, "Nama penyelenggara maksimal 150 karakter")
    .refine((val) => /^[a-zA-Z0-9\s.,\-()]+$/.test(val), {
      message: "Nama penyelenggara hanya boleh mengandung huruf, angka, spasi, dan tanda baca",
    }),
  eventName: z
    .string()
    .min(5, "Nama acara minimal 5 karakter")
    .max(200, "Nama acara maksimal 200 karakter")
    .refine((val) => /^[a-zA-Z0-9\s.,\-()]+$/.test(val), {
      message: "Nama acara hanya boleh mengandung huruf, angka, spasi, dan tanda baca",
    }),
  location: z.enum(["aula-lantai-1", "aula-lantai-2"], {
    errorMap: () => ({ message: "Lokasi tidak valid" }),
  }),
  startDate: z.string().datetime("Format tanggal tidak valid"),
  endDate: z.string().datetime("Format tanggal tidak valid"),
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>;

/**
 * Schema validation for feedback creation
 */
export const feedbackCreateSchema = z.object({
  content: z
    .string()
    .min(10, "Konten feedback minimal 10 karakter")
    .max(1000, "Konten feedback maksimal 1000 karakter")
    .refine((val) => val.trim().length >= 10, {
      message: "Konten feedback minimal 10 karakter (tidak termasuk spasi)",
    }),
  isAnonymous: z.boolean(),
  submitterName: z
    .string()
    .min(3, "Nama minimal 3 karakter")
    .max(100, "Nama maksimal 100 karakter")
    .optional()
    .or(z.literal(""))
    .or(z.null()),
});

export type FeedbackCreateInput = z.infer<typeof feedbackCreateSchema>;

/**
 * Schema validation for booking status update
 */
export const bookingStatusUpdateSchema = z.object({
  status: z.enum(["approved", "rejected"], {
    errorMap: () => ({ message: "Status harus 'approved' atau 'rejected'" }),
  }),
  rejectionReason: z
    .string()
    .min(10, "Alasan penolakan minimal 10 karakter")
    .max(500, "Alasan penolakan maksimal 500 karakter")
    .optional(),
}).refine(
  (data) => {
    // If status is rejected, rejectionReason must be provided
    if (data.status === "rejected" && !data.rejectionReason) {
      return false;
    }
    return true;
  },
  {
    message: "Alasan penolakan wajib diisi ketika menolak booking",
    path: ["rejectionReason"],
  }
);

export type BookingStatusUpdateInput = z.infer<typeof bookingStatusUpdateSchema>;

/**
 * Validate and sanitize booking ID (UUID format)
 */
export function validateId(id: string): {
  isValid: boolean;
  error?: string;
} {
  if (!id || typeof id !== "string") {
    return { isValid: false, error: "ID tidak valid" };
  }

  // Check if it's a valid UUID (Prisma default)
  if (!validator.isUUID(id)) {
    return { isValid: false, error: "Format ID tidak valid" };
  }

  return { isValid: true };
}

/**
 * Validate file upload
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
  } = {}
): {
  isValid: boolean;
  error?: string;
} {
  const { maxSize = 2 * 1024 * 1024, allowedTypes = ["application/pdf"] } = options;

  if (!file) {
    return { isValid: false, error: "File tidak boleh kosong" };
  }

  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: `Tipe file tidak diizinkan. Hanya file ${allowedTypes.join(", ")} yang diperbolehkan`,
    };
  }

  // Check file size
  if (file.size > maxSize) {
    const maxSizeMB = maxSize / (1024 * 1024);
    return {
      isValid: false,
      error: `Ukuran file terlalu besar. Maksimal ${maxSizeMB}MB`,
    };
  }

  return { isValid: true };
}

/**
 * Sanitize month filter parameter
 */
export function sanitizeMonthFilter(month: string | null): string | null {
  if (!month || month === "all") return null;

  // Validate YYYY-MM format
  const monthRegex = /^\d{4}-(0[1-9]|1[0-2])$/;
  if (!monthRegex.test(month)) {
    return null;
  }

  const [year] = month.split("-").map(Number);
  
  // Validate year range (not too far in the past or future)
  const currentYear = new Date().getFullYear();
  if (year < currentYear - 5 || year > currentYear + 1) {
    return null;
  }

  return month;
}
