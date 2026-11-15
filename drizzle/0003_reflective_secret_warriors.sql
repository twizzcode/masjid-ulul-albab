CREATE TABLE "finance_transactions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"occurred_on" date NOT NULL,
	"title" text NOT NULL,
	"category" text DEFAULT 'Lainnya' NOT NULL,
	"type" text NOT NULL,
	"amount" bigint NOT NULL,
	"created_by" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "finance_transaction_type_check" CHECK ("finance_transactions"."type" in ('INCOME', 'EXPENSE')),
	CONSTRAINT "finance_transaction_amount_check" CHECK ("finance_transactions"."amount" > 0),
	CONSTRAINT "finance_transaction_title_length_check" CHECK (char_length(trim("finance_transactions"."title")) between 3 and 150),
	CONSTRAINT "finance_transaction_category_length_check" CHECK (char_length(trim("finance_transactions"."category")) between 2 and 100)
);
--> statement-breakpoint
ALTER TABLE "finance_transactions" ADD CONSTRAINT "finance_transactions_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "finance_transaction_occurred_on_idx" ON "finance_transactions" USING btree ("occurred_on");--> statement-breakpoint
CREATE INDEX "finance_transaction_type_idx" ON "finance_transactions" USING btree ("type");