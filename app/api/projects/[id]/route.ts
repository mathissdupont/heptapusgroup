import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { cookies } from "next/headers";
import { cookiesOptions, parseToken } from "@/lib/auth";
import type { Role } from "@prisma/client";


/** Sadece ADMIN ve EDITOR kabul eden rol tipi */
type ElevatedRole = Extract<Role, "ADMIN" | "EDITOR">;

/** readonly dizi ile inference sabitlenir */
const ELEVATED: readonly ElevatedRole[] = ["ADMIN", "EDITOR"] as const;

async function requireRole(roles: readonly ElevatedRole[], _req: NextRequest) {
  const token = (await cookies()).get(cookiesOptions.name)?.value;
  if (!token) return null;
  try {
    const user = await parseToken(token); // { id, email, role, ... }
    return (roles as readonly Role[]).includes(user.role as Role) ? user : null;
  } catch {
    return null;
  }
}

type Ctx = { params: { id: string } };

export async function PUT(req: NextRequest, ctx: any) {
  const params = ctx?.params || {};
  const user = await requireRole(ELEVATED, req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const data = await req.json();
    await prisma.project.update({ where: { id: params.id }, data });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "bad request" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, ctx: any) {
  const params = ctx?.params || {};
  const user = await requireRole(ELEVATED, req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    await prisma.project.delete({ where: { id: params.id } });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e.message ?? "bad request" }, { status: 400 });
  }
}
