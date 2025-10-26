# 🔧 Cloudflare R2 CORS Setup - Fix "File Berbahaya"

## 🎯 Problem

Ketika mencoba membuka file PDF dari R2, browser menganggap file berbahaya dan tidak bisa dibuka. Ini biasanya disebabkan oleh:

1. **CORS headers tidak dikonfigurasi**
2. **Content-Type headers salah**
3. **Content-Disposition tidak diset**

## ✅ Solution

### Step 1: Fix Backend Upload Headers (Already Done)

File: `src/app/api/bookings/route.ts`

```typescript
const uploadCommand = new PutObjectCommand({
  Bucket: R2_BUCKET_NAME,
  Key: fileName,
  Body: buffer,
  ContentType: "application/pdf", // ✅ Hard-coded untuk PDF
  ContentDisposition: "inline", // ✅ Allow inline viewing (tidak force download)
  CacheControl: "public, max-age=31536000", // ✅ Cache 1 tahun
  Metadata: {
    bookingId: booking.id,
    originalName: letterFile.name,
    uploadedBy: session.user.id,
    uploadedAt: new Date().toISOString(),
  },
});
```

### Step 2: Configure CORS di Cloudflare R2 Dashboard

#### Option A: Via Cloudflare Dashboard (Recommended)

1. **Login ke Cloudflare Dashboard**
   - Buka: https://dash.cloudflare.com/
   - Login dengan akun Cloudflare Anda

2. **Navigate ke R2**
   - Klik **R2** di sidebar kiri
   - Pilih bucket Anda (misal: `masjid-booking-letters`)

3. **Settings Tab**
   - Klik tab **Settings**
   - Scroll ke bagian **CORS Policy**

4. **Add CORS Rule**
   
   Klik **Add CORS policy** dan masukkan:

   ```json
   [
     {
       "AllowedOrigins": [
         "http://localhost:3000",
         "https://yourdomain.com"
       ],
       "AllowedMethods": [
         "GET",
         "HEAD"
       ],
       "AllowedHeaders": [
         "*"
       ],
       "ExposeHeaders": [
         "ETag",
         "Content-Type",
         "Content-Length",
         "Content-Disposition"
       ],
       "MaxAgeSeconds": 3600
     }
   ]
   ```

   **Notes:**
   - Replace `https://yourdomain.com` dengan domain production Anda
   - Untuk development, keep `http://localhost:3000`

5. **Save CORS Policy**
   - Klik **Save**
   - CORS akan aktif dalam beberapa menit

#### Option B: Via Wrangler CLI (Advanced)

```bash
# Install wrangler jika belum
npm install -g wrangler

# Login
wrangler login

# Create CORS config file
cat > cors.json << EOF
[
  {
    "AllowedOrigins": ["http://localhost:3000", "https://yourdomain.com"],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["*"],
    "ExposeHeaders": ["ETag", "Content-Type", "Content-Length", "Content-Disposition"],
    "MaxAgeSeconds": 3600
  }
]
EOF

# Apply CORS to bucket
wrangler r2 bucket cors put <YOUR_BUCKET_NAME> --file cors.json
```

### Step 3: Verify Public Access

1. **Check Public Access Settings**
   - Di Cloudflare Dashboard → R2 → Your Bucket
   - Tab **Settings** → **Public Access**
   - Pastikan **"Allow Access"** ENABLED

2. **Get Public URL**
   - Setelah enable, Anda akan dapat **Public Bucket URL**
   - Format: `https://pub-xxxxxxxxxxxxx.r2.dev`
   - Copy URL ini

3. **Update .env**
   ```bash
   R2_PUBLIC_URL="https://pub-xxxxxxxxxxxxx.r2.dev"
   ```

### Step 4: Test Upload & Access

1. **Upload file baru** melalui form `/pinjam`
2. **Check di admin dashboard** - klik tombol "Lihat" untuk download
3. **Verify headers** dengan browser DevTools:
   - Buka DevTools (F12)
   - Tab **Network**
   - Klik file PDF
   - Check **Response Headers**:
     ```
     content-type: application/pdf
     content-disposition: inline
     access-control-allow-origin: *
     cache-control: public, max-age=31536000
     ```

## 🔒 Security Considerations

### Production CORS Policy (More Restrictive)

Untuk production, gunakan CORS policy yang lebih ketat:

```json
[
  {
    "AllowedOrigins": [
      "https://yourdomain.com",
      "https://www.yourdomain.com"
    ],
    "AllowedMethods": ["GET", "HEAD"],
    "AllowedHeaders": ["Content-Type"],
    "ExposeHeaders": ["Content-Length"],
    "MaxAgeSeconds": 3600
  }
]
```

**Best Practices:**
- ❌ Jangan gunakan `"*"` di production untuk AllowedOrigins
- ✅ Hanya allow domain Anda sendiri
- ✅ Hanya allow method GET dan HEAD (read-only)
- ✅ Set MaxAgeSeconds sesuai kebutuhan cache

## 🐛 Troubleshooting

### Problem: Masih muncul "File berbahaya"

**Solution 1: Clear Browser Cache**
```
Chrome: Ctrl + Shift + Delete → Clear cached images and files
Firefox: Ctrl + Shift + Delete → Cache
```

**Solution 2: Check CORS Headers**
```bash
# Test dengan curl
curl -I https://pub-xxxxx.r2.dev/bookings/xxx/letter-xxx.pdf

# Should return:
# content-type: application/pdf
# content-disposition: inline
# access-control-allow-origin: *
```

**Solution 3: Re-upload File**
- Delete booking lama
- Upload ulang melalui form
- File baru akan memiliki headers yang benar

### Problem: CORS policy tidak apply

**Possible Causes:**
1. Salah bucket name
2. CORS JSON format salah
3. Perlu wait 5-10 menit untuk propagation

**Solution:**
```bash
# Verify CORS policy
wrangler r2 bucket cors get <YOUR_BUCKET_NAME>

# Should return your CORS config
```

### Problem: File force download instead of inline view

**Cause:** `Content-Disposition` header salah

**Fix:**
```typescript
// Make sure ini di upload command:
ContentDisposition: "inline", // NOT "attachment"
```

## 📋 Checklist

Sebelum production, pastikan:

- [ ] CORS policy sudah dikonfigurasi di R2 dashboard
- [ ] Public access enabled untuk bucket
- [ ] R2_PUBLIC_URL di .env sudah benar
- [ ] Upload command include `ContentDisposition: "inline"`
- [ ] Test upload file baru dan verify bisa dibuka
- [ ] Browser DevTools confirm headers sudah benar
- [ ] Production domain sudah ditambahkan di AllowedOrigins

## 🎓 Additional Resources

- [Cloudflare R2 CORS Documentation](https://developers.cloudflare.com/r2/buckets/cors/)
- [S3 PutObjectCommand API Reference](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/s3/command/PutObjectCommand/)
- [Content-Disposition Header](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Disposition)

