import { db } from "../lib/db";
import { sql } from "drizzle-orm";
import { execSync } from "child_process";

async function getCounts() {
  const tables = [
    "services",
    "pricing_plans",
    "showcase_projects",
    "team_members",
    "site_stats",
    "faqs",
    "faq_categories",
  ];
  const counts: Record<string, number> = {};
  for (const t of tables) {
    const res = await db.execute(sql.raw(`SELECT count(*)::int as cnt FROM "${t}"`));
    counts[t] = Number((res.rows[0] as any).cnt);
  }
  return counts;
}

async function main() {
  const url = process.env.DATABASE_URL || "";
  const match = url.match(/@([^/:]+)/);
  const host = match ? match[1] : "unknown";
  
  if (host.includes("ep-noisy-hill-axqvb7jv")) {
    console.error("FATAL: Prohibited DB host!");
    process.exit(1);
  }
  console.log("DB Host:", host);

  console.log("\n=== STEP 6.a: SEED IDEMPOTENCY TEST ===");
  const initialCounts = await getCounts();
  console.log("Initial Counts:", initialCounts);

  // RUN 1
  console.log("\nRunning Seed Pass 1...");
  execSync("npx tsx lib/db/seed-content.ts", { stdio: "pipe" });
  execSync("npx tsx scripts/seed-original-faqs.ts", { stdio: "pipe" });
  const countsPass1 = await getCounts();
  console.log("Counts after Pass 1:", countsPass1);

  // RUN 2
  console.log("\nRunning Seed Pass 2...");
  execSync("npx tsx lib/db/seed-content.ts", { stdio: "pipe" });
  execSync("npx tsx scripts/seed-original-faqs.ts", { stdio: "pipe" });
  const countsPass2 = await getCounts();
  console.log("Counts after Pass 2:", countsPass2);

  // Check equality
  let hasDrift = false;
  for (const [table, cnt1] of Object.entries(countsPass1)) {
    const cnt2 = countsPass2[table];
    if (cnt1 !== cnt2) {
      console.error(`DRIFT DETECTED in table ${table}: pass1=${cnt1}, pass2=${cnt2}`);
      hasDrift = true;
    }
  }

  if (hasDrift) {
    throw new Error("Seed idempotency verification failed!");
  }

  console.log("\n[SUCCESS] All seeds are 100% idempotent! Counts are identical after consecutive runs.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
