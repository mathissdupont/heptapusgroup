import { access, statfs } from "node:fs/promises";
import { constants } from "node:fs";
import { join } from "node:path";
import { prisma } from "@/lib/db";

export async function systemHealth() {
  const started = Date.now();
  const directory = process.env.UPLOAD_DIR || join(process.cwd(), "data", "uploads");
  const [database, schema, writable, disk] = await Promise.all([
    prisma.$queryRaw`SELECT 1`.then(() => ({ ok: true, ms: Date.now() - started }))
      .catch(() => ({ ok: false, ms: Date.now() - started })),
    Promise.all([
      prisma.user.findFirst({ select: { id: true, sessionVersion: true, isActive: true } }),
      prisma.auditLog.count(),
      prisma.$queryRaw`SELECT "key" FROM "RateLimitBucket" LIMIT 1`,
      prisma.$queryRaw`SELECT "column_name" FROM information_schema.columns WHERE table_schema = current_schema() AND table_name = 'User' AND column_name = 'password' AND is_nullable = 'NO'`,
    ]).then((results) => (results[3] as unknown[]).length === 0).catch(() => false),
    access(directory, constants.W_OK).then(() => true).catch(() => false),
    statfs(directory).then((stats) => stats.bavail * stats.bsize).catch(() => null),
  ]);
  return { database, schemaOk: schema, storage: { writable, freeBytes: disk }, uptimeSeconds: Math.floor(process.uptime()) };
}
