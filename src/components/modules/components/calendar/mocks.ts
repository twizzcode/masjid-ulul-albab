import type { IEvent, IUser } from "@/components/modules/components/calendar/interfaces";

export const USERS_MOCK: IUser[] = [
	{
		id: "f3b035ac-49f7-4e92-a715-35680bf63175",
		name: "Michael Doe",
		picturePath: null,
	},
	{
		id: "3e36ea6e-78f3-40dd-ab8c-a6c737c3c422",
		name: "Alice Johnson",
		picturePath: null,
	},
	{
		id: "a7aff6bd-a50a-4d6a-ab57-76f76bb27cf5",
		name: "Robert Smith",
		picturePath: null,
	},
	{
		id: "dd503cf9-6c38-43cf-94cc-0d4032e2f77a",
		name: "Emily Davis",
		picturePath: null,
	},
];

// Empty events - no dummy data
export const CALENDAR_ITEMS_MOCK: IEvent[] = [];
