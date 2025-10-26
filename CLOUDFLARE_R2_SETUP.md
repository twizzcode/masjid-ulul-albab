# Setup Cloudflare R2 untuk Upload File

## 📋 Ringkasan Implementasi

File PDF sekarang akan diupload ke Cloudflare R2 **hanya saat user submit form** (step terakhir). Jadi jika user tidak menyelesaikan onboarding, file tidak akan diupload.

## 🚀 Langkah Setup

### 1. Buat Cloudflare R2 Bucket

1. Login ke https://dash.cloudflare.com/
2. Pilih **R2** di sidebar kiri
3. Klik **Create bucket**
4. Isi nama bucket: `masjid-ulul-albab-files`
5. Pilih region terdekat (APAC recommended)
6. Klik **Create bucket**

### 2. Buat API Token

1. Di halaman R2, klik **Manage R2 API Tokens**
2. Klik **Create API token**
3. Isi form:
   - **Name**: `masjid-ulul-albab-upload-token`
   - **Permissions**: Object Read & Write
   - **TTL**: No expiry
4. Klik **Create API Token**
5. **⚠️ PENTING - Copy dan simpan**:
   - `Access Key ID`
   - `Secret Access Key`
   - `Endpoint URL` (format: `https://<account-id>.r2.cloudflarestorage.com`)

### 3. Setup Public Access (Agar file bisa diakses)

1. Di halaman bucket, klik **Settings**
2. Scroll ke **Public access**
3. Klik **Allow Access**
4. Copy **Public bucket URL**: `https://pub-xxxxx.r2.dev`

### 4. Setup Environment Variables

Tambahkan ke file `.env.local`:

```env
# Cloudflare R2 Storage
R2_ACCOUNT_ID="your-cloudflare-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key-id"
R2_SECRET_ACCESS_KEY="your-r2-secret-access-key"
R2_BUCKET_NAME="masjid-ulul-albab-files"
R2_PUBLIC_URL="https://pub-xxxxx.r2.dev"
```

**Cara mendapatkan R2_ACCOUNT_ID:**
- Dari endpoint URL: `https://[ACCOUNT_ID].r2.cloudflarestorage.com`
- Atau dari dashboard URL: `https://dash.cloudflare.com/[ACCOUNT_ID]`

### 5. Push Database Schema

```bash
npx prisma db push
npx prisma generate
```

### 6. Restart Dev Server

```bash
npm run dev
```

## ✅ Test Upload

1. Login ke aplikasi
2. Buka `/pinjam`
3. Isi semua step onboarding
4. Upload file PDF (max 5MB)
5. Klik "Kirim Pengajuan" di step terakhir
6. File akan:
   - Diupload ke R2
   - Disimpan dengan nama unik: `{userId}/{timestamp}-{random}.pdf`
   - URL disimpan di database

## 📁 File Structure Upload

Files disimpan di R2 dengan struktur:
```
bucket-name/
  └── {userId}/
      ├── 1729876543210-abc123xyz.pdf
      ├── 1729876789012-def456uvw.pdf
      └── ...
```

## 🔒 Security

- ✅ File hanya diupload setelah validasi lengkap
- ✅ Maksimal size 5MB
- ✅ Hanya accept PDF files
- ✅ Filename di-sanitize dengan timestamp + random ID
- ✅ Metadata tersimpan (original name, uploader, timestamp)

## 🌐 File Access

Setelah upload, file bisa diakses di:
```
https://pub-xxxxx.r2.dev/{userId}/{timestamp}-{random}.pdf
```

URL ini tersimpan di database field `letterUrl` dan bisa ditampilkan di:
- Admin dashboard untuk review
- User's booking history
- Calendar event details

## 🛠️ Troubleshooting

### Error: "R2_ACCOUNT_ID is not set"
- Pastikan `.env.local` sudah dibuat dan berisi semua R2 credentials
- Restart dev server setelah mengubah .env

### Error: "Access Denied"
- Cek API token permissions (harus Object Read & Write)
- Pastikan endpoint URL benar

### Error: "Bucket not found"
- Pastikan nama bucket di `.env.local` sama persis dengan di Cloudflare
- Case sensitive!

### File tidak bisa diakses
- Pastikan public access sudah diaktifkan
- Check R2_PUBLIC_URL sudah benar

## 📊 Monitoring

File uploads bisa di-monitor di:
- Cloudflare R2 dashboard > Bucket > Objects
- Application logs (console.log pada error)
- Database `bookings` table (`letterUrl` field)

---

**Status**: ✅ Ready to use
**Last Updated**: 2024
