import { db } from "../lib/db";
import { sql } from "drizzle-orm";

function maskEmail(email: string | null | undefined): string {
  if (!email) return "none";
  const [user, domain] = email.split("@");
  if (!domain) return "***";
  return `${user.slice(0, 2)}***@${domain}`;
}

async function main() {
  if (!db) throw new Error("DB not connected");
  console.log("=== STEP 1.a: ROWS CLASSIFICATION (TEST vs PROD) ===");
  // Check users
  const usersRes = await db.execute<{ id: string; name: string | null; email: string; created_at: any }>(sql`
    SELECT id, name, email, created_at FROM "user";
  `);
  console.log(`\nUser rows (${usersRes.rows.length}):`);
  for (const u of usersRes.rows) {
    const isTest = u.email.includes("example.test") || u.email.startsWith("test-") || (u.name && u.name.includes("Test"));
    console.log(`- ID: ${u.id.slice(0, 8)}... | Email: ${maskEmail(u.email)} | Name: ${u.name || "N/A"} | Origin: ${isTest ? "TEST/SYNTHETIC" : "PROD/TEAM"}`);
  }

  // Check audit_logs
  const auditRes = await db.execute<{ count: number; test_count: number }>(sql`
    SELECT 
      count(*)::int as count,
      count(*) FILTER (WHERE details::text LIKE '%example.test%' OR details::text LIKE '%TEST%')::int as test_count
    FROM audit_logs;
  `);
  console.log(`\nAudit Logs: Total ${auditRes.rows[0].count}, Test/Synthetic: ${auditRes.rows[0].test_count}`);

  // Check content_revisions
  const revRes = await db.execute<{ count: number; test_count: number }>(sql`
    SELECT 
      count(*)::int as count,
      count(*) FILTER (WHERE data::text LIKE '%example.test%' OR data::text LIKE '%TEST%')::int as test_count
    FROM content_revisions;
  `);
  console.log(`Content Revisions: Total ${revRes.rows[0].count}, Test/Synthetic: ${revRes.rows[0].test_count}`);

  // Check auth_lockouts
  const lockoutRes = await db.execute<{ count: number; expired_count: number }>(sql`
    SELECT 
      count(*)::int as count,
      count(*) FILTER (WHERE locked_until <= NOW())::int as expired_count
    FROM auth_lockouts;
  `);
  console.log(`Auth Lockouts: Total ${lockoutRes.rows[0].count}, Expired: ${lockoutRes.rows[0].expired_count}`);

  // Check verifications
  const verifRes = await db.execute<{ count: number; expired_count: number }>(sql`
    SELECT 
      count(*)::int as count,
      count(*) FILTER (WHERE expires_at <= NOW())::int as expired_count
    FROM verification;
  `);
  console.log(`Verifications: Total ${verifRes.rows[0].count}, Expired: ${verifRes.rows[0].expired_count}`);

  console.log("\n=== STEP 1.b: DUPLICATES & ORPHANS ===");
  // Check pricing_plans duplicates
  const priceDupes = await db.execute(sql`
    SELECT name, count(*) as count 
    FROM pricing_plans 
    GROUP BY name 
    HAVING count(*) > 1;
  `);
  console.log("Pricing Plan Duplicates:", priceDupes.rows);

  // Check services duplicates
  const servDupes = await db.execute(sql`
    SELECT title, count(*) as count 
    FROM services 
    GROUP BY title 
    HAVING count(*) > 1;
  `);
  console.log("Services Duplicates:", servDupes.rows);

  // Check showcase_projects duplicates
  const projDupes = await db.execute(sql`
    SELECT title, count(*) as count 
    FROM showcase_projects 
    GROUP BY title 
    HAVING count(*) > 1;
  `);
  console.log("Showcase Projects Duplicates:", projDupes.rows);

  // Check site_stats duplicates
  const statDupes = await db.execute(sql`
    SELECT key, count(*) as count 
    FROM site_stats 
    GROUP BY key 
    HAVING count(*) > 1;
  `);
  console.log("Site Stats Duplicates:", statDupes.rows);

  // Check site_settings duplicates
  const setDupes = await db.execute(sql`
    SELECT key, count(*) as count 
    FROM site_settings 
    GROUP BY key 
    HAVING count(*) > 1;
  `);
  console.log("Site Settings Duplicates:", setDupes.rows);

  // Check site_content duplicates
  const contDupes = await db.execute(sql`
    SELECT key, count(*) as count 
    FROM site_content 
    GROUP BY key 
    HAVING count(*) > 1;
  `);
  console.log("Site Content Duplicates:", contDupes.rows);

  // Check faqs duplicates
  const faqDupes = await db.execute(sql`
    SELECT question, count(*) as count 
    FROM faqs 
    GROUP BY question 
    HAVING count(*) > 1;
  `);
  console.log("FAQs Duplicates:", faqDupes.rows);

  // Check faq_categories duplicates
  const catDupes = await db.execute(sql`
    SELECT slug, count(*) as count 
    FROM faq_categories 
    GROUP BY slug 
    HAVING count(*) > 1;
  `);
  console.log("FAQ Categories Duplicates:", catDupes.rows);

  console.log("\nDone Step 1.a & 1.b queries.");
}

main().catch(console.error);
