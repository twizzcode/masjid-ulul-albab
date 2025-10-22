import type { TEventColor } from "@/components/modules/components/calendar/types";

export interface IUser {
	id: string;
	name: string;
	picturePath: string | null;
}

export interface IEvent {
	id: number;
	startDate: string;
	endDate: string;
	title: string;
	color: TEventColor;
	description: string;
	user: IUser;
	status: "pending" | "approved" | "rejected";
}

export interface ICalendarCell {
	day: number;
	currentMonth: boolean;
	date: Date;
}
