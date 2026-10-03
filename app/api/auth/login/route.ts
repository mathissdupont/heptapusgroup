import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { compare, hash } from "@/lib/hash";
import { createToken, cookiesOptions } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(128),
});

const dummyHash = hash("heptapus-dummy-password-for-timing-only");

export async function POST(req: NextRequest) {
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
    const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    const passwordMatches = user
      ? await compare(parsed.data.password, user.passwordHash)
      : await compare(parsed.data.password, await dummyHash);

    if (!user || !passwordMatches) {
      return NextResponse.json({ error: "E-posta veya şifre hatalı." }, { status: 401 });
    }
    if (user.role === "VIEWER") {
      return NextResponse.json({ error: "Bu hesabın yönetim paneline erişim yetkisi yok." }, { status: 403 });
    }

    const token = await createToken({
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      sessionVersion: user.sessionVersion,
    });

    const response = NextResponse.json({ ok: true, role: user.role });
    const { name, ...options } = cookiesOptions;
    response.cookies.set(name, token, options);
    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ error: "Veritabanına ulaşılamıyor." }, { status: 503 });
    }
    console.error("Login error", error);
    return NextResponse.json({ error: "Giriş işlemi tamamlanamadı." }, { status: 500 });
  }
}
