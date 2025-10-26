import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkIsAdmin } from "@/lib/auth-helpers";

// GET /api/admin/bookings/verify/[id]?action=approve|reject&token=xxx
export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const { id: bookingId } = await params;
		const searchParams = request.nextUrl.searchParams;
		const action = searchParams.get("action");
		const token = searchParams.get("token");

		// Validasi action
		if (!action || !["approve", "reject"].includes(action)) {
			return NextResponse.json({ error: "Invalid action" }, { status: 400 });
		}

		// Validasi token (optional - bisa pakai simple token atau jwt)
		// Untuk sekarang, kita pakai simple check
		if (!token) {
			return NextResponse.json({ error: "Token required" }, { status: 401 });
		}

		// Get booking
		const booking = await prisma.booking.findUnique({
			where: { id: bookingId },
			include: {
				user: {
					select: {
						id: true,
						name: true,
						email: true,
					},
				},
			},
		});

		if (!booking) {
			return NextResponse.json({ error: "Booking not found" }, { status: 404 });
		}

		// Check if already processed
		if (booking.status !== "pending") {
			return new NextResponse(
				`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Peminjaman Sudah Diproses</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      max-width: 400px;
      text-align: center;
    }
    h1 { color: #1f2937; margin-bottom: 1rem; }
    p { color: #6b7280; line-height: 1.6; }
    .status {
      display: inline-block;
      padding: 0.5rem 1rem;
      border-radius: 9999px;
      font-weight: 600;
      margin-top: 1rem;
    }
    .approved { background: #d1fae5; color: #065f46; }
    .rejected { background: #fee2e2; color: #991b1b; }
  </style>
</head>
<body>
  <div class="card">
    <h1>⚠️ Sudah Diproses</h1>
    <p>Peminjaman ini sudah diproses sebelumnya.</p>
    <div class="status ${booking.status === "approved" ? "approved" : "rejected"}">
      Status: ${booking.status === "approved" ? "✅ Disetujui" : "❌ Ditolak"}
    </div>
  </div>
</body>
</html>
				`,
				{
					status: 200,
					headers: { "Content-Type": "text/html" },
				}
			);
		}

		// Decode token and verify (simple implementation)
		// Token format: base64(adminId:bookingId)
		let adminId: string;
		try {
			const decoded = Buffer.from(token, "base64").toString("utf-8");
			const [id, bId] = decoded.split(":");

			if (bId !== bookingId) {
				throw new Error("Invalid token");
			}

			// Check if admin
			const isAdmin = await checkIsAdmin(id);
			if (!isAdmin) {
				throw new Error("Not admin");
			}

			adminId = id;
		} catch {
			return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
		}

		// Update booking status
		await prisma.booking.update({
			where: { id: bookingId },
			data: {
				status: action === "approve" ? "approved" : "rejected",
				approvedBy: adminId,
				approvedAt: new Date(),
				...(action === "reject" && {
					rejectionReason: "Ditolak via WhatsApp",
				}),
			},
		});

		// Return success HTML page
		return new NextResponse(
			`
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verifikasi Berhasil</title>
  <style>
    body {
      font-family: system-ui, -apple-system, sans-serif;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      margin: 0;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
    .card {
      background: white;
      padding: 2rem;
      border-radius: 1rem;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
      max-width: 500px;
    }
    h1 { color: #1f2937; margin-bottom: 1rem; }
    p { color: #6b7280; line-height: 1.6; margin-bottom: 0.5rem; }
    .success { color: #059669; font-weight: 600; font-size: 1.25rem; margin-bottom: 1.5rem; }
    .info { background: #f3f4f6; padding: 1rem; border-radius: 0.5rem; margin-top: 1rem; }
    .info strong { color: #1f2937; }
  </style>
</head>
<body>
  <div class="card">
    <h1>✅ Verifikasi Berhasil</h1>
    <p class="success">
      Peminjaman ${action === "approve" ? "disetujui" : "ditolak"}
    </p>
    <div class="info">
      <p><strong>Nama Kegiatan:</strong> ${booking.eventName}</p>
      <p><strong>Penyelenggara:</strong> ${booking.organizerName}</p>
      <p><strong>Pemohon:</strong> ${booking.user.name}</p>
      <p><strong>Lokasi:</strong> ${booking.location === "aula-lantai-1" ? "Aula Lantai 1" : "Aula Lantai 2"}</p>
    </div>
    <p style="margin-top: 1.5rem; text-align: center; color: #9ca3af; font-size: 0.875rem;">
      User akan mendapat notifikasi otomatis.
    </p>
  </div>
</body>
</html>
			`,
			{
				status: 200,
				headers: { "Content-Type": "text/html" },
			}
		);
	} catch (error) {
		console.error("Verify booking error:", error);
		return NextResponse.json({ error: "Failed to verify booking" }, { status: 500 });
	}
}
