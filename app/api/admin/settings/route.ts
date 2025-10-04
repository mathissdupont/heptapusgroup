import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { cookiesOptions, parseToken } from "@/lib/auth";

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

export async function GET() {
  const u = await requireAdmin();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const items = await prisma.setting.findMany();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const u = await requireAdmin();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json();

  // her key için upsert
  for (const key of Object.keys(body)) {
    await prisma.setting.upsert({
      where: { key },
      create: { key, value: body[key] },
      update: { value: body[key] },
    });
  }

  return NextResponse.json({ ok: true });
}
