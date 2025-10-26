import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import prisma from "@/lib/prisma";

export async function GET(
	req: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	try {
		const session = await auth.api.getSession({
			headers: await headers(),
		});

		if (!session) {
			return NextResponse.json(
				{ error: "Unauthorized. Please login first." },
				{ status: 401 }
			);
		}

		const { id } = await params;

		const booking = await prisma.booking.findUnique({
			where: { id },
			include: {
				user: {
					select: {
						name: true,
						email: true,
					},
				},
			},
		});

		if (!booking) {
			return NextResponse.json(
				{ error: "Booking not found" },
				{ status: 404 }
			);
		}

		// Verify ownership (user can only view their own bookings)
		if (booking.userId !== session.user.id) {
			return NextResponse.json(
				{ error: "Forbidden. You can only view your own bookings." },
				{ status: 403 }
			);
		}

		return NextResponse.json({ booking }, { status: 200 });
	} catch (error) {
		console.error("Get booking detail error:", error);
		return NextResponse.json(
			{ error: "Failed to fetch booking" },
			{ status: 500 }
		);
	}
}
