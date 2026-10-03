import { NextRequest, NextResponse } from "next/server";
import { open, stat, truncate } from "fs/promises";
import { join } from "path";
import os from "os";
import { requireRole } from "@/lib/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type LogType = "app" | "error";
const ADMIN_ROLES = ["ADMIN"] as const;
const MAX_READ_BYTES = 8 * 1024 * 1024;

function isLogType(value: string): value is LogType {
  return value === "app" || value === "error";
}

function logCandidates(type: LogType) {
  const fileName = `${type}.log`;
  const explicit = type === "app" ? process.env.APP_LOG_PATH : process.env.ERROR_LOG_PATH;
  const candidates = [
    explicit,
    process.env.LOG_DIR ? join(process.env.LOG_DIR, fileName) : undefined,
    join(process.cwd(), "data", "logs", fileName),
    join(process.cwd(), "logs", fileName),
    `/var/log/heptapus/${type === "app" ? "out" : "error"}.log`,
    process.env.HOME
      ? join(process.env.HOME, ".pm2", "logs", `heptapus-${type === "app" ? "out" : "error"}.log`)
      : undefined,
  ].filter((path): path is string => Boolean(path));

  return [...new Set(candidates)];
}

async function resolveLogPath(type: LogType) {
  const candidates = logCandidates(type);
  for (const path of candidates) {
    try {
      const info = await stat(path);
      if (info.isFile()) return { path, exists: true, candidates };
    } catch {
      // Bir sonraki bilinen log konumunu dene.
    }
  }
  return { path: candidates[0], exists: false, candidates };
}

async function readLastLines(filePath: string, maxLines: number, filter?: string) {
  const fileInfo = await stat(filePath);
  const bytesToRead = Math.min(fileInfo.size, MAX_READ_BYTES);
  const start = Math.max(0, fileInfo.size - bytesToRead);
  const file = await open(filePath, "r");

  try {
    const buffer = Buffer.alloc(bytesToRead);
    const { bytesRead } = await file.read(buffer, 0, bytesToRead, start);
    let content = buffer.subarray(0, bytesRead).toString("utf8");

    // Dosyanın ortasından okumaya başladıysak ilk yarım satırı gösterme.
    if (start > 0) {
      const firstLineBreak = content.indexOf("\n");
      content = firstLineBreak >= 0 ? content.slice(firstLineBreak + 1) : "";
    }

    let lines = content.split(/\r?\n/).filter((line) => line.trim().length > 0);
    if (filter) {
      const normalizedFilter = filter.toLocaleLowerCase("tr-TR");
      lines = lines.filter((line) => line.toLocaleLowerCase("tr-TR").includes(normalizedFilter));
    }

    return {
      lines: lines.slice(-maxLines),
      fileSize: fileInfo.size,
      lastModified: fileInfo.mtime.toISOString(),
      truncated: fileInfo.size > MAX_READ_BYTES,
    };
  } finally {
    await file.close();
  }
}

export async function GET(req: NextRequest) {
  const user = await requireRole(ADMIN_ROLES, req);
  if (!user) {
    return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli." }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const typeParam = searchParams.get("type") || "app";
  if (!isLogType(typeParam)) {
    return NextResponse.json({ error: "Geçersiz log türü." }, { status: 400 });
  }

  const requestedLines = Number.parseInt(searchParams.get("lines") || "500", 10);
  const maxLines = Number.isFinite(requestedLines)
    ? Math.min(2000, Math.max(50, requestedLines))
    : 500;
  const filter = searchParams.get("filter")?.trim() || undefined;
  const resolved = await resolveLogPath(typeParam);

  const memUsage = process.memoryUsage();
  const system = {
    nodeVersion: process.version,
    platform: os.platform(),
    arch: os.arch(),
    hostname: os.hostname(),
    uptime: Math.floor(process.uptime()),
    loadAvg: os.loadavg().map((load) => load.toFixed(2)),
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    heapUsed: memUsage.heapUsed,
    heapTotal: memUsage.heapTotal,
    rss: memUsage.rss,
    cpuCores: os.cpus().length,
  };

  if (!resolved.exists) {
    return NextResponse.json({
      type: typeParam,
      path: resolved.path,
      lines: [],
      fileSize: 0,
      lastModified: "",
      available: false,
      truncated: false,
      searchedPaths: resolved.candidates,
      system,
    });
  }

  try {
    const result = await readLastLines(resolved.path, maxLines, filter);
    return NextResponse.json({
      type: typeParam,
      path: resolved.path,
      available: true,
      searchedPaths: resolved.candidates,
      ...result,
      system,
    });
  } catch (error) {
    console.error("Log read error", error);
    return NextResponse.json({ error: "Log dosyası okunamadı." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await requireRole(ADMIN_ROLES, req);
  if (!user) {
    return NextResponse.json({ error: "Bu işlem için yönetici yetkisi gerekli." }, { status: 403 });
  }

  const typeParam = new URL(req.url).searchParams.get("type") || "app";
  if (!isLogType(typeParam)) {
    return NextResponse.json({ error: "Geçersiz log türü." }, { status: 400 });
  }

  const resolved = await resolveLogPath(typeParam);
  if (!resolved.exists) {
    return NextResponse.json({ error: "Temizlenecek log dosyası bulunamadı." }, { status: 404 });
  }

  try {
    await truncate(resolved.path, 0);
    return NextResponse.json({ ok: true, message: `${typeParam} logu temizlendi.` });
  } catch (error) {
    console.error("Log clear error", error);
    return NextResponse.json({ error: "Log dosyası temizlenemedi." }, { status: 500 });
  }
}
