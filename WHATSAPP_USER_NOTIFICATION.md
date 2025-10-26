# WhatsApp User Notification - Dokumentasi

## 📱 Fitur Notifikasi WhatsApp untuk User

Fitur ini memungkinkan user untuk mengirim notifikasi ke admin melalui WhatsApp tentang peminjaman yang masih dalam status **pending**.

## 🎯 Cara Kerja

### 1. User Flow

1. User mengisi form peminjaman di `/pinjam`
2. Setelah submit berhasil, user diarahkan ke halaman `/riwayat`
3. Di halaman `/riwayat`, user dapat melihat semua peminjaman mereka
4. Untuk peminjaman dengan status **pending**, terdapat tombol **"Konfirmasi via WhatsApp"**
5. Ketika tombol diklik:
   - Sistem generate pesan WhatsApp dengan detail peminjaman
   - WhatsApp Web/App terbuka di tab baru
   - Pesan sudah terisi otomatis, user tinggal klik kirim
   - Admin menerima notifikasi dengan link langsung ke dashboard

### 2. Isi Pesan WhatsApp

Pesan yang dikirim ke admin berisi:

```
Assalamualaikum Admin,

Saya mengajukan peminjaman fasilitas Masjid Ulul Albab dengan detail sebagai berikut:

📋 *Detail Peminjaman*
• Nama Kegiatan: [nama kegiatan]
• Penyelenggara: [nama penyelenggara]
• Lokasi: [lokasi]
• Tanggal: [tanggal lengkap]
• Waktu: [waktu mulai] - [waktu akhir] WIB

👤 *Narahubung*
• Nama: [nama narahubung]
• No. HP: [nomor telepon]

📎 *Surat Peminjaman*
Sudah dilampirkan dalam sistem

Mohon untuk dapat diproses lebih lanjut. Untuk melihat detail lengkap dan melakukan verifikasi, silakan klik link berikut:

🔗 [link ke dashboard admin]

Terima kasih atas perhatiannya.

Wassalamualaikum Wr. Wb.
```

### 3. Admin Dashboard Integration

Ketika admin mengklik link dari WhatsApp:

1. Link membuka dashboard admin: `/admin/peminjaman?bookingId={id}`
2. Booking yang dimaksud otomatis **di-highlight** dengan ring biru
3. Halaman otomatis **scroll** ke booking tersebut
4. Admin dapat langsung approve/reject dari dashboard

## 🔧 Technical Implementation

### API Endpoint

**POST** `/api/bookings/[id]/notify-admin`

**Authorization:** Requires user session

**Request:**
- No body required
- `id` dari URL params

**Response:**
```json
{
  "success": true,
  "whatsappUrl": "https://wa.me/628123456789?text=..."
}
```

**Error Cases:**
- `401` - User not authenticated
- `404` - Booking not found
- `403` - Booking doesn't belong to current user
- `400` - Booking status is not pending
- `500` - Server error

### Environment Variables

```bash
# Nomor WhatsApp Admin (format: 628123456789)
ADMIN_WHATSAPP_NUMBER="628123456789"

# Base URL aplikasi (untuk generate dashboard link)
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### Frontend Components

**File:** `src/app/(main)/riwayat/page.tsx`

**State Management:**
```typescript
const [isSendingWhatsApp, setIsSendingWhatsApp] = useState(false);
```

**Function:**
```typescript
const handleSendWhatsAppToAdmin = async (booking: Booking) => {
  // Generate WhatsApp URL via API
  // Open in new tab
  // Show success toast
}
```

**Button (hanya muncul untuk status pending):**
```tsx
<Button
  onClick={() => handleSendWhatsAppToAdmin(selectedBooking)}
  className="bg-green-600 hover:bg-green-700"
  disabled={isSendingWhatsApp}
>
  <MessageCircle className="w-4 h-4 mr-2" />
  Konfirmasi via WhatsApp
</Button>
```

### Admin Dashboard Integration

**File:** `src/app/(main)/admin/peminjaman/page.tsx`

**Query Parameter Handling:**
```typescript
const searchParams = useSearchParams();
const highlightedBookingId = searchParams.get("bookingId");
```

**Auto-scroll & Highlight:**
```typescript
useEffect(() => {
  if (highlightedBookingId && bookings.length > 0) {
    // Scroll to highlighted booking
    bookingRefs.current[highlightedBookingId]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }
}, [highlightedBookingId, bookings]);
```

**Highlight Styling:**
```tsx
<Card 
  className={isHighlighted ? "ring-2 ring-blue-500 shadow-lg" : ""}
  ref={(el) => bookingRefs.current[booking.id] = el}
>
```

## 🎨 UI/UX Features

### Tombol WhatsApp
- **Warna:** Hijau (#16a34a) sesuai branding WhatsApp
- **Icon:** MessageCircle dari lucide-react
- **Loading State:** Animasi pulse saat processing
- **Position:** Di atas tombol "Batalkan Peminjaman"
- **Visibility:** Hanya muncul untuk booking dengan status **pending**

### Admin Dashboard Highlight
- **Ring:** 2px solid biru (#3b82f6)
- **Shadow:** Elevated shadow untuk emphasis
- **Scroll:** Smooth scroll dengan block center
- **Timing:** 300ms delay untuk smooth rendering

## 📝 Notes

1. **Security:**
   - Endpoint memvalidasi session user
   - Hanya user pemilik booking yang bisa kirim notifikasi
   - Hanya booking dengan status pending yang bisa di-notifikasi

2. **User Experience:**
   - WhatsApp terbuka di tab baru (tidak mengganggu workflow)
   - Pesan sudah terisi otomatis
   - Toast notification untuk feedback
   - Button disabled saat processing

3. **Admin Experience:**
   - Link langsung ke booking spesifik
   - Auto-highlight dan scroll
   - Tidak perlu mencari manual
   - Dapat langsung approve/reject

4. **Mobile Friendly:**
   - WhatsApp Web untuk desktop
   - WhatsApp App untuk mobile
   - Link format: `https://wa.me/{number}?text={message}`

## 🚀 Future Enhancements

Potential improvements:
- [ ] Track notification history (siapa sudah kirim notifikasi berapa kali)
- [ ] Rate limiting (prevent spam)
- [ ] Template message customization
- [ ] Multi-language support
- [ ] Read receipt tracking
- [ ] Automated reminders for admin

## 🐛 Troubleshooting

**Problem:** WhatsApp tidak terbuka
- **Solution:** Pastikan format nomor WhatsApp benar (62...)
- **Check:** Browser popup blocker tidak memblokir window.open()

**Problem:** Admin tidak bisa klik link
- **Solution:** Pastikan NEXT_PUBLIC_APP_URL di env sudah benar
- **Check:** Aplikasi accessible dari internet (jika production)

**Problem:** Booking tidak ter-highlight
- **Solution:** Check browser console untuk error
- **Check:** Pastikan bookingId di query param sama dengan ID di database

