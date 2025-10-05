import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { cookiesOptions, parseToken } from "@/lib/auth";
import bcrypt from "bcrypt";

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

/* === GET: Liste === */
export async function GET() {
  const u = await requireAdmin(); 
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const items = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({ items });
}

/* === PUT: Rol güncelle === */
export async function PUT(req: NextRequest) {
  const u = await requireAdmin(); 
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { id, role } = await req.json();
  if (!id || !role) return NextResponse.json({ error: "missing params" }, { status: 400 });

  await prisma.user.update({ where: { id }, data: { role } });
  return NextResponse.json({ ok: true });
}

/* === POST: Yeni kullanıcı ekle === */
export async function POST(req: NextRequest) {
  const u = await requireAdmin(); 
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { email, name, password, role } = await req.json();
  if (!email || !password) {
    return NextResponse.json({ error: "email & password required" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: role || "VIEWER",
    },
  });

  return NextResponse.json({ ok: true, user: { id: newUser.id, email: newUser.email, role: newUser.role } });
}

/* === DELETE: Kullanıcı sil === */
export async function DELETE(req: NextRequest) {
  const u = await requireAdmin(); 
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
