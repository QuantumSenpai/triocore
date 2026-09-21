import { db } from "../lib/db";
import { sql } from "drizzle-orm";

async function main() {
  const url = process.env.DATABASE_URL || "";
  const match = url.match(/@([^/:]+)/);
  const host = match ? match[1] : "unknown";
  
  if (host.includes("ep-noisy-hill-axqvb7jv")) {
    console.error("CRITICAL ERROR: Connected to prohibited host!");
    process.exit(1);
  }
  if (!db) throw new Error("DB not connected");
  
  console.log("DB Host:", host);

  // 1. Table list with row counts
  const tablesRes = await db.execute<{ table_name: string }>(sql`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    ORDER BY table_name;
  `);

  console.log("\n=== TABLES & ROW COUNTS ===");
  const tableCounts: Record<string, number> = {};
  for (const row of tablesRes.rows) {
    const t = row.table_name;
    const countRes = await db.execute(sql.raw(`SELECT count(*)::int as count FROM "${t}"`));
    const cnt = Number((countRes.rows[0] as any).count);
    tableCounts[t] = cnt;
    console.log(`${t}: ${cnt} rows`);
  }

  // 2. Columns, types, nullability, defaults
  const colRes = await db.execute(sql`
    SELECT table_name, column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public'
    ORDER BY table_name, ordinal_position;
  `);

  // 3. Primary keys
  const pkRes = await db.execute(sql`
    SELECT tc.table_name, kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    WHERE tc.constraint_type = 'PRIMARY KEY'
      AND tc.table_schema = 'public';
  `);

  // 4. Foreign keys with ON DELETE
  const fkRes = await db.execute(sql`
    SELECT
      tc.table_name,
      kcu.column_name,
      ccu.table_name AS foreign_table_name,
      ccu.column_name AS foreign_column_name,
      rc.delete_rule
    FROM information_schema.table_constraints AS tc
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
    JOIN information_schema.referential_constraints AS rc
      ON rc.constraint_name = tc.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND tc.table_schema = 'public';
  `);

  // 5. Unique & CHECK constraints
  const ucRes = await db.execute(sql`
    SELECT tc.table_name, tc.constraint_name, tc.constraint_type, kcu.column_name, cc.check_clause
    FROM information_schema.table_constraints tc
    LEFT JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    LEFT JOIN information_schema.check_constraints cc
      ON tc.constraint_name = cc.constraint_name
    WHERE tc.table_schema = 'public'
      AND tc.constraint_type IN ('UNIQUE', 'CHECK');
  `);

  // 6. Indexes
  const idxRes = await db.execute(sql`
    SELECT
      tablename,
      indexname,
      indexdef
    FROM pg_indexes
    WHERE schemaname = 'public'
    ORDER BY tablename, indexname;
  `);

  // Output structured JSON for analysis
  console.log("\n=== AUDIT METRICS ===");
  console.log("Total tables:", tablesRes.rows.length);
  console.log("Total columns:", colRes.rows.length);
  console.log("Total PKs:", pkRes.rows.length);
  console.log("Total FKs:", fkRes.rows.length);
  console.log("Total Unique/Check constraints:", ucRes.rows.length);
  console.log("Total Indexes:", idxRes.rows.length);

  // Write audit details to temporary json for step 1 reporting
  const fs = await import("fs");
  const auditData = {
    tables: tableCounts,
    columns: colRes.rows,
    primaryKeys: pkRes.rows,
    foreignKeys: fkRes.rows,
    uniqueAndCheckConstraints: ucRes.rows,
    indexes: idxRes.rows,
  };
  fs.writeFileSync("scripts/scratch-audit.json", JSON.stringify(auditData, null, 2));
  console.log("Wrote scripts/scratch-audit.json for detailed drift analysis.");
}

main().catch((err) => {
  console.error("Audit error:", err);
  process.exit(1);
});
