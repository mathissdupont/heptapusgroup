// app/api/media/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/admin";
import { join } from "path";
import { mkdir, stat } from "fs/promises";
import { createWriteStream } from "fs";


export const runtime = "nodejs";

// GET /api/media?page=1&pageSize=30&q=abc&type=image
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, Number(searchParams.get("page") || 1));
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize") || 30)));
  const q = (searchParams.get("q") || "").trim();
  const type = (searchParams.get("type") || "").trim(); // "image" | "video" | "" ...

  const where: any = {};
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { url:  { contains: q, mode: "insensitive" } },
      { mime: { contains: q, mode: "insensitive" } },
    ];
  }
  if (type) {
    where.mime = { startsWith: `${type}/` };
  }

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
}

// POST /api/media  (multipart; "files" çoklu olabilir)
export async function POST(req: NextRequest) {
  if (!isAdmin(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const files = form.getAll("files").filter(Boolean) as File[];
  if (!files.length) {
    // single="file" destekle
    const single = form.get("file") as File | null;
    if (single) files.push(single);
  }
  if (!files.length) {
    return NextResponse.json({ error: "file(s) missing" }, { status: 400 });
  }

  const uploadsDir = join(process.cwd(), "public", "uploads");
  try { await stat(uploadsDir); } catch { await mkdir(uploadsDir, { recursive: true }); }

  const results: any[] = [];

  for (const file of files) {
    const bytes = Buffer.from(await file.arrayBuffer());
    const safe = `${Date.now()}-${file.name.replace(/[^\w\-.]+/g, "_")}`;
    const filepath = join(uploadsDir, safe);

    await new Promise<void>((res, rej) => {
      const ws = createWriteStream(filepath);
      ws.on("finish", res);
      ws.on("error", rej);
      ws.end(bytes);
    });

    const url = `/uploads/${safe}`;

    const media = await prisma.media.create({
      data: {
        url,
        name: file.name,
        mime: file.type || "application/octet-stream",
        size: bytes.length,
      },
    });

    results.push(media);
  }

  return NextResponse.json({ ok: true, items: results }, { status: 201 });
}
