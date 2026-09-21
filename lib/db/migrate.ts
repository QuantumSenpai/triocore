import { config } from "dotenv";
config({ path: ".env.local" });
config();

import crypto from "crypto";
import fs from "fs";
import path from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";
import { sql } from "drizzle-orm";

export async function runDatabaseMigrations() {
  const dbUrl = process.env.DATABASE_URL;

  if (!dbUrl) {
    console.error("❌ No DATABASE_URL found in environment.");
    process.exit(1);
  }

  console.log("🔄 Initializing TrioCore safe additive migration runner...");

  try {
    const client = neon(dbUrl);
    const db = drizzle(client);

    // Baseline tables to protect
    const baselineTables = [
      "account",
      "contacts",
      "pricing_plans",
      "services",
      "session",
      "showcase_projects",
      "site_stats",
      "team_members",
      "user",
      "verification"
    ];

    // Check pre-migration row counts of baseline tables
    const preCounts: Record<string, number> = {};
    for (const t of baselineTables) {
      try {
        const res = await db.execute(sql.raw(`SELECT count(*)::int as cnt FROM "${t}"`));
        preCounts[t] = ((res as unknown as { cnt: number }[])[0]?.cnt) ?? 0;
      } catch {
        preCounts[t] = 0;
      }
    }
    console.log("📊 Pre-migration baseline row counts:", preCounts);

    // Ensure drizzle schema and __drizzle_migrations table exist
    await db.execute(sql`CREATE SCHEMA IF NOT EXISTS "drizzle"`);
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
        id SERIAL PRIMARY KEY,
        hash text NOT NULL,
        created_at bigint
      )
    `);

    const migrationsDir = path.resolve(process.cwd(), "drizzle");
    const journalPath = path.join(migrationsDir, "meta", "_journal.json");

    if (fs.existsSync(journalPath)) {
      const journal = JSON.parse(fs.readFileSync(journalPath, "utf-8"));
      const baselineEntry = journal.entries.find((e: { idx: number }) => e.idx === 0);

      if (baselineEntry) {
        const baselineFile = path.join(migrationsDir, `${baselineEntry.tag}.sql`);
        if (fs.existsSync(baselineFile)) {
          const sqlContent = fs.readFileSync(baselineFile, "utf-8");
          const hash = crypto.createHash("sha256").update(sqlContent).digest("hex");

          const existingMigration = await db.execute(sql`
            SELECT id FROM "drizzle"."__drizzle_migrations" 
            WHERE created_at = ${baselineEntry.when} OR hash = ${hash}
          `);

          const rows = (existingMigration as unknown as { id: number }[]) || [];
          if (rows.length === 0) {
            console.log(`📌 Baselining existing database: marking ${baselineEntry.tag} as applied.`);
            await db.execute(sql`
              INSERT INTO "drizzle"."__drizzle_migrations" (hash, created_at)
              VALUES (${hash}, ${baselineEntry.when})
            `);
          } else {
            console.log(`✓ Baseline migration ${baselineEntry.tag} is already recorded.`);
          }
        }
      }
    }

    // Run pending additive migrations
    console.log("🚀 Running pending migrations...");
    await migrate(db, { migrationsFolder: migrationsDir });
    console.log("✅ All migrations applied successfully!");

    // Check post-migration row counts of baseline tables
    const postCounts: Record<string, number> = {};
    for (const t of baselineTables) {
      try {
        const res = await db.execute(sql.raw(`SELECT count(*)::int as cnt FROM "${t}"`));
        postCounts[t] = ((res as unknown as { cnt: number }[])[0]?.cnt) ?? 0;
      } catch {
        postCounts[t] = 0;
      }
    }
    console.log("📊 Post-migration baseline row counts:", postCounts);

    // Verify no rows were lost
    for (const t of baselineTables) {
      if (postCounts[t] < preCounts[t]) {
        throw new Error(`Data safety violation: table ${t} lost rows! Pre: ${preCounts[t]}, Post: ${postCounts[t]}`);
      }
    }
    console.log("🛡️ Data safety verified: zero rows deleted from original baseline tables.");

  } catch (error) {
    console.error("❌ Migration failed:", (error as Error).message);
    process.exit(1);
  }
}

if (require.main === module || process.argv[1]?.endsWith("migrate.ts")) {
  runDatabaseMigrations();
}
