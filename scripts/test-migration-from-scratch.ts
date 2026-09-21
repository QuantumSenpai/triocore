import { db } from "../lib/db";
import { sql } from "drizzle-orm";
import fs from "fs";
import path from "path";

async function main() {
  const url = process.env.DATABASE_URL || "";
  const match = url.match(/@([^/:]+)/);
  const host = match ? match[1] : "unknown";
  
  if (host.includes("ep-noisy-hill-axqvb7jv")) {
    console.error("FATAL: Attempted execution on prohibited host!");
    process.exit(1);
  }
  console.log("Testing migration replay on DEV DB Host:", host);

  const scratchSchema = "scratch_migration_test";

  try {
    // 1. Create isolated scratch schema
    console.log(`\n1. Creating isolated scratch schema: "${scratchSchema}"...`);
    await db.execute(sql.raw(`CREATE SCHEMA IF NOT EXISTS "${scratchSchema}";`));

    // 2. Read migration files in order
    const migrationFiles = [
      "0000_nervous_bloodstrike.sql",
      "0001_additive_triocore_os.sql",
      "0002_add_faq_categories.sql",
      "0003_schema_hygiene.sql",
    ];

    console.log(`2. Replaying ${migrationFiles.length} migrations into "${scratchSchema}"...`);
    for (const file of migrationFiles) {
      console.log(`   Applying ${file}...`);
      const content = fs.readFileSync(path.join("drizzle", file), "utf-8");
      const statements = content
        .split("--> statement-breakpoint")
        .map((s) => s.trim())
        .filter((s) => s.length > 0 && !s.startsWith("--"));

      for (let s of statements) {
        // Rewrite statements to target scratch schema
        let rewritten = s
          .replace(/CREATE TABLE IF NOT EXISTS "([^"]+)"/g, `CREATE TABLE IF NOT EXISTS "${scratchSchema}"."$1"`)
          .replace(/CREATE TABLE "([^"]+)"/g, `CREATE TABLE "${scratchSchema}"."$1"`)
          .replace(/ALTER TABLE "([^"]+)"/g, `ALTER TABLE "${scratchSchema}"."$1"`)
          .replace(/CREATE (UNIQUE )?INDEX IF NOT EXISTS "([^"]+)" ON "([^"]+)"/g, `CREATE $1INDEX IF NOT EXISTS "$2" ON "${scratchSchema}"."$3"`)
          .replace(/REFERENCES "([^"]+)"/g, `REFERENCES "${scratchSchema}"."$1"`);

        // If DO $$ block mentions tables without schema prefix
        if (rewritten.includes("DO $$")) {
          rewritten = rewritten.replace(/ALTER TABLE "([^"]+)"/g, `ALTER TABLE "${scratchSchema}"."$1"`);
        }

        await db.execute(sql.raw(rewritten));
      }
    }

    // 3. Verify created tables in scratchSchema
    const tableRes = await db.execute<{ table_name: string }>(sql`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = ${scratchSchema} 
        AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);

    console.log(`\n3. Verification: Created ${tableRes.rows.length} tables in "${scratchSchema}":`);
    for (const row of tableRes.rows) {
      console.log(`   - ${row.table_name}`);
    }

    if (tableRes.rows.length !== 30) {
      throw new Error(`Expected 30 tables in scratch schema, found ${tableRes.rows.length}`);
    }
    console.log(`\n[SUCCESS] Fresh database can be completely built from zero (all 30 tables created from migrations)!`);

  } finally {
    // 4. Clean up: Drop the scratch schema
    console.log(`\n4. Cleaning up: Dropping scratch schema "${scratchSchema}"...`);
    await db.execute(sql.raw(`DROP SCHEMA IF EXISTS "${scratchSchema}" CASCADE;`));
    console.log(`Dropped scratch schema. Database is clean.`);
  }
}

main().catch((err) => {
  console.error("Scratch migration test failed:", err);
  process.exit(1);
});
