import fs from "fs";

interface DBData {
  tables: Record<string, number>;
  columns: Array<{
    table_name: string;
    column_name: string;
    data_type: string;
    is_nullable: string;
    column_default: string | null;
  }>;
  primaryKeys: Array<{ table_name: string; column_name: string }>;
  foreignKeys: Array<{
    table_name: string;
    column_name: string;
    foreign_table_name: string;
    foreign_column_name: string;
    delete_rule: string;
  }>;
  uniqueAndCheckConstraints: Array<{
    table_name: string;
    constraint_name: string;
    constraint_type: string;
    column_name: string | null;
    check_clause: string | null;
  }>;
  indexes: Array<{ tablename: string; indexname: string; indexdef: string }>;
}

const data: DBData = JSON.parse(fs.readFileSync("scripts/scratch-audit.json", "utf-8"));

console.log("=== STEP 1.d: FOREIGN KEYS & INDEXES ===");
console.log("Foreign keys found:", data.foreignKeys.length);
for (const fk of data.foreignKeys) {
  // Check if an index exists on this table & column
  const hasIndex = data.indexes.some((idx) => {
    return idx.tablename === fk.table_name && idx.indexdef.includes(`(${fk.column_name})`);
  });
  console.log(
    `- ${fk.table_name}.${fk.column_name} -> ${fk.foreign_table_name}.${fk.foreign_column_name} (ON DELETE ${fk.delete_rule}) | Indexed: ${hasIndex ? "YES" : "NO (MISSING INDEX)"}`
  );
}

console.log("\n=== STEP 1.c: TIMESTAMPS WITHOUT TIMEZONE ===");
const tsWithoutTz = data.columns.filter((c) => c.data_type === "timestamp without time zone");
console.log(`Found ${tsWithoutTz.length} columns with timestamp without time zone:`);
for (const c of tsWithoutTz) {
  console.log(`- ${c.table_name}.${c.column_name}`);
}

console.log("\n=== STEP 1.c: MONEY COLUMNS ===");
const moneyCols = data.columns.filter((c) => c.column_name.includes("amount") || c.column_name.includes("price") || c.column_name.includes("paise"));
for (const c of moneyCols) {
  console.log(`- ${c.table_name}.${c.column_name} (${c.data_type})`);
}

console.log("\n=== STEP 1.c: STATUS / TYPE COLUMNS ===");
const statusCols = data.columns.filter((c) => c.column_name === "status" || c.column_name === "type" || c.column_name === "role");
for (const c of statusCols) {
  const hasCheck = data.uniqueAndCheckConstraints.some(
    (uc) => uc.table_name === c.table_name && uc.constraint_type === "CHECK" && uc.check_clause?.includes(c.column_name)
  );
  console.log(`- ${c.table_name}.${c.column_name} (${c.data_type}) | Has CHECK: ${hasCheck ? "YES" : "NO"}`);
}
