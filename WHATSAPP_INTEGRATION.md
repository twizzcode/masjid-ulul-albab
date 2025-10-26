# 📱 WhatsApp Notification Integration

## Overview
Sistem akan mengirim notifikasi WhatsApp ke admin saat ada peminjaman baru, dengan link verifikasi langsung untuk approve/reject.

## Features

### 1. **Auto Notification** (Coming Soon)
Saat user submit peminjaman, sistem otomatis kirim WhatsApp ke admin dengan:
- Detail peminjaman lengkap
- Link download surat PDF
- Quick action buttons (Approve/Reject)

### 2. **One-Click Verification**
Admin bisa approve/reject langsung dari WhatsApp tanpa login dashboard:
- ✅ Klik link "Setujui" → Peminjaman approved
- ❌ Klik link "Tolak" → Peminjaman rejected

### 3. **File Organization**
File tersimpan terstruktur di R2:
```
bookings/
├── {booking-id-1}/
│   └── letter-{timestamp}-{random}.pdf
├── {booking-id-2}/
│   └── letter-{timestamp}-{random}.pdf
└── ...
```

---

## Setup

### 1. Environment Variables
Tambahkan di `.env.local`:
```env
ADMIN_WHATSAPP_NUMBER="628123456789"  # Format: 62xxx (Indonesia)
```

### 2. Get Admin WhatsApp URL (Manual Testing)
Saat user submit booking, response API akan include `whatsappNotificationUrl`:

```json
{
  "success": true,
  "booking": { ... },
  "whatsappNotificationUrl": "https://wa.me/628xxx?text=..."
}
```

Copy URL tersebut dan buka di browser → WhatsApp Web akan terbuka dengan message siap kirim.

---

## Message Format

### Admin Notification
```
🔔 PENGAJUAN PEMINJAMAN TEMPAT BARU

📋 Detail Peminjaman:
• Nama Kegiatan: Kajian Rutin
• Penyelenggara: UKKI UNNES
• Lokasi: Aula Lantai 1

👤 Narahubung:
• Nama: John Doe
• Kontak: 08123456789

📅 Jadwal:
• Mulai: Minggu, 27 Oktober 2025 - 09:00 WIB
• Selesai: Minggu, 27 Oktober 2025 - 12:00 WIB

📄 Surat Peminjaman:
https://pub-xxxxx.r2.dev/bookings/xxx/letter.pdf

━━━━━━━━━━━━━━━━━
⚡ VERIFIKASI CEPAT:

✅ Setujui:
https://yourapp.com/api/admin/bookings/verify/xxx?action=approve&token=xxx

❌ Tolak:
https://yourapp.com/api/admin/bookings/verify/xxx?action=reject&token=xxx

Klik link di atas untuk verifikasi langsung
```

---

## Verification Flow

### 1. Admin Clicks Approve Link
```
User clicks: https://app.com/api/admin/bookings/verify/{id}?action=approve&token={token}
     ↓
System validates token
     ↓
Check if booking still pending
     ↓
Update booking status to "approved"
     ↓
Show success page in browser
```

### 2. Success Page
```html
✅ Verifikasi Berhasil
Peminjaman disetujui

Detail Peminjaman:
• Nama Kegiatan: ...
• Penyelenggara: ...
• Pemohon: ...
• Lokasi: ...

User akan mendapat notifikasi otomatis.
```

---

## Security

### Token Format
```
base64(adminId:timestamp:bookingId)
```

Example:
```
admin123:1730000000000:booking456
↓ base64 encode ↓
YWRtaW4xMjM6MTczMDAwMDAwMDAwMDpib29raW5nNDU2
```

### Validation
1. Decode token
2. Extract adminId, timestamp, bookingId
3. Verify bookingId matches URL parameter
4. Check if adminId has ADMIN role
5. Check if booking still pending

---

## API Endpoints

### POST /api/bookings
Create new booking + generate WhatsApp notification

**Response:**
```json
{
  "success": true,
  "booking": {
    "id": "cm123abc",
    "eventName": "Kajian Rutin",
    "status": "pending"
  },
  "whatsappNotificationUrl": "https://wa.me/628xxx?text=..." // Optional, for testing
}
```

### GET /api/admin/bookings/verify/[id]
Verify booking via WhatsApp link

**Query Params:**
- `action`: "approve" | "reject"
- `token`: base64 encoded verification token

**Response:** HTML page (success/error)

---

## File Size & Organization

### Limits
- **Max file size:** 2MB
- **Format:** PDF only

### Structure in R2
```
bookings/
  └── {booking-id}/
      └── letter-{timestamp}-{random}.pdf
```

**Benefits:**
- Easy cleanup: Delete folder when booking deleted
- Easy tracking: One folder per booking
- Organized: Files grouped by booking

---

## Admin Dashboard

### View Letter Button
Admin dashboard akan show tombol untuk download/view surat:

```tsx
📄 Surat Peminjaman
   filename.pdf
   [Lihat] button → Opens PDF in new tab
```

---

## Testing

### 1. Manual Testing (Development)
1. Submit booking via `/pinjam`
2. Check API response di Network tab
3. Copy `whatsappNotificationUrl`
4. Open in browser
5. Click approve/reject link in message

### 2. Production Flow
1. User submit booking
2. Backend kirim WhatsApp (via third-party API or manual)
3. Admin terima message di WhatsApp
4. Admin klik link approve/reject
5. Browser open success page
6. User dapat notifikasi

---

## Next Steps

### Phase 1: Manual Notification (Current)
- ✅ Generate WhatsApp URL in API response
- ✅ Admin manually send message
- ✅ Verification links working

### Phase 2: Auto Notification (Future)
Integrate with WhatsApp API:
- [Twilio](https://www.twilio.com/whatsapp)
- [WhatsApp Business API](https://business.whatsapp.com/)
- [Fonnte](https://fonnte.com/) (Indonesia)
- [Wablas](https://wablas.com/) (Indonesia)

Example integration:
```typescript
// After booking created
await sendWhatsAppNotification({
  to: process.env.ADMIN_WHATSAPP_NUMBER,
  message: generateAdminWhatsAppMessage(bookingData),
});
```

---

## Troubleshooting

### Link tidak berfungsi
- ✅ Check `NEXT_PUBLIC_API_URL` di `.env.local`
- ✅ Pastikan format: `http://localhost:3000` atau `https://yourdomain.com`
- ✅ No trailing slash

### Token invalid
- ✅ Token expired? (add expiry validation if needed)
- ✅ Admin ID benar?
- ✅ Booking ID match?

### File tidak bisa diakses
- ✅ Public access enabled di R2 bucket?
- ✅ `R2_PUBLIC_URL` benar?
- ✅ File successfully uploaded?

---

**Status:** ✅ Ready for Testing
**File Size:** 2MB max
**Format:** PDF only
**Organization:** `bookings/{id}/letter-{timestamp}.pdf`
