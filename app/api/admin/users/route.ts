import { readJsonBody } from "@/lib/request-security";
import { NextRequest, NextResponse } from "next/server";
import { Prisma, Role } from "@prisma/client";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireRole } from "@/lib/admin";
import { hash } from "@/lib/hash";
import { newPasswordSchema } from "@/lib/password-validation";
import { recordAudit } from "@/lib/audit";

const ADMIN_ROLES = ["ADMIN"] as const;

const createUserSchema = z.object({
  email: z.string().trim().toLowerCase().email("Geçerli bir e-posta adresi girin."),
  name: z.string().trim().max(100, "İsim en fazla 100 karakter olabilir.").optional(),
  password: newPasswordSchema,
  role: z.nativeEnum(Role).default(Role.VIEWER),
});

const updateUserSchema = z.object({
  id: z.string().min(1),
  role: z.nativeEnum(Role).optional(),
  isActive: z.boolean().optional(),
  password: newPasswordSchema.optional(),
}).refine((value) => [value.role, value.isActive, value.password].filter((item) => item !== undefined).length === 1, {
  message: "Her istekte yalnızca bir hesap işlemi seçin.",
});

const querySchema = z.object({
  q: z.string().trim().max(100).default(""),
  role: z.nativeEnum(Role).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  page: z.coerce.number().int().min(1).max(100000).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});
const userSelect = { id: true, email: true, name: true, role: true, isActive: true, createdAt: true } as const;

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
    if (error.code === "P2011" || error.code === "P2022" || error.code === "P2021") {
      console.error("User schema migration required", error);
      return NextResponse.json({ error: "Veritabanı güncellemesi eksik. Sunucuda migration'ları uygulayın." }, { status: 503 });
    }
    if (error.code === "P2003") {
      return NextResponse.json({ error: "Bu hesaba bağlı kayıtlar var. Silmek yerine devre dışı bırakabilirsiniz." }, { status: 409 });
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

  const parsed = querySchema.safeParse(Object.fromEntries(req.nextUrl.searchParams));
  if (!parsed.success) return validationError(parsed.error);
  const { q, role, status, page, pageSize } = parsed.data;
  const where: Prisma.UserWhereInput = {
    ...(role ? { role } : {}),
    ...(status ? { isActive: status === "active" } : {}),
    ...(q ? { OR: [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ] } : {}),
  };
  try {
    const [items, total] = await Promise.all([
      prisma.user.findMany({ where, orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        skip: (page - 1) * pageSize, take: pageSize, select: userSelect }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({ items, total, page, totalPages: Math.max(1, Math.ceil(total / pageSize)), currentUserId: sessionUser.id });
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
    const existing = await prisma.user.findMany({
      where: { email: { equals: parsed.data.email, mode: "insensitive" } }, select: { id: true }, take: 1,
    });
    if (existing.length) return NextResponse.json({ error: "Bu e-posta adresiyle kayıtlı bir kullanıcı zaten var." }, { status: 409 });
    const passwordHash = await hash(parsed.data.password);
    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: { email: parsed.data.email, name: parsed.data.name || null, passwordHash, role: parsed.data.role },
        select: userSelect,
      });
      await recordAudit(tx, sessionUser, "USER_CREATED", created.id);
      return created;
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

  const parsed = updateUserSchema.safeParse(await readJsonBody(req).catch(() => null));
  if (!parsed.success) return validationError(parsed.error);

  const { id, role, isActive, password } = parsed.data;
  if (id === sessionUser.id && (isActive === false || password !== undefined || (role !== undefined && role !== Role.ADMIN))) {
    return NextResponse.json({ error: "Kendi hesabınızı bu işlemle değiştiremezsiniz. Şifreniz için profil ayarlarını kullanın." }, { status: 400 });
  }

  try {
    const passwordHash = password === undefined ? undefined : await hash(password);
    const user = await prisma.$transaction(async (tx) => {
      const updated = await tx.user.update({
        where: { id },
        data: { role, isActive, passwordHash, sessionVersion: { increment: 1 } },
        select: userSelect,
      });
      const action = role !== undefined ? "USER_ROLE_CHANGED" : password !== undefined
        ? "USER_PASSWORD_RESET" : isActive ? "USER_ENABLED" : "USER_DISABLED";
      await recordAudit(tx, sessionUser, action, id);
      return updated;
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
    await prisma.$transaction(async (tx) => {
      await tx.user.delete({ where: { id } });
      await recordAudit(tx, sessionUser, "USER_DELETED", id);
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return databaseError(error);
  }
}
