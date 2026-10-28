import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { subdomainSchema } from "@/lib/subdomain-validation";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";

const createSchema = subdomainSchema;

function jsonInput(value: z.infer<typeof createSchema>["settings"]) {
  if (value === undefined) return undefined;
  return value === null ? Prisma.JsonNull : value as Prisma.InputJsonValue;
}

export async function GET(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  try {
    const subdomains = await prisma.subdomain.findMany({ orderBy: { name: "asc" } });
    return NextResponse.json(subdomains);
  } catch (error) {
    console.error("Subdomain list error", error);
    return NextResponse.json({ error: "Subdomain listesi yüklenemedi." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const parsed = createSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Geçersiz bilgi." }, { status: 400 });
  }

  try {
    const subdomain = await prisma.subdomain.create({
      data: {
        ...parsed.data,
        description: parsed.data.description || null,
        logoUrl: parsed.data.logoUrl || null,
        themeColor: parsed.data.themeColor || null,
        isActive: parsed.data.isActive ?? true,
        settings: jsonInput(parsed.data.settings),
      },
    });
    return NextResponse.json(subdomain, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "Bu subdomain zaten kayıtlı." }, { status: 409 });
    }
    console.error("Subdomain create error", error);
    return NextResponse.json({ error: "Subdomain oluşturulamadı." }, { status: 500 });
  }
}
