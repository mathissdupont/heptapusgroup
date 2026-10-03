/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");
const MODELS = [
  { table: "User",            columns: ["id","email","name","passwordHash","role","createdAt","updatedAt"] },
  { table: "Project",         columns: ["id","title","slug","summary","imageUrl","status","tags","content","translations","createdAt","updatedAt"] },
  { table: "Media",           columns: ["id","url","name","mime","size","width","height","createdAt"] },
  { table: "ContactMessage",  columns: ["id","name","email","subject","message","read","createdAt"] },
  { table: "Upload",          columns: ["id","filename","url","createdAt"] },
  { table: "Setting",         columns: ["id","key","value","updatedAt"] },
  { table: "Subdomain",       columns: ["id","name","title","description","logoUrl","themeColor","isActive","settings","createdAt","updatedAt"] },
  { table: "Partner",         columns: ["id","name","logoUrl","website","order","isActive","createdAt","updatedAt"] },
  { table: "Testimonial",     columns: ["id","author","role","company","content","avatarUrl","rating","isActive","order","translations","createdAt","updatedAt"] },
  { table: "FaqItem",         columns: ["id","question","answer","category","order","isActive","translations","createdAt","updatedAt"] },
  { table: "BlogPost",        columns: ["id","title","slug","excerpt","content","coverImage","author","tags","status","publishedAt","translations","createdAt","updatedAt"] },
  { table: "JobPosting",      columns: ["id","title","slug","department","location","type","description","requirements","isActive","translations","createdAt","updatedAt"] },
  { table: "JobApplication",  columns: ["id","name","email","phone","resumeUrl","coverLetter","jobId","createdAt"] },
  { table: "Subscriber",      columns: ["id","email","isActive","createdAt"] },
  { table: "Announcement",    columns: ["id","message","linkUrl","linkText","bgColor","isActive","startsAt","endsAt","translations","createdAt","updatedAt"] },
];
async function copyData(sqlite, pg) {
  let totalRows = 0;
  await pg.query("BEGIN");
  try {
    // Import only into an empty target and lock out concurrent writers.
    for (const { table } of MODELS) {
      await pg.query(`LOCK TABLE "${table}" IN EXCLUSIVE MODE`);
      const result = await pg.query(`SELECT COUNT(*) AS count FROM "${table}"`);
      if (Number(result.rows[0].count) !== 0) throw new Error(`Target table ${table} is not empty; import refused.`);
    }
    for (const { table, columns } of MODELS) {
      let rows;
      try { rows = sqlite.prepare(`SELECT * FROM "${table}"`).all(); }
      catch (error) {
        if (String(error.message).includes("no such table")) continue;
        throw error;
      }
      if (!rows.length) continue;
      for (const row of rows) {
        const values = columns.map((column) => {
          let value = row[column];
          if (["tags", "translations", "settings"].includes(column) && value != null) {
            if (typeof value === "string") value = JSON.parse(value);
            value = JSON.stringify(value);
          }
          if (["read", "isActive"].includes(column)) value = value === 1 || value === true;
          if (column.endsWith("At") && typeof value === "number") value = new Date(value).toISOString();
          return value === undefined ? null : value;
        });
        const fields = columns.map((column) => `"${column}"`).join(", ");
        const placeholders = columns.map((_, index) => `$${index + 1}`).join(", ");
        await pg.query(`INSERT INTO "${table}" (${fields}) VALUES (${placeholders})`, values);
      }
      if (table === "Upload") {
        await pg.query(`SELECT setval('"Upload_id_seq"', (SELECT MAX("id") FROM "Upload"), true)`);
      }
      totalRows += rows.length;
    }
    await pg.query("COMMIT");
    return totalRows;
  } catch (error) {
    await pg.query("ROLLBACK");
    throw error;
  }
}

async function main() {
  const pgUrl = process.env.PG_URL;
  if (!pgUrl) throw new Error("PG_URL ortam değişkeni gerekli.");
  const Database = require("better-sqlite3");
  const { Client } = require("pg");
  const sqlite = new Database(process.env.SQLITE_PATH || path.join(__dirname, "..", "prisma", "dev.db"), { readonly: true });
  const pg = new Client({ connectionString: pgUrl });
  try {
    await pg.connect();
    const rows = await copyData(sqlite, pg);
    console.log(`Migration tamamlandı: ${rows} kayıt aktarıldı.`);
  } finally {
    sqlite.close();
    await pg.end();
  }
}

module.exports = { copyData };
if (require.main === module) main().catch((error) => {
  console.error(error instanceof Error ? error.message : "Migration failed.");
  process.exitCode = 1;
});
