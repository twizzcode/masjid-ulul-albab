# Client-Side Validation Documentation

## Overview
Aplikasi ini mengimplementasikan validasi client-side yang ketat untuk memberikan feedback langsung kepada user sebelum data dikirim ke server.

## Toast/Alert System
Menggunakan **Sonner** untuk menampilkan notifikasi validasi yang user-friendly.

### Format Alert:
```typescript
toast.error("Validasi Gagal", {
  description: "Pesan error spesifik di sini"
});
```

## Booking Form Validation

### Step-by-Step Validation
Validasi dilakukan **per step** saat user menekan tombol "Lanjutkan", bukan di akhir form.

#### Step 1: Informasi Narahubung
**Field: Nama Narahubung (`contactName`)**
- ❌ Tidak boleh kosong
- ❌ Minimal 3 karakter
- ❌ Maksimal 100 karakter
- ❌ Hanya huruf, spasi, titik (.), apostrof ('), dan tanda hubung (-)
- ✅ Contoh valid: `Ahmad Zaki`, `John O'Brien`, `Mary-Jane Watson`

**Field: Nomor Telepon (`contactPhone`)**
- ❌ Tidak boleh kosong
- ❌ Minimal 10 digit
- ❌ Maksimal 15 digit
- ❌ Harus format Indonesia (08xx)
- ✅ Contoh valid: `081234567890`, `+6281234567890`, `6281234567890`

**Alert yang muncul:**
```
❌ "Nama narahubung wajib diisi"
❌ "Nama narahubung minimal 3 karakter"
❌ "Nama hanya boleh mengandung huruf, spasi, titik, apostrof, dan tanda hubung"
❌ "Nomor telepon wajib diisi"
❌ "Nomor telepon minimal 10 digit"
❌ "Format nomor telepon tidak valid. Gunakan format: 08xxxxxxxxxx"
```

#### Step 2: Detail Kegiatan
**Field: Nama Penyelenggara (`organizerName`)**
- ❌ Tidak boleh kosong
- ❌ Minimal 3 karakter
- ❌ Maksimal 150 karakter
- ✅ Contoh valid: `Panitia Pengajian`, `Yayasan Masjid Al-Ikhlas`

**Field: Nama Kegiatan (`eventName`)**
- ❌ Tidak boleh kosong
- ❌ Minimal 5 karakter
- ❌ Maksimal 200 karakter
- ✅ Contoh valid: `Pengajian Rutin Bulanan`, `Kajian Subuh Minggu`

**Field: Surat Peminjaman (`letterFile`)**
- ❌ Wajib diupload
- ❌ Hanya file PDF
- ❌ Maksimal 2MB
- ✅ Format: `.pdf`

**Alert yang muncul:**
```
❌ "Nama penyelenggara wajib diisi"
❌ "Nama penyelenggara minimal 3 karakter"
❌ "Nama kegiatan wajib diisi"
❌ "Nama kegiatan minimal 5 karakter"
❌ "Surat peminjaman wajib diupload"
❌ "Hanya file PDF yang diperbolehkan"
❌ "Ukuran file maksimal 2MB"
```

#### Step 3: Jadwal Peminjaman
**Field: Lokasi (`location`)**
- ❌ Wajib dipilih
- ❌ Hanya "aula-lantai-1" atau "aula-lantai-2"
- ✅ Pilihan: Aula Lantai 1, Aula Lantai 2

**Field: Tanggal Mulai (`startDate`)**
- ❌ Wajib diisi
- ❌ Harus format datetime valid
- ✅ Format: ISO datetime

**Field: Tanggal Selesai (`endDate`)**
- ❌ Wajib diisi
- ❌ Harus lebih lama dari tanggal mulai
- ❌ Tidak boleh bentrok dengan booking lain
- ✅ Format: ISO datetime

**Real-time Availability Check:**
- 🔄 Cek otomatis saat lokasi/tanggal berubah
- ✅ Menampilkan "Jadwal tersedia" jika available
- ❌ Menampilkan "Waktu yang dipilih sudah dibooking" jika bentrok

**Alert yang muncul:**
```
❌ "Lokasi wajib dipilih"
❌ "Tanggal mulai wajib diisi"
❌ "Tanggal selesai wajib diisi"
❌ "Waktu selesai harus lebih lama dari waktu mulai"
❌ "Waktu yang dipilih sudah dibooking"
❌ "Menunggu pengecekan ketersediaan jadwal..."
```

#### Step 4: Konfirmasi
- ✅ Review semua data
- ✅ Tombol "Kirim Pengajuan" untuk submit

### Validation Flow
```
User mengisi Step 1
    ↓
User klik "Lanjutkan"
    ↓
Validasi Step 1 ← ALERT jika ada error
    ↓
✅ Lanjut ke Step 2
    ↓
User mengisi Step 2
    ↓
User klik "Lanjutkan"
    ↓
Validasi Step 2 ← ALERT jika ada error
    ↓
✅ Lanjut ke Step 3
    ↓
dst...
```

## Feedback Form Validation

### Single-Page Validation
Validasi dilakukan saat user menekan tombol "Kirim Feedback".

**Field: Konten Feedback (`content`)**
- ❌ Tidak boleh kosong
- ❌ Minimal 10 karakter (setelah trim)
- ❌ Maksimal 1000 karakter
- ✅ Textarea dengan counter karakter

**Field: Nama (`submitterName`)** *(jika tidak anonymous)*
- ❌ Wajib diisi jika tidak anonymous
- ❌ Minimal 3 karakter
- ❌ Maksimal 100 karakter
- ❌ Hanya huruf, spasi, titik (.), apostrof ('), dan tanda hubung (-)
- ✅ Hidden jika anonymous mode

**Field: Anonymous Toggle (`isAnonymous`)**
- ✅ Switch on/off
- ✅ Menyembunyikan nama jika active

**Alert yang muncul:**
```
❌ "Konten feedback tidak boleh kosong"
❌ "Konten feedback minimal 10 karakter"
❌ "Konten feedback maksimal 1000 karakter"
❌ "Nama harus diisi jika tidak memilih anonymous"
❌ "Nama minimal 3 karakter"
❌ "Nama maksimal 100 karakter"
❌ "Nama hanya boleh mengandung huruf, spasi, titik, apostrof, dan tanda hubung"
```

## Validation Functions

### Location
- **File**: `src/components/onboarding/booking/validation.ts`
- **Exports**:
  - `validateContactInfo()`
  - `validateEventDetails()`
  - `validateSchedule()`
  - `validateStep()`
  - `getStepValidationErrors()`
  - `validateFile()`

### Usage Example

**Booking Step Validation:**
```typescript
import { getStepValidationErrors } from "./booking/validation";

const handleNextStep = () => {
  const errors = getStepValidationErrors(currentStep, formData, scheduleValidation);
  
  if (errors.length > 0) {
    toast.error("Validasi Gagal", {
      description: errors[0].message,
    });
    return false;
  }
  
  return true;
};
```

**Feedback Validation:**
```typescript
if (!content.trim()) {
  toast.error("Validasi Gagal", {
    description: "Konten feedback tidak boleh kosong",
  });
  return;
}
```

## UI/UX Features

### Real-time Feedback
1. **Character Counter**: Menampilkan sisa karakter untuk textarea
2. **Field Highlighting**: Input field highlight merah jika error
3. **Disabled Button**: Tombol disabled jika validasi belum pass
4. **Loading State**: Spinner saat submit atau checking availability

### Toast Notifications
- **Error**: Merah dengan icon ❌
- **Success**: Hijau dengan icon ✅
- **Loading**: Biru dengan spinner 🔄

### Accessibility
- ✅ Label dengan `*` untuk required fields
- ✅ Placeholder text yang descriptive
- ✅ Error messages yang jelas dan actionable
- ✅ Keyboard navigation support

## Best Practices

### 1. Early Validation
Validasi dilakukan **per step**, bukan di akhir. User mendapat feedback segera.

### 2. Clear Error Messages
Error messages spesifik dan memberikan solusi:
- ❌ Bad: "Invalid input"
- ✅ Good: "Nama minimal 3 karakter"

### 3. Progressive Enhancement
- Client-side validation untuk UX
- Server-side validation untuk security
- Double protection layer

### 4. Visual Feedback
- Toast notifications
- Character counters
- Disabled states
- Loading spinners

## Testing Checklist

### Booking Form
- [ ] Try submitting empty fields
- [ ] Try names with numbers/symbols
- [ ] Try invalid phone numbers
- [ ] Try uploading non-PDF files
- [ ] Try files > 2MB
- [ ] Try conflicting schedules
- [ ] Try end date before start date

### Feedback Form
- [ ] Try empty content
- [ ] Try content < 10 chars
- [ ] Try content > 1000 chars
- [ ] Try anonymous without name
- [ ] Try non-anonymous with empty name
- [ ] Try names with numbers/symbols

## Future Enhancements

### Potential Improvements:
1. **Inline Validation**: Validate as user types (debounced)
2. **Field-specific Icons**: Show ✅/❌ next to each field
3. **Progress Bar**: Visual progress indicator
4. **Auto-save Draft**: Save form progress in localStorage
5. **Multi-language**: Support error messages in multiple languages

---

**Last Updated**: November 16, 2025
**Maintained By**: Development Team
