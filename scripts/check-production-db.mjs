import { PrismaClient } from "@prisma/client";
import nextEnv from "@next/env";
import { resolve } from "node:path";

nextEnv.loadEnvConfig(resolve(import.meta.dirname, ".."), false);
const prisma = new PrismaClient();
try {
  const report = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SET TRANSACTION READ ONLY`;
    const migrations = await tx.$queryRaw`SELECT migration_name, finished_at, rolled_back_at, applied_steps_count FROM "_prisma_migrations" ORDER BY started_at`;
    const columns = await tx.$queryRaw`SELECT table_name, column_name, data_type, is_nullable FROM information_schema.columns WHERE table_schema = current_schema() AND table_name IN ('User', 'AuditLog', 'RateLimitBucket', 'TeamMember') ORDER BY table_name, ordinal_position`;
    return { migrations, columns };
  });
  console.log(JSON.stringify(report, null, 2));
  const failed = report.migrations.filter((item) => !item.finished_at && !item.rolled_back_at);
  if (failed.length) {
    console.error("Unresolved failed migrations: inspect their SQL and database state before deployment. Do not reset the database or delete migration history.");
    process.exitCode = 1;
  }
} catch (error) {
  // Do not print DATABASE_URL or database engine connection diagnostics.
  console.error("Database diagnostic failed:", error.code || "connection/schema error");
  process.exitCode = 1;
} finally { await prisma.$disconnect(); }
