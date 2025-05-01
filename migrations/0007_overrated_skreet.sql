CREATE TYPE "public"."receipt_type" AS ENUM('BORROW', 'RETURN');--> statement-breakpoint
CREATE TABLE "receipts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"borrow_record_id" uuid NOT NULL,
	"type" "receipt_type" NOT NULL,
	"base_charge" integer DEFAULT 70 NOT NULL,
	"extra_days" integer DEFAULT 0,
	"extra_charge" integer DEFAULT 0,
	"total_charge" integer NOT NULL,
	"generated_by" uuid NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now(),
	"notes" text,
	"is_printed" boolean DEFAULT false,
	"printed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "receipts_id_unique" UNIQUE("id")
);
--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_borrow_record_id_borrow_records_id_fk" FOREIGN KEY ("borrow_record_id") REFERENCES "public"."borrow_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "receipts" ADD CONSTRAINT "receipts_generated_by_users_id_fk" FOREIGN KEY ("generated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;