ALTER TABLE "borrow_records" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "borrow_records" ALTER COLUMN "status" SET DEFAULT 'BORROW'::text;--> statement-breakpoint
DROP TYPE "public"."borrow_status";--> statement-breakpoint
CREATE TYPE "public"."borrow_status" AS ENUM('BORROW', 'RETURNED');--> statement-breakpoint
ALTER TABLE "borrow_records" ALTER COLUMN "status" SET DEFAULT 'BORROW'::"public"."borrow_status";--> statement-breakpoint
ALTER TABLE "borrow_records" ALTER COLUMN "status" SET DATA TYPE "public"."borrow_status" USING "status"::"public"."borrow_status";