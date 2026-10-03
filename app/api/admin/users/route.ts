import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/admin";
import { hash } from "@/lib/hash";
import { newPasswordSchema } from "@/lib/password-validation";

const ADMIN_ROLES = ["ADMIN"] as const;

const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin."),
  name: z.string().trim().max(100, "İsim en fazla 100 karakter olabilir.").optional(),
  password: newPasswordSchema,
  role: z.nativeEnum(Role).default(Role.VIEWER),
});

const updateRoleSchema = z.object({
  id: z.string().min(1),
  role: z.nativeEnum(Role),
});

function validationError(error: z.ZodError) {
  return NextResponse.json(
    { error: error.issues[0]?.message || "Gönderilen bilgiler geçersiz." },
    { status: 400 },
  );
}

function databaseError(error: unknown) {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    console.error("User database connection error", error);
    return NextResponse.json(
      { error: "Veritabanına ulaşılamıyor. Lütfen veritabanı bağlantısını kontrol edin." },
      { status: 503 },
    );
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { error: "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var." },
        { status: 409 },
      );
    }
    if (error.code === "P2025") {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }
  }

  console.error("User management error", error);
  return NextResponse.json({ error: "Kullanıcı işlemi tamamlanamadı." }, { status: 500 });
}

export async function GET(req: NextRequest) {
  const sessionUser = await requireRole(ADMIN_ROLES, req);
  if (!sessionUser) {
    return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli." }, { status: 403 });
  }

  try {
    const items = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({ items, currentUserId: sessionUser.id });
  } catch (error) {
    return databaseError(error);
  }
}

export async function POST(req: NextRequest) {
  const sessionUser = await requireRole(ADMIN_ROLES, req);
  if (!sessionUser) {
    return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli." }, { status: 403 });
  }

  const parsed = createUserSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  try {
    const passwordHash = await hash(parsed.data.password);
    const user = await prisma.user.create({
      data: {
        email: parsed.data.email,
        name: parsed.data.name || null,
        passwordHash,
        role: parsed.data.role,
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true },
    });

    return NextResponse.json({ ok: true, user }, { status: 201 });
  } catch (error) {
    return databaseError(error);
  }
}

export async function PUT(req: NextRequest) {
  const sessionUser = await requireRole(ADMIN_ROLES, req);
  if (!sessionUser) {
    return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli." }, { status: 403 });
  }

  const parsed = updateRoleSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  if (parsed.data.id === sessionUser.id && parsed.data.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Kendi yönetici yetkinizi kaldıramazsınız." }, { status: 400 });
  }

  try {
    const user = await prisma.user.update({
      where: { id: parsed.data.id },
      data: { role: parsed.data.role, sessionVersion: { increment: 1 } },
      select: { id: true, role: true },
    });
    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return databaseError(error);
  }
}

export async function DELETE(req: NextRequest) {
  const sessionUser = await requireRole(ADMIN_ROLES, req);
  if (!sessionUser) {
    return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli." }, { status: 403 });
  }

  const id = new URL(req.url).searchParams.get("id")?.trim();
  if (!id) {
    return NextResponse.json({ error: "Kullanıcı kimliği gerekli." }, { status: 400 });
  }
  if (id === sessionUser.id) {
    return NextResponse.json({ error: "Kendi hesabınızı silemezsiniz." }, { status: 400 });
  }

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseError(error);
  }
}
