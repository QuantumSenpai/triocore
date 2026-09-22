ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "expense_type" text NOT NULL DEFAULT 'studio';
--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "member_id" text REFERENCES "user"("id") ON DELETE SET NULL;
--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "is_reimbursed" boolean NOT NULL DEFAULT false;
--> statement-breakpoint
ALTER TABLE "expenses" ADD COLUMN IF NOT EXISTS "updated_at" timestamp DEFAULT now() NOT NULL;
