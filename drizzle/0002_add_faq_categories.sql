CREATE TABLE IF NOT EXISTS "faq_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL UNIQUE,
	"order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "category_id" text REFERENCES "faq_categories"("id") ON DELETE SET NULL;
