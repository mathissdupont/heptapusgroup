#!/usr/bin/env node
// ─────────────────────────────────────────────────────
// SQLite → PostgreSQL Data Migration Script
// ─────────────────────────────────────────────────────
// Bu script mevcut SQLite veritabanındaki tüm verileri
// yeni PostgreSQL veritabanına aktarır.
//
// Kullanım:
//   1) PostgreSQL container'ını başlatın:
//        docker compose up -d db
//   2) PostgreSQL şemasını oluşturun:
//        DATABASE_URL="postgresql://heptapus:heptapus_secret_2026@localhost:5432/heptapus" npx prisma migrate deploy
//   3) Migration script'ini çalıştırın:
//        node scripts/migrate-sqlite-to-pg.js
// ─────────────────────────────────────────────────────

const Database = require("better-sqlite3");
const { Client } = require("pg");
const path = require("path");

// ── Config ──
const SQLITE_PATH = process.env.SQLITE_PATH || path.join(__dirname, "..", "prisma", "dev.db");
const PG_URL = process.env.PG_URL || "postgresql://heptapus:heptapus_secret_2026@localhost:5432/heptapus";

// ── Model tanımları — migration sırası (FK bağımlılıkları dikkate alınmış) ──
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

// JSON sütunları — bu sütunlardaki string değerler PostgreSQL JSONB'ye dönüştürülmeli
const JSON_COLUMNS = new Set(["tags", "translations", "settings"]);

// Boolean sütunları — SQLite'da 0/1, PostgreSQL'de true/false
const BOOL_COLUMNS = new Set(["read", "isActive"]);

async function main() {
  console.log("🔄 SQLite → PostgreSQL migration başlıyor...\n");

  // ── SQLite bağlantısı ──
  let sqlite;
  try {
    sqlite = new Database(SQLITE_PATH, { readonly: true });
    console.log(`✅ SQLite açıldı: ${SQLITE_PATH}`);
  } catch (err) {
    console.error(`❌ SQLite açılamadı: ${SQLITE_PATH}`);
    console.error(err.message);
    process.exit(1);
  }

  // ── PostgreSQL bağlantısı ──
  const pg = new Client({ connectionString: PG_URL });
  try {
    await pg.connect();
    console.log(`✅ PostgreSQL bağlandı: ${PG_URL.replace(/:[^:@]+@/, ":***@")}\n`);
  } catch (err) {
    console.error(`❌ PostgreSQL bağlantısı başarısız`);
    console.error(err.message);
    process.exit(1);
  }

  let totalRows = 0;

  for (const model of MODELS) {
    const { table, columns } = model;

    // SQLite'dan oku
    let rows;
    try {
      rows = sqlite.prepare(`SELECT * FROM "${table}"`).all();
    } catch (err) {
      console.log(`⚠️  ${table}: tablo bulunamadı, atlanıyor`);
      continue;
    }

    if (rows.length === 0) {
      console.log(`○ ${table}: 0 kayıt (boş)`);
      continue;
    }

    // PostgreSQL'e yaz
    try {
      // Truncate to avoid conflicts
      await pg.query(`DELETE FROM "${table}"`);

      for (const row of rows) {
        const vals = [];
        const placeholders = [];
        let idx = 1;

        for (const col of columns) {
          let val = row[col];

          // JSON columns: parse string to object for JSONB
          if (JSON_COLUMNS.has(col) && typeof val === "string") {
            try {
              val = JSON.parse(val);
            } catch {
              // Already valid or null
            }
          }

          // Boolean columns: SQLite 0/1 → JS boolean
          if (BOOL_COLUMNS.has(col)) {
            val = val === 1 || val === true;
          }

          // Date columns: ensure ISO string
          if (col.endsWith("At") && val && typeof val === "number") {
            val = new Date(val).toISOString();
          }

          vals.push(val === undefined ? null : val);
          placeholders.push(`$${idx}`);
          idx++;
        }

        // Columns with quotes to handle reserved words
        const colList = columns.map(c => `"${c}"`).join(", ");
        const query = `INSERT INTO "${table}" (${colList}) VALUES (${placeholders.join(", ")}) ON CONFLICT DO NOTHING`;
        await pg.query(query, vals);
      }

      // Upload tablosu auto-increment sequence'ını güncelle
      if (table === "Upload") {
        await pg.query(`SELECT setval('"Upload_id_seq"', (SELECT COALESCE(MAX(id), 0) FROM "Upload"))`);
      }

      console.log(`✅ ${table}: ${rows.length} kayıt aktarıldı`);
      totalRows += rows.length;
    } catch (err) {
      console.error(`❌ ${table}: hata — ${err.message}`);
    }
  }

  // Cleanup
  sqlite.close();
  await pg.end();

  console.log(`\n🎉 Migration tamamlandı! Toplam ${totalRows} kayıt aktarıldı.`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
