import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";
import { readJsonBody } from "@/lib/request-security";
import { teamMemberUpdateSchema } from "@/lib/team-validation";
import { teamError } from "@/lib/team-api-errors";

type Context = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Context) {
  if (!await requireElevated(req)) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  const parsed = teamMemberUpdateSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success || !Object.keys(parsed.data).length) return NextResponse.json({ error: "Üye bilgilerini kontrol edin." }, { status: 400 });
  try {
    const { id } = await params;
    const item = await prisma.teamMember.update({ where: { id }, data: parsed.data });
    return NextResponse.json({ item });
  } catch (error) { return teamError(error); }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  if (!await requireElevated(req)) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });
  try {
    const { id } = await params;
    await prisma.teamMember.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) { return teamError(error); }
}
