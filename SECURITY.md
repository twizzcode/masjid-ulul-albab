# Security Implementation

## Overview
Aplikasi ini telah diimplementasikan dengan berbagai lapisan keamanan untuk melindungi dari serangan umum seperti SQL Injection, XSS (Cross-Site Scripting), dan input validation attacks.

## Security Measures

### 1. **SQL Injection Protection**
- ✅ **Prisma ORM**: Menggunakan Prisma sebagai ORM yang secara otomatis melakukan parameterized queries
- ✅ **No Raw SQL**: Tidak ada raw SQL queries yang digunakan
- ✅ **Type Safety**: TypeScript memastikan type safety di seluruh aplikasi

**Example:**
```typescript
// ✅ AMAN - Prisma automatically sanitizes
await prisma.booking.findFirst({
  where: { id: userInput }
});

// ❌ TIDAK AMAN - Raw SQL (tidak digunakan di aplikasi ini)
// await prisma.$executeRaw`SELECT * FROM bookings WHERE id = ${userInput}`
```

### 2. **XSS (Cross-Site Scripting) Protection**
- ✅ **Input Sanitization**: Semua input user dibersihkan menggunakan `sanitize-html`
- ✅ **HTML Tag Removal**: Menghapus semua HTML tags dari input
- ✅ **React Escaping**: React secara otomatis escape output di JSX

**Libraries Used:**
- `sanitize-html`: Membersihkan HTML dari input
- `validator`: Validasi format data (email, phone, UUID, etc.)

**Example:**
```typescript
import { sanitizeString } from "@/lib/validation";

// Input dari user
const rawInput = "<script>alert('XSS')</script>Hello";

// Output yang aman
const safeInput = sanitizeString(rawInput); // "Hello"
```

### 3. **Input Validation**
Menggunakan **Zod** untuk schema validation yang ketat:

#### Booking Validation:
```typescript
- contactName: 3-100 karakter, hanya huruf, spasi, titik, apostrof, tanda hubung
- contactPhone: 10-15 digit, format Indonesia
- organizerName: 3-150 karakter
- eventName: 5-200 karakter
- location: enum ["aula-lantai-1", "aula-lantai-2"]
- dates: datetime format, end > start
```

#### Feedback Validation:
```typescript
- content: 10-1000 karakter
- submitterName: 3-100 karakter (jika tidak anonymous)
- isAnonymous: boolean
```

#### Admin Actions:
```typescript
- status: enum ["approved", "rejected"]
- rejectionReason: 10-500 karakter (wajib jika rejected)
- id: UUID format validation
```

### 4. **File Upload Security**

**Validations:**
- ✅ File Type: Hanya PDF yang diperbolehkan
- ✅ File Size: Maksimal 2MB
- ✅ File Content: Validated oleh mime-type
- ✅ Unique Naming: Menggunakan nanoid dan timestamp untuk nama file unik

**Example:**
```typescript
// Validasi file
const fileValidation = validateFile(letterFile, {
  maxSize: 2 * 1024 * 1024, // 2MB
  allowedTypes: ["application/pdf"],
});
```

### 5. **Authentication & Authorization**

**Better-Auth:**
- ✅ Session-based authentication
- ✅ Role-based access control (USER, ADMIN)
- ✅ Protected routes dengan middleware

**Admin Protection:**
```typescript
// Semua admin endpoints dilindungi
const { session } = await requireAdmin();

// Otomatis throw error jika bukan admin
```

### 6. **Phone Number Sanitization**

**Format yang diterima:**
- `08xxxxxxxxxx` → dinormalisasi ke `+628xxxxxxxxxx`
- `628xxxxxxxxxx` → dinormalisasi ke `+628xxxxxxxxxx`
- `+628xxxxxxxxxx` → tetap `+628xxxxxxxxxx`

**Validation:**
- Menggunakan `validator.isMobilePhone()` untuk Indonesia
- Otomatis reject jika format tidak valid

### 7. **Date Validation**

**Checks:**
- ✅ Valid date format
- ✅ End date > Start date
- ✅ Not more than 1 year in the past
- ✅ No invalid dates (e.g., Feb 30)

### 8. **API Parameter Sanitization**

**Query Parameters:**
- `filter`: Whitelist ["all", "read", "unread"]
- `month`: Regex validation `YYYY-MM` format
- `id`: UUID format validation
- `status`: Enum validation

**Example:**
```typescript
// Month filter dengan sanitasi
const month = sanitizeMonthFilter(rawMonth);
// Hanya accept YYYY-MM format dalam range valid
```

## Validation Library (`src/lib/validation.ts`)

### Functions:

1. **`sanitizeString(input: string)`**
   - Removes all HTML tags
   - Trims whitespace
   - Safe for database storage

2. **`sanitizePhoneNumber(phone: string)`**
   - Normalizes Indonesian phone format
   - Validates with international standards
   - Returns sanitized version

3. **`validateEmail(email: string)`**
   - Validates email format
   - Returns validation status

4. **`validateDateRange(start, end)`**
   - Validates date objects
   - Checks logical order
   - Prevents historical dates

5. **`validateId(id: string)`**
   - Validates UUID format
   - Prevents invalid ID injection

6. **`validateFile(file: File, options)`**
   - Checks file type
   - Validates file size
   - Extensible options

7. **`sanitizeMonthFilter(month: string)`**
   - Validates YYYY-MM format
   - Checks year range
   - Returns null if invalid

## Zod Schemas

### `bookingCreateSchema`
Comprehensive validation for booking creation

### `feedbackCreateSchema`
Validation for feedback submission

### `bookingStatusUpdateSchema`
Admin action validation with conditional checks

## Protected API Endpoints

### Public Endpoints:
- `POST /api/bookings` - Authenticated users only
- `POST /api/feedback` - Anyone (anonymous allowed)

### Admin-Only Endpoints:
- `GET /api/admin/bookings`
- `GET /api/admin/feedback`
- `PATCH /api/admin/bookings/[id]`
- `PATCH /api/admin/feedback/[id]`
- `DELETE /api/admin/bookings/[id]`
- `DELETE /api/admin/feedback/[id]`

## Best Practices Implemented

1. ✅ **Defense in Depth**: Multiple layers of validation
2. ✅ **Fail Secure**: Default deny, explicit allow
3. ✅ **Input Validation**: All user input validated before processing
4. ✅ **Output Encoding**: React handles JSX escaping
5. ✅ **Error Handling**: Generic error messages (no info leak)
6. ✅ **Type Safety**: TypeScript throughout
7. ✅ **Least Privilege**: Role-based access control
8. ✅ **Secure by Default**: Conservative defaults

## Security Headers (Recommended)

Consider adding these headers in `next.config.ts`:

```typescript
{
  headers: [
    {
      key: 'X-Content-Type-Options',
      value: 'nosniff'
    },
    {
      key: 'X-Frame-Options',
      value: 'DENY'
    },
    {
      key: 'X-XSS-Protection',
      value: '1; mode=block'
    },
    {
      key: 'Referrer-Policy',
      value: 'strict-origin-when-cross-origin'
    }
  ]
}
```

## Audit Log

**Date**: November 16, 2025
**Status**: ✅ Security audit completed
**Files Updated**:
- `src/lib/validation.ts` (created)
- `src/app/api/bookings/route.ts`
- `src/app/api/feedback/route.ts`
- `src/app/api/admin/feedback/route.ts`
- `src/app/api/admin/bookings/[id]/route.ts`
- `src/app/api/admin/feedback/[id]/route.ts`

**Dependencies Added**:
- `validator@^13.x`
- `sanitize-html@^2.x`
- `zod@^3.x`

## Testing

Recommended security tests:
1. ✅ SQL Injection attempts
2. ✅ XSS payload injection
3. ✅ Invalid UUID attempts
4. ✅ File upload with wrong types
5. ✅ Oversized file uploads
6. ✅ Invalid date ranges
7. ✅ Unauthorized access attempts
8. ✅ Invalid phone numbers
9. ✅ HTML tag injection
10. ✅ Script tag injection

## Maintenance

- Regular dependency updates: `npm audit`
- Review security advisories
- Update validation rules as needed
- Monitor for new attack vectors

---

**Last Updated**: November 16, 2025
**Maintained By**: Development Team
