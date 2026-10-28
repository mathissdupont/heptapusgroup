import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { subdomainSchema } from "@/lib/subdomain-validation";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";

const updateSchema = subdomainSchema.partial();

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const { id } = await params;
  try {
    const subdomain = await prisma.subdomain.findUnique({ where: { id } });
    return subdomain
      ? NextResponse.json(subdomain)
      : NextResponse.json({ error: "Subdomain bulunamadı." }, { status: 404 });
  } catch (error) {
    console.error("Subdomain fetch error", error);
    return NextResponse.json({ error: "Subdomain yüklenemedi." }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = updateSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Geçersiz bilgi." }, { status: 400 });
  }
  const { id } = await params;

  const { settings, ...fields } = parsed.data;
  const data: Prisma.SubdomainUpdateInput = fields;
  if (settings !== undefined) {
    data.settings = settings === null
      ? Prisma.JsonNull
      : settings as Prisma.InputJsonValue;
  }

  try {
    const subdomain = await prisma.subdomain.update({ where: { id }, data });
    return NextResponse.json(subdomain);
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") return NextResponse.json({ error: "Subdomain bulunamadı." }, { status: 404 });
      if (error.code === "P2002") return NextResponse.json({ error: "Bu subdomain zaten kayıtlı." }, { status: 409 });
    }
    console.error("Subdomain update error", error);
    return NextResponse.json({ error: "Subdomain güncellenemedi." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const { id } = await params;
  try {
    await prisma.subdomain.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
      return NextResponse.json({ error: "Subdomain bulunamadı." }, { status: 404 });
    }
    console.error("Subdomain delete error", error);
    return NextResponse.json({ error: "Subdomain silinemedi." }, { status: 500 });
  }
}
