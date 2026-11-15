CREATE SEQUENCE "public"."booking_number_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 1 CACHE 1;--> statement-breakpoint
WITH numbered AS (
	SELECT "id", row_number() OVER (ORDER BY "created_at", "id") AS number
	FROM "bookings"
)
UPDATE "bookings" AS booking
SET "id" = 'MUA-' || lpad(numbered.number::text, greatest(5, length(numbered.number::text)), '0')
FROM numbered
WHERE booking."id" = numbered."id";--> statement-breakpoint
SELECT setval(
	'booking_number_seq',
	COALESCE((SELECT count(*) FROM "bookings"), 0) + 1,
	false
);--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "id" SET DEFAULT 'MUA-' || lpad(nextval('booking_number_seq')::text, greatest(5, length(currval('booking_number_seq')::text)), '0');
