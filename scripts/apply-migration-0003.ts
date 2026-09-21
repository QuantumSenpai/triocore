import { db } from "../lib/db";
import { sql } from "drizzle-orm";
import fs from "fs";

async function main() {
  const url = process.env.DATABASE_URL || "";
  const match = url.match(/@([^/:]+)/);
  const host = match ? match[1] : "unknown";
  
  if (host.includes("ep-noisy-hill-axqvb7jv")) {
    console.error("CRITICAL: Prohibited database host!");
    process.exit(1);
  }
  console.log("Applying migration 0003 to DEV DB Host:", host);

  const sqlContent = fs.readFileSync("drizzle/0003_schema_hygiene.sql", "utf-8");
  const statements = sqlContent
    .split("--> statement-breakpoint")
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith("--"));

  console.log(`Found ${statements.length} statements to execute.`);

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];
    console.log(`[${i + 1}/${statements.length}] Executing...`);
    await db.execute(sql.raw(stmt));
  }

  console.log("Migration 0003 applied successfully!");

  // Verify indexes
  const idxRes = await db.execute(sql`
    SELECT indexname 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname IN (
        'account_user_id_idx', 
        'session_user_id_idx', 
        'faqs_category_id_idx', 
        'faq_categories_slug_uidx',
        'audit_logs_created_at_idx'
      );
  `);
  console.log("Verified new indexes:", idxRes.rows.map((r: any) => r.indexname));

  // Verify CHECK constraints
  const chkRes = await db.execute(sql`
    SELECT conname 
    FROM pg_constraint 
    WHERE conname IN (
      'expenses_amount_paise_non_negative',
      'payments_amount_paise_non_negative',
      'projects_quoted_amount_non_negative',
      'project_members_role_check'
    );
  `);
  console.log("Verified new CHECK constraints:", chkRes.rows.map((r: any) => r.conname));
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
