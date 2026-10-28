import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";
import { readJsonBody } from "@/lib/request-security";
import { teamMemberSchema } from "@/lib/team-validation";
import { teamError } from "@/lib/team-api-errors";

export async function GET(req: NextRequest) {
  if (!await requireElevated(req)) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  try {
    const items = await prisma.teamMember.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });
    return NextResponse.json({ items });
  } catch (error) { return teamError(error); }
}

export async function POST(req: NextRequest) {
  if (!await requireElevated(req)) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  const parsed = teamMemberSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
  try {
    const item = await prisma.teamMember.create({ data: parsed.data });
    return NextResponse.json({ item }, { status: 201 });
  } catch (error) { return teamError(error); }
}
