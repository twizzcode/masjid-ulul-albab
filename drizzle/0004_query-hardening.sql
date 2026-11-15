CREATE TABLE "api_rate_limits" (
	"key" text PRIMARY KEY NOT NULL,
	"count" integer DEFAULT 1 NOT NULL,
	"reset_at" timestamp with time zone NOT NULL,
	CONSTRAINT "api_rate_limit_count_check" CHECK ("api_rate_limits"."count" > 0)
);
--> statement-breakpoint
CREATE INDEX "api_rate_limit_reset_at_idx" ON "api_rate_limits" USING btree ("reset_at");--> statement-breakpoint
CREATE INDEX "aspiration_created_at_idx" ON "aspiration" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "booking_user_created_at_idx" ON "bookings" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "booking_end_at_idx" ON "bookings" USING btree ("end_at");--> statement-breakpoint
CREATE INDEX "booking_created_at_idx" ON "bookings" USING btree ("created_at");