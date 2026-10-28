import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { compare, hash } from "@/lib/hash";
import { createToken, cookiesOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { recordAudit } from "@/lib/audit";
import { databaseServiceError } from "@/lib/database-service-error";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

const dummyHash = hash("heptapus-dummy-password-for-timing-only");

export async function POST(req: NextRequest) {
  if (!process.env.AUTH_SECRET || process.env.AUTH_SECRET.length < 32) {
    return NextResponse.json({ error: "Oturum yapılandırması eksik. Site yöneticisi AUTH_SECRET ayarını kontrol etmeli.", code: "AUTH_CONFIGURATION" }, { status: 503 });
  }
  const limited = await rateLimit(req, "auth:login", { limit: 10, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  const parsed = loginSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "E-posta veya şifre geçersiz." }, { status: 400 });
  }

  const accountLimited = await rateLimit(req, "auth:login:account", {
    limit: 8,
    windowMs: 15 * 60 * 1000,
    identity: parsed.data.email,
  });
  if (accountLimited) return accountLimited;

  try {
    // Older imports may contain mixed-case emails. Never guess between accounts
    // that differ only in casing, even when one is already lowercase.
    const matches = await prisma.user.findMany({ where: { email: { equals: parsed.data.email, mode: "insensitive" } }, take: 2 });
    const user = matches.length === 1 ? matches[0] : null;
    const passwordMatches = user
      ? await compare(parsed.data.password, user.passwordHash)
      : await compare(parsed.data.password, await dummyHash);

    if (!user || !passwordMatches || !user.isActive) {
      await recordAudit(prisma, null, "LOGIN_FAILED", user?.id);
      return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
    }
    if (user.role === "VIEWER") {
      await recordAudit(prisma, null, "LOGIN_FAILED", user.id);
      return NextResponse.json({ error: "Bu hesabın yönetim paneline erişim yetkisi yok." }, { status: 403 });
    }

    await recordAudit(prisma, user, "LOGIN_SUCCEEDED", user.id);
    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      sessionVersion: user.sessionVersion,
    });

    const response = NextResponse.json({ ok: true, role: user.role }, { headers: { "Cache-Control": "no-store", Vary: "Cookie" } });
    const { name, ...options } = cookiesOptions;
    response.cookies.set(name, token, options);
    return response;
  } catch (error) {
    console.error("Login service unavailable");
    return databaseServiceError(error);
  }
}
