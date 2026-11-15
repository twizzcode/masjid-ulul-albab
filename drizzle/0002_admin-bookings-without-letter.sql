ALTER TABLE "bookings" DROP CONSTRAINT "booking_organizer_length_check";--> statement-breakpoint
ALTER TABLE "bookings" DROP CONSTRAINT "booking_letter_check";--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "whatsapp" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "organizer" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "letter_key" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "letter_name" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "letter_size" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ALTER COLUMN "letter_mime" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "booking_organizer_length_check" CHECK ("bookings"."organizer" is null or char_length(trim("bookings"."organizer")) between 3 and 150);--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "booking_letter_check" CHECK (("bookings"."letter_key" is null and "bookings"."letter_name" is null and "bookings"."letter_size" is null and "bookings"."letter_mime" is null) or ("bookings"."letter_size" between 1 and 2097152 and "bookings"."letter_mime" = 'application/pdf'));