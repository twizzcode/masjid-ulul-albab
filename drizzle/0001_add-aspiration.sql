CREATE TABLE "aspiration" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"is_anonymous" boolean DEFAULT true NOT NULL,
	"name" text,
	"category" text NOT NULL,
	"message" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "aspiration_category_check" CHECK ("aspiration"."category" in ('saran', 'kritik', 'masukan')),
	CONSTRAINT "aspiration_message_length_check" CHECK (char_length("aspiration"."message") between 10 and 2000),
	CONSTRAINT "aspiration_identity_check" CHECK (("aspiration"."is_anonymous" and "aspiration"."name" is null) or (not "aspiration"."is_anonymous" and coalesce(char_length(trim("aspiration"."name")), 0) between 2 and 100))
);
