// app/api/admin/logs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { readFile, stat } from "fs/promises";
import { join } from "path";
import { cookies } from "next/headers";
import { cookiesOptions, parseToken } from "@/lib/auth";
import os from "os";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function requireAdmin() {
  const token = (await cookies()).get(cookiesOptions.name)?.value;
  if (!token) return null;
  try {
    const u = await parseToken(token);
    return u.role === "ADMIN" ? u : null;
  } catch {
    return null;
  }
}

// PM2 log dosyaları
const LOG_FILES: Record<string, string> = {
  app: "/var/log/heptapus/out.log",
  error: "/var/log/heptapus/error.log",
};

// Windows'da geliştirme ortamı için fallback
function getLogPath(type: string): string {
  const configured = LOG_FILES[type];
  if (!configured) return "";

  // Windows'da dev ortamı — proje içindeki logs/ klasörüne bak
  if (os.platform() === "win32") {
    return join(process.cwd(), "logs", `${type}.log`);
  }

  return configured;
}

async function readLastLines(filePath: string, maxLines: number, filter?: string): Promise<{
  lines: string[];
  fileSize: number;
  lastModified: string;
}> {
  try {
    const fstat = await stat(filePath);
    const content = await readFile(filePath, "utf-8");

    let lines = content.split("\n").filter((l) => l.trim());

    // Filtre uygula
    if (filter) {
      const lower = filter.toLowerCase();
      lines = lines.filter((l) => l.toLowerCase().includes(lower));
    }

    // Son N satırı al
    const lastN = lines.slice(-maxLines);

    return {
      lines: lastN,
      fileSize: fstat.size,
      lastModified: fstat.mtime.toISOString(),
    };
  } catch (err: unknown) {
    if (err && typeof err === 'object' && 'code' in err && (err as {code:string}).code === "ENOENT") {
      return { lines: [], fileSize: 0, lastModified: "" };
    }
    throw err;
  }
}

// GET /api/admin/logs?type=app|error&lines=200&filter=xxx
export async function GET(req: NextRequest) {
  const u = await requireAdmin();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "app";
  const maxLines = Math.min(2000, Math.max(50, Number(searchParams.get("lines") || 500)));
  const filter = searchParams.get("filter") || undefined;

  if (!["app", "error"].includes(type)) {
    return NextResponse.json({ error: "invalid log type" }, { status: 400 });
  }

  const logPath = getLogPath(type);
  if (!logPath) {
    return NextResponse.json({ error: "log path not configured" }, { status: 400 });
  }

  try {
    const result = await readLastLines(logPath, maxLines, filter);

    // Sistem bilgileri
    const uptime = process.uptime();
    const memUsage = process.memoryUsage();
    const cpus = os.cpus();
    const loadAvg = os.loadavg();

    return NextResponse.json({
      type,
      path: logPath,
      ...result,
      system: {
        nodeVersion: process.version,
        platform: os.platform(),
        arch: os.arch(),
        hostname: os.hostname(),
        uptime: Math.floor(uptime),
        loadAvg: loadAvg.map((l) => l.toFixed(2)),
        totalMem: os.totalmem(),
        freeMem: os.freemem(),
        heapUsed: memUsage.heapUsed,
        heapTotal: memUsage.heapTotal,
        rss: memUsage.rss,
        cpuCores: cpus.length,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "log read error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// DELETE /api/admin/logs?type=app|error  (log dosyasını temizle)
export async function DELETE(req: NextRequest) {
  const u = await requireAdmin();
  if (!u) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type") || "app";

  if (!["app", "error"].includes(type)) {
    return NextResponse.json({ error: "invalid log type" }, { status: 400 });
  }

  const logPath = getLogPath(type);

  try {
    const { writeFile } = await import("fs/promises");
    await writeFile(logPath, "");
    return NextResponse.json({ ok: true, message: `${type} log temizlendi` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "log clear error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
