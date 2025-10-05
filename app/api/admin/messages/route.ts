import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { cookiesOptions, parseToken } from "@/lib/auth";

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function requireAdmin() {
  const token = (await cookies()).get(cookiesOptions.name)?.value;
  if (!token) return null;
  try {
    const u = await parseToken(token);
    return u.role === "ADMIN" ? u : null;
  } catch {
    return null;
  }
}

// GET → mesaj listesi
export async function GET() {
  const u = await requireAdmin();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const items = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ items });
}

// PUT → okundu işaretle
export async function PUT(req: NextRequest) {
  const u = await requireAdmin();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id, read } = await req.json();
  await prisma.contactMessage.update({
    where: { id },
    data: { read },
  });

  return NextResponse.json({ ok: true });
}
