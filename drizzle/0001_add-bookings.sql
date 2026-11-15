CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"contact_name" text NOT NULL,
	"whatsapp" text NOT NULL,
	"organizer" text NOT NULL,
	"event_name" text NOT NULL,
	"room" text NOT NULL,
	"start_at" timestamp with time zone NOT NULL,
	"end_at" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"letter_key" text NOT NULL,
	"letter_name" text NOT NULL,
	"letter_size" integer NOT NULL,
	"letter_mime" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_letter_key_unique" UNIQUE("letter_key"),
	CONSTRAINT "booking_room_check" CHECK ("bookings"."room" in ('aula-lantai-1', 'ruang-solat-lantai-2', 'pelataran-masjid', 'lapangan-parkir')),
	CONSTRAINT "booking_status_check" CHECK ("bookings"."status" in ('PENDING', 'APPROVED', 'REJECTED')),
	CONSTRAINT "booking_time_check" CHECK ("bookings"."start_at" < "bookings"."end_at"),
	CONSTRAINT "booking_contact_name_length_check" CHECK (char_length(trim("bookings"."contact_name")) between 3 and 100),
	CONSTRAINT "booking_organizer_length_check" CHECK (char_length(trim("bookings"."organizer")) between 3 and 150),
	CONSTRAINT "booking_event_name_length_check" CHECK (char_length(trim("bookings"."event_name")) between 3 and 150),
	CONSTRAINT "booking_letter_check" CHECK ("bookings"."letter_size" between 1 and 2097152 and "bookings"."letter_mime" = 'application/pdf')
);
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "booking_user_id_idx" ON "bookings" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "booking_start_at_idx" ON "bookings" USING btree ("start_at");--> statement-breakpoint
CREATE INDEX "booking_status_idx" ON "bookings" USING btree ("status");
--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "booking_no_overlap" EXCLUDE USING gist (
	"room" WITH =,
	tstzrange("start_at", "end_at", '[)') WITH &&
) WHERE ("status" IN ('PENDING', 'APPROVED'));
