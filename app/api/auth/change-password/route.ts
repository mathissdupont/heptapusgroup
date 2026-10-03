import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { compare, hash } from "@/lib/hash";
import { createToken, cookiesOptions, getSessionUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";
import { newPasswordSchema } from "@/lib/password-validation";

const passwordSchema = z.object({
  currentPassword: z.string().min(1).max(128),
  newPassword: newPasswordSchema,
}).refine((value) => value.currentPassword !== value.newPassword, {
  message: "Yeni şifre mevcut şifreden farklı olmalıdır.",
  path: ["newPassword"],
});

export async function POST(req: NextRequest) {
  const limited = await rateLimit(req, "auth:change-password", { limit: 5, windowMs: 15 * 60 * 1000 });
  if (limited) return limited;

  try {
    const session = await getSessionUser(req);
    const parsed = passwordSchema.safeParse(await readJsonBody(req).catch(() => null));
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Gönderilen bilgiler geçersiz." },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({ where: { id: session.id } });
    if (!user || user.email !== session.email || user.role === "VIEWER" || user.sessionVersion !== session.sessionVersion) {
      return NextResponse.json({ error: "Oturum geçersiz." }, { status: 401 });
    }

    const passwordMatches = await compare(parsed.data.currentPassword, user.passwordHash);
    if (!passwordMatches) {
      return NextResponse.json({ error: "Mevcut şifre hatalı." }, { status: 401 });
    }

    const updated = await prisma.user.update({
      where: { id: user.id, sessionVersion: session.sessionVersion, passwordHash: user.passwordHash },
      data: {
        passwordHash: await hash(parsed.data.newPassword),
        sessionVersion: { increment: 1 },
      },
    });

    const token = await createToken({
      id: updated.id,
      email: updated.email,
      name: updated.name,
      role: updated.role,
      sessionVersion: updated.sessionVersion,
    });
    const response = NextResponse.json({ ok: true });
    const { name, ...options } = cookiesOptions;
    response.cookies.set(name, token, options);
    return response;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json({ error: "Veritabanına ulaşılamıyor." }, { status: 503 });
    }
    return NextResponse.json({ error: "Oturum geçersiz veya süresi dolmuş." }, { status: 401 });
  }
}
