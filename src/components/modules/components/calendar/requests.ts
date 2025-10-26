import prisma from "@/lib/prisma";
import type { IEvent } from "./interfaces";
import { USERS_MOCK } from "@/components/modules/components/calendar/mocks";

export const getEvents = async (): Promise<IEvent[]> => {
    try {
        // Fetch ALL bookings from database (pending, approved, rejected)
        const bookings = await prisma.booking.findMany({
            include: { user: true },
            orderBy: { startDate: "asc" },
        });

        const events: IEvent[] = bookings.map((b, i) => {
            // Color based on status:
            // - pending: yellow
            // - approved: green (or blue/green based on location)
            // - rejected: red
            let color: "blue" | "green" | "red" | "yellow" | "purple" | "orange";
            
            if (b.status === "pending") {
                color = "yellow";
            } else if (b.status === "rejected") {
                color = "red";
            } else {
                // approved - use location-based color
                color = b.location === "aula-lantai-1" ? "blue" : b.location === "aula-lantai-2" ? "green" : "purple";
            }

            return {
                id: i + 1,
                startDate: b.startDate.toISOString(),
                endDate: b.endDate.toISOString(),
                title: b.eventName,
                color,
                description: `${b.organizerName} - ${b.location}`,
                user: {
                    id: b.user?.id ?? b.userId ?? "",
                    name: b.user?.name ?? b.organizerName ?? "Unknown",
                    picturePath: b.user?.image ?? null,
                },
                status: b.status as "pending" | "approved" | "rejected",
                // Add booking details
                contactName: b.contactName,
                contactPhone: b.contactPhone,
                organizerName: b.organizerName,
                location: b.location,
            };
        });

        return events;
    } catch (error) {
        console.error("Error fetching events from DB:", error);
        return [];
    }
};export const getUsers = async () => {
	return USERS_MOCK;
};
