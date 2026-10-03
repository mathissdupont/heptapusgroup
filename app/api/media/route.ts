import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireElevated } from "@/lib/admin";
import { removeStoredUpload, storeUpload, UploadValidationError } from "@/lib/uploads";
import { readUploadForm, RequestBodyError } from "@/lib/request-security";

export const runtime = "nodejs";

function positiveInteger(value: string | null, fallback: number, max?: number) {
  const parsed = Number.parseInt(value || "", 10);
  const safe = Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
  return max ? Math.min(safe, max) : safe;
}

export async function GET(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const page = positiveInteger(searchParams.get("page"), 1);
  const pageSize = positiveInteger(searchParams.get("pageSize"), 30, 100);
  const q = (searchParams.get("q") || "").trim().slice(0, 100);
  const type = searchParams.get("type");

  const where: Prisma.MediaWhereInput = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { url: { contains: q, mode: "insensitive" } },
      { mime: { contains: q, mode: "insensitive" } },
    ];
  }
  if (type === "image" || type === "video") {
    where.mime = { startsWith: `${type}/` };
  }

  try {
    const [total, items] = await Promise.all([
      prisma.media.count({ where }),
      prisma.media.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);
    return NextResponse.json({ items, total, page, pageSize });
  } catch (error) {
    console.error("Media list error", error);
    return NextResponse.json({ error: "Medya listesi yüklenemedi." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireElevated(req);
  if (!user) return NextResponse.json({ error: "Bu işlem için yetkiniz yok." }, { status: 403 });

  const storedFiles: Awaited<ReturnType<typeof storeUpload>>[] = [];
  try {
    const form = await readUploadForm(req);
    const files = form.getAll("files").filter((value): value is File => value instanceof File);
    const single = form.get("file");
    if (!files.length && single instanceof File) files.push(single);

    if (!files.length) {
      return NextResponse.json({ error: "Dosya seçilmedi." }, { status: 400 });
    }
    if (files.length > 10) {
      return NextResponse.json({ error: "Tek seferde en fazla 10 dosya yüklenebilir." }, { status: 400 });
    }

    for (const file of files) {
      storedFiles.push(await storeUpload(file, ["image", "video"]));
    }

    const items = await prisma.$transaction(
      storedFiles.map((stored) => prisma.media.create({
        data: {
          url: stored.url,
          name: stored.name,
          mime: stored.mime,
          size: stored.size,
        },
      })),
    );
    return NextResponse.json({ ok: true, items }, { status: 201 });
  } catch (error) {
    await Promise.all(storedFiles.map((file) => removeStoredUpload(file.url)));
    if (error instanceof UploadValidationError || error instanceof RequestBodyError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Media upload error", error);
    return NextResponse.json({ error: "Dosyalar yüklenemedi." }, { status: 500 });
  }
}
