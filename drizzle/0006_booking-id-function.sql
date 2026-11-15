ALTER TABLE "accounts" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
CREATE OR REPLACE FUNCTION next_booking_id()
RETURNS text
LANGUAGE sql
VOLATILE
AS $$
	SELECT 'MUA-' || lpad(value::text, greatest(5, length(value::text)), '0')
	FROM (SELECT nextval('booking_number_seq') AS value) sequence_value
$$;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "id" SET DEFAULT next_booking_id();
