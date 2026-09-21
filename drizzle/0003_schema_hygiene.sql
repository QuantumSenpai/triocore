-- 0003_schema_hygiene.sql
-- Additive-only schema hygiene migration:
-- 1. Missing FK indexes
-- 2. Sort & filter indexes
-- 3. Non-negative money & role CHECK constraints (NOT VALID then VALIDATE)
-- 4. Sensible updated_at defaults

-- 1. FOREIGN KEY INDEXES
CREATE INDEX IF NOT EXISTS "account_user_id_idx" ON "account" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "session_user_id_idx" ON "session" ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "faqs_category_id_idx" ON "faqs" ("category_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "milestones_project_id_idx" ON "milestones" ("project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_project_id_idx" ON "payments" ("project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "payments_client_id_idx" ON "payments" ("client_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "expenses_project_id_idx" ON "expenses" ("project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "projects_client_id_idx" ON "projects" ("client_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contacts_client_id_idx" ON "contacts" ("client_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_project_id_idx" ON "tasks" ("project_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_client_id_idx" ON "tasks" ("client_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "tasks_assignee_id_idx" ON "tasks" ("assignee_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "notes_created_by_id_idx" ON "notes" ("created_by_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_user_id_idx" ON "audit_logs" ("user_id");
--> statement-breakpoint

-- 2. SORT AND FILTER INDEXES
CREATE INDEX IF NOT EXISTS "faqs_order_idx" ON "faqs" ("order");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "services_order_idx" ON "services" ("order");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "pricing_plans_order_idx" ON "pricing_plans" ("order");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "showcase_projects_order_idx" ON "showcase_projects" ("order");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "team_members_order_idx" ON "team_members" ("order");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "faq_categories_order_idx" ON "faq_categories" ("order");
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "faq_categories_slug_uidx" ON "faq_categories" ("slug");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "audit_logs_created_at_idx" ON "audit_logs" ("created_at" DESC);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "contacts_created_at_idx" ON "contacts" ("created_at" DESC);
--> statement-breakpoint

-- 3. CHECK CONSTRAINTS (money >= 0, status/type values)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'expenses_amount_paise_non_negative') THEN
    ALTER TABLE "expenses" ADD CONSTRAINT "expenses_amount_paise_non_negative" CHECK ("amount_paise" >= 0) NOT VALID;
    ALTER TABLE "expenses" VALIDATE CONSTRAINT "expenses_amount_paise_non_negative";
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payments_amount_paise_non_negative') THEN
    ALTER TABLE "payments" ADD CONSTRAINT "payments_amount_paise_non_negative" CHECK ("amount_paise" >= 0) NOT VALID;
    ALTER TABLE "payments" VALIDATE CONSTRAINT "payments_amount_paise_non_negative";
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_quoted_amount_non_negative') THEN
    ALTER TABLE "projects" ADD CONSTRAINT "projects_quoted_amount_non_negative" CHECK ("quoted_amount_paise" >= 0) NOT VALID;
    ALTER TABLE "projects" VALIDATE CONSTRAINT "projects_quoted_amount_non_negative";
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_received_amount_non_negative') THEN
    ALTER TABLE "projects" ADD CONSTRAINT "projects_received_amount_non_negative" CHECK ("received_paise" >= 0) NOT VALID;
    ALTER TABLE "projects" VALIDATE CONSTRAINT "projects_received_amount_non_negative";
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'projects_pending_amount_non_negative') THEN
    ALTER TABLE "projects" ADD CONSTRAINT "projects_pending_amount_non_negative" CHECK ("pending_paise" >= 0) NOT VALID;
    ALTER TABLE "projects" VALIDATE CONSTRAINT "projects_pending_amount_non_negative";
  END IF;
END $$;
--> statement-breakpoint
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'project_members_role_check') THEN
    ALTER TABLE "project_members" ADD CONSTRAINT "project_members_role_check" CHECK ("role" IN ('lead', 'developer', 'designer', 'qa', 'viewer')) NOT VALID;
    ALTER TABLE "project_members" VALIDATE CONSTRAINT "project_members_role_check";
  END IF;
END $$;
--> statement-breakpoint

-- 4. UPDATED_AT DEFAULTS
ALTER TABLE "user" ALTER COLUMN "updated_at" SET DEFAULT now();
--> statement-breakpoint
ALTER TABLE "account" ALTER COLUMN "updated_at" SET DEFAULT now();
--> statement-breakpoint
ALTER TABLE "admin_members" ALTER COLUMN "updated_at" SET DEFAULT now();
--> statement-breakpoint
ALTER TABLE "clients" ALTER COLUMN "updated_at" SET DEFAULT now();
--> statement-breakpoint
ALTER TABLE "projects" ALTER COLUMN "updated_at" SET DEFAULT now();
--> statement-breakpoint
ALTER TABLE "payments" ALTER COLUMN "updated_at" SET DEFAULT now();
--> statement-breakpoint
ALTER TABLE "tasks" ALTER COLUMN "updated_at" SET DEFAULT now();
