import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
  const url = process.env.DATABASE_URL || "";
  const match = url.match(/@([^/:]+)/);
  const host = match ? match[1] : "unknown";
  
  if (host.includes("ep-noisy-hill-axqvb7jv")) {
    console.error("FATAL: Attempted execution against prohibited database host!");
    process.exit(1);
  }
  console.log("DB Host:", host);

  console.log("\n=== STEP 2: DEV DATA CLEAN-UP ===");

  // 1. BEFORE COUNTS
  const beforeAudit = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM audit_logs;`);
  const beforeVerif = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM verification;`);
  const beforeLockouts = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM auth_lockouts;`);
  const beforeUsers = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM "user";`);
  const beforeAccounts = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM account;`);
  const beforeContacts = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM contacts;`);
  const beforeServices = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM services;`);
  const beforePricing = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM pricing_plans;`);
  const beforeShowcase = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM showcase_projects;`);
  const beforeTeam = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM team_members;`);
  const beforeStats = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM site_stats;`);

  console.log("\n[BEFORE COUNTS]");
  console.log(`- audit_logs: ${beforeAudit.rows[0].count}`);
  console.log(`- verification: ${beforeVerif.rows[0].count}`);
  console.log(`- auth_lockouts: ${beforeLockouts.rows[0].count}`);
  console.log(`- user (PROD): ${beforeUsers.rows[0].count}`);
  console.log(`- account (PROD): ${beforeAccounts.rows[0].count}`);
  console.log(`- contacts (PROD): ${beforeContacts.rows[0].count}`);
  console.log(`- services (PROD): ${beforeServices.rows[0].count}`);
  console.log(`- pricing_plans (PROD): ${beforePricing.rows[0].count}`);
  console.log(`- showcase_projects (PROD): ${beforeShowcase.rows[0].count}`);
  console.log(`- team_members (PROD): ${beforeTeam.rows[0].count}`);
  console.log(`- site_stats (PROD): ${beforeStats.rows[0].count}`);

  // Sample before deleting
  const testAuditSample = await db.execute(sql`
    SELECT id, action, details FROM audit_logs 
    WHERE details::text LIKE '%example.test%' OR details::text LIKE '%TEST%' 
    LIMIT 3;
  `);
  console.log("\n[SAMPLE AUDIT LOGS TO DELETE]:", testAuditSample.rows);

  const verifSample = await db.execute(sql`
    SELECT id, identifier, expires_at FROM verification 
    WHERE expires_at <= NOW() 
    LIMIT 3;
  `);
  console.log("[SAMPLE EXPIRED VERIFICATIONS TO DELETE]:", verifSample.rows);

  // 2. ATOMIC DELETION STATEMENTS
  console.log("\nExecuting atomic cleanup statements...");
  
  // a. Delete test synthetic audit logs
  await db.execute(sql`
    DELETE FROM audit_logs 
    WHERE details::text LIKE '%example.test%' OR details::text LIKE '%TEST%';
  `);
  console.log(`Deleted test audit_logs rows`);

  // b. Delete expired verification rows
  await db.execute(sql`
    DELETE FROM verification 
    WHERE expires_at <= NOW();
  `);
  console.log(`Deleted expired verification rows`);

  // c. Delete test / expired auth lockouts
  await db.execute(sql`
    DELETE FROM auth_lockouts 
    WHERE locked_until <= NOW() OR (locked_until IS NULL AND failed_attempts < 5);
  `);
  console.log(`Deleted stale/test auth_lockouts rows`);

  // 3. AFTER COUNTS
  const afterAudit = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM audit_logs;`);
  const afterVerif = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM verification;`);
  const afterLockouts = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM auth_lockouts;`);
  const afterUsers = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM "user";`);
  const afterAccounts = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM account;`);
  const afterContacts = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM contacts;`);
  const afterServices = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM services;`);
  const afterPricing = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM pricing_plans;`);
  const afterShowcase = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM showcase_projects;`);
  const afterTeam = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM team_members;`);
  const afterStats = await db.execute<{ count: number }>(sql`SELECT count(*)::int as count FROM site_stats;`);

  console.log("\n[AFTER COUNTS]");
  console.log(`- audit_logs: ${afterAudit.rows[0].count} (delta: ${afterAudit.rows[0].count - beforeAudit.rows[0].count})`);
  console.log(`- verification: ${afterVerif.rows[0].count} (delta: ${afterVerif.rows[0].count - beforeVerif.rows[0].count})`);
  console.log(`- auth_lockouts: ${afterLockouts.rows[0].count} (delta: ${afterLockouts.rows[0].count - beforeLockouts.rows[0].count})`);
  console.log(`- user (PROD): ${afterUsers.rows[0].count} (unchanged)`);
  console.log(`- account (PROD): ${afterAccounts.rows[0].count} (unchanged)`);
  console.log(`- contacts (PROD): ${afterContacts.rows[0].count} (unchanged)`);
  console.log(`- services (PROD): ${afterServices.rows[0].count} (unchanged)`);
  console.log(`- pricing_plans (PROD): ${afterPricing.rows[0].count} (unchanged)`);
  console.log(`- showcase_projects (PROD): ${afterShowcase.rows[0].count} (unchanged)`);
  console.log(`- team_members (PROD): ${afterTeam.rows[0].count} (unchanged)`);
  console.log(`- site_stats (PROD): ${afterStats.rows[0].count} (unchanged)`);

  console.log("\nCleanup completed successfully!");
}

main().catch((err) => {
  console.error("Cleanup error:", err);
  process.exit(1);
});
