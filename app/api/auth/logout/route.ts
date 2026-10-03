import { NextRequest, NextResponse } from "next/server";
import { cookiesOptions, parseToken } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { isTrustedMutation } from "@/lib/request-security";

export async function POST(req: NextRequest) {
  if (!isTrustedMutation(req)) {
    return NextResponse.json({ error: "Geçersiz istek kaynağı." }, { status: 403 });
  }
  const token = req.cookies.get(cookiesOptions.name)?.value;
  const claims = token ? await parseToken(token).catch(() => null) : null;
  if (claims) {
    try {
      // End all sessions; a copied token cannot survive an explicit logout.
      await prisma.user.updateMany({
        where: { id: claims.id, email: claims.email, sessionVersion: claims.sessionVersion },
        data: { sessionVersion: { increment: 1 } },
      });
    } catch {
      return NextResponse.json({ error: "Çıkış tamamlanamadı. Lütfen tekrar deneyin." }, { status: 503 });
    }
  }
  const response = NextResponse.json({ ok: true });
  const { name, ...options } = cookiesOptions;
  response.cookies.set(name, "", { ...options, maxAge: 0 });
  return response;
}
