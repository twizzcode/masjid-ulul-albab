# 📝 Summary: Integrasi Cloudflare R2 untuk Upload File

## ✅ Yang Sudah Dikerjakan

### 1. **File Upload Strategy**
- ✅ File **TIDAK** langsung diupload saat user pilih file
- ✅ File **HANYA** diupload saat user klik "Kirim Pengajuan" (step terakhir)
- ✅ Jika user tidak selesai onboarding, file tidak diupload (hemat storage)

### 2. **Dependencies Installed**
- ✅ `@aws-sdk/client-s3` - untuk koneksi ke R2
- ✅ `nanoid` - untuk generate unique ID

### 3. **Files Created**

#### `src/lib/r2.ts`
Konfigurasi R2 client dengan credentials dari environment variables.

#### `src/app/api/upload/route.ts`
API endpoint untuk upload file (optional, bisa dipakai untuk upload terpisah).

#### `.env.example`
Template untuk environment variables yang diperlukan.

#### `CLOUDFLARE_R2_SETUP.md`
Dokumentasi lengkap cara setup R2 dari awal sampai akhir.

### 4. **Files Modified**

#### `src/components/onboarding/booking/types.ts`
- ✅ Removed `letterFileUrl` (tidak perlu karena upload di backend)
- ✅ Keep `letterFile` dan `letterFileName` untuk handle file object

#### `src/components/onboarding/booking/file-upload-field.tsx`
- ✅ Simplified - hanya handle file selection (no upload)
- ✅ Validasi PDF dan max 5MB di frontend
- ✅ Text updated: "File akan diupload saat Anda mengirim peminjaman"

#### `src/components/onboarding/booking/use-booking-form.ts`
- ✅ Simplified `handleRemoveFile` - no URL handling

#### `src/app/api/bookings/route.ts`
- ✅ Changed from JSON to FormData
- ✅ Handle file upload ke R2
- ✅ Generate unique filename: `{userId}/{timestamp}-{random}.pdf`
- ✅ Save file URL to database (`letterUrl` field)
- ✅ File validation (PDF, max 5MB)

#### `src/app/(main)/pinjam/page.tsx`
- ✅ Submit menggunakan FormData (bukan JSON)
- ✅ Include file dalam FormData
- ✅ Validasi file exists sebelum submit

### 5. **Database Schema**
- ✅ `letterUrl` field sudah ada di Booking model
- ✅ `letterFileName` untuk simpan original filename
- ⏳ Perlu run: `npx prisma db push` dan `npx prisma generate`

---

## 🔧 Yang Perlu Dilakukan User

### Step 1: Setup Cloudflare R2
Ikuti panduan di `CLOUDFLARE_R2_SETUP.md`:
1. Buat bucket di Cloudflare R2
2. Buat API token
3. Enable public access
4. Copy credentials

### Step 2: Setup Environment Variables
Tambahkan ke `.env.local`:
```env
R2_ACCOUNT_ID="your-account-id"
R2_ACCESS_KEY_ID="your-access-key"
R2_SECRET_ACCESS_KEY="your-secret-key"
R2_BUCKET_NAME="masjid-ulul-albab-files"
R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
```

### Step 3: Run Database Migration
```bash
npx prisma db push
npx prisma generate
```

### Step 4: Restart Dev Server
```bash
npm run dev
```

### Step 5: Test
1. Login
2. Buka `/pinjam`
3. Lengkapi form dan upload PDF
4. Submit - file akan terupload ke R2

---

## 📊 Flow Diagram

```
User Select File
    ↓
Validasi (PDF, max 5MB)
    ↓
File tersimpan di state (belum upload)
    ↓
User isi form lainnya
    ↓
User klik "Kirim Pengajuan"
    ↓
Frontend: Buat FormData dengan file
    ↓
POST /api/bookings dengan FormData
    ↓
Backend: Upload file ke R2
    ↓
Backend: Save booking + file URL ke DB
    ↓
Success! User redirect ke /peminjaman-saya
```

---

## 🎯 Key Features

✅ **Lazy Upload**: File hanya diupload saat benar-benar submit
✅ **Validation**: Double validation (frontend + backend)
✅ **Unique Naming**: Filename unik dengan timestamp + random ID
✅ **Public Access**: File bisa diakses via public URL
✅ **Metadata**: Original filename, uploader, timestamp tersimpan
✅ **Error Handling**: Proper error messages di setiap step
✅ **File Organization**: Files organized by userId

---

## 🔐 Security Checklist

- ✅ File type validation (PDF only)
- ✅ File size validation (max 5MB)
- ✅ Authentication required untuk upload
- ✅ Filename sanitization (no user input in filename)
- ✅ Unique IDs prevent filename collision
- ✅ Metadata tracking untuk audit trail

---

## 📱 Next Steps (Optional Enhancements)

1. **Admin File Review**
   - Tampilkan link download file di admin dashboard
   - Preview PDF inline

2. **User File Management**
   - Tampilkan file di booking history
   - Allow re-upload jika ditolak

3. **File Cleanup**
   - Hapus file dari R2 saat booking dihapus
   - Scheduled cleanup untuk orphaned files

4. **Analytics**
   - Track total storage used
   - Monitor upload success rate

---

**Status**: ✅ Implementation Complete
**Ready to Test**: Setelah setup R2 credentials
**Documentation**: CLOUDFLARE_R2_SETUP.md
