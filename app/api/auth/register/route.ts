import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hash } from "@/lib/hash";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    // İçeriği güvenli parse et
    let body: any = null;
    const ct = req.headers.get("content-type") || "";
    if (ct.includes("application/json")) {
      body = await req.json();
    } else {
      const raw = await req.text();
      try {
        body = JSON.parse(raw);
      } catch {
        return NextResponse.json(
          { error: "invalid json body" },
          { status: 400 }
        );
      }
    }

    const { email, password, name } = body ?? {};
    if (!email || !password) {
      return NextResponse.json({ error: "missing fields" }, { status: 400 });
    }

    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) {
      return NextResponse.json({ error: "email exists" }, { status: 409 });
    }

    const usersCount = await prisma.user.count();
    const role =
      usersCount === 0 || email === process.env.ADMIN_EMAIL
        ? "ADMIN"
        : "VIEWER";

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: await hash(password),
        role: role as any,
      },
    });

    return NextResponse.json({ ok: true, id: user.id, role: user.role });
  } catch (e: any) {
    // JSON parse hatası dahil tüm hataları 400 dökelim
    return NextResponse.json(
      { error: e?.message || "bad request" },
      { status: 400 }
    );
  }
}
