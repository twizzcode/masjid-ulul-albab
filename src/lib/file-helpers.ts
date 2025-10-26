/**
 * Helper functions untuk generate URL file dari R2
 */

/**
 * Generate proxy URL untuk file PDF
 * Proxy endpoint: /api/files/bookings/[id]/[filename]
 * 
 * @param letterUrl - Full R2 public URL
 * @param bookingId - Booking ID
 * @returns Proxy URL yang aman
 */
export function getProxyFileUrl(letterUrl: string, bookingId: string): string {
	try {
		// Extract filename from letterUrl
		// Format: https://pub-xxx.r2.dev/bookings/{bookingId}/letter-{timestamp}-{random}.pdf
		const url = new URL(letterUrl);
		const pathParts = url.pathname.split("/");
		const filename = pathParts[pathParts.length - 1];

		// Return proxy URL
		return `/api/files/bookings/${bookingId}/${filename}`;
	} catch (error) {
		console.error("Error generating proxy URL:", error);
		// Fallback to original URL
		return letterUrl;
	}
}

/**
 * Check if URL is R2 public URL
 */
export function isR2Url(url: string): boolean {
	try {
		const urlObj = new URL(url);
		return urlObj.hostname.includes("r2.dev") || urlObj.hostname.includes("r2.cloudflarestorage.com");
	} catch {
		return false;
	}
}

/**
 * Get file extension from URL
 */
export function getFileExtension(url: string): string {
	try {
		const urlObj = new URL(url);
		const pathname = urlObj.pathname;
		const parts = pathname.split(".");
		return parts[parts.length - 1].toLowerCase();
	} catch {
		return "pdf";
	}
}
