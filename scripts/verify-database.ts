import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { neon } from "@neondatabase/serverless";

async function verifyDatabase() {
  console.log("🚀 Starting Acceptance Checklist B (Database) Verification...");
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error("❌ No DATABASE_URL found");
    process.exit(1);
  }

  const client = neon(dbUrl);

  // 1. Check all tables & row counts
  const requiredTables = [
    "site_content",
    "faqs",
    "employees",
    "legal_documents",
    "content_revisions",
    "clients",
    "projects",
    "milestones",
    "payments",
    "expenses",
    "tasks",
    "notes",
    "site_settings",
    "feedback_reports",
    "admin_invites",
    "admin_members",
    "auth_lockouts",
    "audit_logs",
    "account",
    "contacts",
    "pricing_plans",
    "services",
    "session",
    "showcase_projects",
    "site_stats",
    "team_members",
    "user",
    "verification",
  ];

  const dbTables = await client`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
    ORDER BY table_name ASC
  `;
  const existingTableNames = new Set(dbTables.map((t) => t.table_name));

  console.log(`Found ${existingTableNames.size} total tables in public schema.`);
  let allRequiredExist = true;
  const missingTables: string[] = [];

  for (const req of requiredTables) {
    if (!existingTableNames.has(req)) {
      allRequiredExist = false;
      missingTables.push(req);
    }
  }

  console.log("\n📊 Table Row Counts:");
  const rowCounts: Record<string, number> = {};
  for (const t of dbTables) {
    const name = t.table_name;
    const cnt = await client(`SELECT count(*)::int as c FROM "${name}"`);
    rowCounts[name] = cnt[0].c;
    console.log(`- ${name.padEnd(20)}: ${cnt[0].c} rows`);
  }

  // 2. Verify money columns are integer (paise)
  console.log("\n💰 Checking Money Column Types (must be integer/bigint):");
  const moneyColumns = await client`
    SELECT table_name, column_name, data_type 
    FROM information_schema.columns 
    WHERE (column_name LIKE '%amount%' OR column_name LIKE '%price%')
      AND table_schema = 'public'
    ORDER BY table_name, column_name ASC
  `;

  let allMoneyInteger = true;
  for (const col of moneyColumns) {
    console.log(`- ${col.table_name}.${col.column_name}: ${col.data_type}`);
    if (col.table_name === "pricing_plans") {
      // pricing_plans is original baseline table with text price e.g. "₹25,000"
      continue;
    }
    if (!col.data_type.includes("int")) {
      allMoneyInteger = false;
    }
  }

  // 3. Verify Baseline Table row preservation
  const baselineMinimums: Record<string, number> = {
    account: 4,
    contacts: 1,
    pricing_plans: 14,
    services: 6,
    session: 30,
    showcase_projects: 11,
    site_stats: 7,
    team_members: 4,
    user: 4,
    verification: 2,
  };

  let allBaselinePreserved = true;
  for (const [tbl, minCount] of Object.entries(baselineMinimums)) {
    const current = rowCounts[tbl] || 0;
    if (current < minCount) {
      allBaselinePreserved = false;
      console.error(`❌ Baseline table ${tbl} count decreased: ${current} < ${minCount}`);
    }
  }

  console.log("\n================ SUMMARY B ================");
  console.log(
    `${allRequiredExist ? "✅ PASS" : "❌ FAIL"} | B7: Tables in DB | All ${requiredTables.length} required tables present. Missing: ${missingTables.length === 0 ? "none" : missingTables.join(", ")}`
  );
  console.log(
    `${allMoneyInteger ? "✅ PASS" : "❌ FAIL"} | B7: Money columns integer paise | expenses.amount, payments.amount, projects.quoted_amount are integer paise.`
  );
  console.log(
    `${allBaselinePreserved ? "✅ PASS" : "❌ FAIL"} | B7: Baseline row counts preserved | Original tables preserved without row deletions.`
  );
}

verifyDatabase().catch((e) => {
  console.error(e);
  process.exit(1);
});
