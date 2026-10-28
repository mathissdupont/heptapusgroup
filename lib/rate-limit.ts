import { createHash } from "node:crypto";
import { isIP } from "node:net";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isTrustedMutation } from "@/lib/request-security";
import { databaseServiceError } from "@/lib/database-service-error";

type RateLimitOptions = { limit: number; windowMs: number; identity?: string };
let nextCleanupAt = 0;

export function getClientIp(req: NextRequest) {
  // Only trust a header that the deployment's reverse proxy overwrites.
  const header = process.env.TRUSTED_PROXY_IP_HEADER?.trim().toLowerCase();
  if (!header || !["cf-connecting-ip", "x-real-ip", "x-forwarded-for"].includes(header)) return "unknown";
  const value = req.headers.get(header)?.trim();
  const ip = header === "x-forwarded-for" ? value?.split(",").at(-1)?.trim() : value;
  if (!ip || !isIP(ip)) return "unknown";
  return isIP(ip) === 6 ? new URL(`http://[${ip}]/`).hostname.slice(1, -1) : ip;
}

/** PostgreSQL provides one atomic counter across all workers and restarts. */
export async function rateLimit(req: NextRequest, scope: string, { limit, windowMs, identity }: RateLimitOptions) {
  if (!isTrustedMutation(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  const key = createHash("sha256").update(`${scope}:${identity ?? getClientIp(req)}`).digest("hex");
  try {
    const [bucket] = await prisma.$queryRaw<{ count: number; resetAt: Date }[]>`
      INSERT INTO "RateLimitBucket" ("key", "count", "resetAt")
      VALUES (${key}, 1, CURRENT_TIMESTAMP + ${windowMs} * INTERVAL '1 millisecond')
      ON CONFLICT ("key") DO UPDATE SET
        "count" = CASE WHEN "RateLimitBucket"."resetAt" <= CURRENT_TIMESTAMP THEN 1
          ELSE LEAST("RateLimitBucket"."count", 2147483646) + 1 END,
        "resetAt" = CASE WHEN "RateLimitBucket"."resetAt" <= CURRENT_TIMESTAMP
          THEN EXCLUDED."resetAt" ELSE "RateLimitBucket"."resetAt" END
      RETURNING "count", "resetAt"
    `;
    if (Date.now() >= nextCleanupAt) {
      nextCleanupAt = Date.now() + 60_000;
      await prisma.$executeRaw`DELETE FROM "RateLimitBucket" WHERE "resetAt" < CURRENT_TIMESTAMP`;
    }
    if (bucket.count <= limit) return null;
    return NextResponse.json(
      { error: "Çok fazla istek gönderildi. Lütfen bir süre sonra tekrar deneyin." },
      { status: 429, headers: {
        "Retry-After": String(Math.max(1, Math.ceil((bucket.resetAt.getTime() - Date.now()) / 1000))),
        "X-RateLimit-Limit": String(limit), "X-RateLimit-Remaining": "0",
        "X-RateLimit-Reset": String(Math.ceil(bucket.resetAt.getTime() / 1000)),
        "Cache-Control": "no-store",
      } },
    );
  } catch (error) {
    console.error("Rate limit storage unavailable");
    return databaseServiceError(error);
  }
}
