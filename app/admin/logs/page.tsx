// app/admin/logs/page.tsx
"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import AdminGuard from "@/components/AdminGuard";
import {
  CommandLineIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  TrashIcon,
  FunnelIcon,
  ArrowDownTrayIcon,
  ServerIcon,
  CpuChipIcon,
  ClockIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";

type LogType = "app" | "error";

interface SystemInfo {
  nodeVersion: string;
  platform: string;
  arch: string;
  hostname: string;
  uptime: number;
  loadAvg: string[];
  totalMem: number;
  freeMem: number;
  heapUsed: number;
  heapTotal: number;
  rss: number;
  cpuCores: number;
}

interface LogData {
  type: string;
  path: string;
  lines: string[];
  fileSize: number;
  lastModified: string;
  system: SystemInfo;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function formatUptime(seconds: number): string {
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}g ${h}s ${m}dk`;
  if (h > 0) return `${h}s ${m}dk`;
  return `${m}dk`;
}

function classifyLine(line: string): "error" | "warn" | "info" | "debug" {
  const lower = line.toLowerCase();
  if (lower.includes("error") || lower.includes("fatal") || lower.includes("unhandled") || lower.includes("exception")) return "error";
  if (lower.includes("warn")) return "warn";
  if (lower.includes("debug") || lower.includes("trace")) return "debug";
  return "info";
}

const levelColors: Record<string, string> = {
  error: "text-red-400",
  warn: "text-amber-400",
  info: "text-slate-300",
  debug: "text-slate-500",
};

const levelBadgeColors: Record<string, string> = {
  error: "bg-red-500/10 text-red-400 border-red-500/20",
  warn: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  info: "bg-sky-500/10 text-sky-400 border-sky-500/20",
  debug: "bg-slate-500/10 text-slate-500 border-slate-500/20",
};

export default function LogsPage() {
  const [logType, setLogType] = useState<LogType>("app");
  const [data, setData] = useState<LogData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState("");
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [maxLines, setMaxLines] = useState(500);
  const logEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setError(null);
      const params = new URLSearchParams({
        type: logType,
        lines: maxLines.toString(),
        ...(filter ? { filter } : {}),
      });
      const res = await fetch(`/api/admin/logs?${params}`, { cache: "no-store" });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json: LogData = await res.json();
      setData(json);

      if (autoScroll) {
        setTimeout(() => logEndRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Loglar yüklenemedi";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [logType, filter, maxLines, autoScroll]);

  useEffect(() => {
    setLoading(true);
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(fetchLogs, 5000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs]);

  const handleClear = async () => {
    if (!confirm(`${logType === "app" ? "Uygulama" : "Hata"} loglarını temizlemek istediğine emin misin?`)) return;
    try {
      const res = await fetch(`/api/admin/logs?type=${logType}`, { method: "DELETE" });
      if (res.ok) fetchLogs();
    } catch {}
  };

  const handleDownload = () => {
    if (!data?.lines.length) return;
    const content = data.lines.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${logType}-${new Date().toISOString().slice(0, 10)}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const sys = data?.system;
  const memUsedPct = sys ? Math.round(((sys.totalMem - sys.freeMem) / sys.totalMem) * 100) : 0;

  return (
    <AdminGuard>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white tracking-tight">Sunucu Logları</h1>
              {autoRefresh && (
                <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Canlı
                </div>
              )}
            </div>
            <p className="text-slate-400 text-sm">
              PM2 process log dosyalarını gerçek zamanlı izle ve yönet.
            </p>
          </div>
        </div>

        {/* Sistem Bilgileri */}
        {sys && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Uptime", value: formatUptime(sys.uptime), icon: ClockIcon, color: "text-emerald-400 bg-emerald-400/10" },
              { label: "CPU Yükü", value: `${sys.loadAvg[0]} (${sys.cpuCores} çekirdek)`, icon: CpuChipIcon, color: "text-sky-400 bg-sky-400/10" },
              { label: "RAM Kullanımı", value: `${formatBytes(sys.totalMem - sys.freeMem)} / ${formatBytes(sys.totalMem)} (%${memUsedPct})`, icon: ServerIcon, color: "text-purple-400 bg-purple-400/10" },
              { label: "Node.js", value: `${sys.nodeVersion} • ${sys.platform}/${sys.arch}`, icon: SignalIcon, color: "text-amber-400 bg-amber-400/10" },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-xl bg-slate-900/50 border border-white/5 p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`p-1.5 rounded-lg ${item.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs text-slate-500 font-medium">{item.label}</span>
                  </div>
                  <p className="text-sm font-semibold text-white truncate">{item.value}</p>
                </div>
              );
            })}
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Log Type Tabs */}
          <div className="flex rounded-xl bg-slate-900/80 border border-white/5 p-1">
            {([
              { type: "app" as LogType, label: "Uygulama", icon: CommandLineIcon },
              { type: "error" as LogType, label: "Hatalar", icon: ExclamationTriangleIcon },
            ]).map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.type}
                  onClick={() => setLogType(tab.type)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    logType === tab.type
                      ? "bg-sky-500 text-white shadow-lg shadow-sky-500/25"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Filtre */}
          <div className="relative flex-1 min-w-[200px] max-w-md">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Loglarda ara..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-white/5 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:border-sky-500/50 focus:ring-1 focus:ring-sky-500/25 outline-none transition"
            />
          </div>

          {/* Satır Sayısı */}
          <select
            value={maxLines}
            onChange={(e) => setMaxLines(Number(e.target.value))}
            className="bg-slate-900/80 border border-white/5 rounded-xl text-sm text-slate-300 px-3 py-2 outline-none focus:border-sky-500/50 cursor-pointer"
          >
            <option value={100}>100 satır</option>
            <option value={300}>300 satır</option>
            <option value={500}>500 satır</option>
            <option value={1000}>1000 satır</option>
            <option value={2000}>2000 satır</option>
          </select>

          {/* Aksiyonlar */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all border ${
                autoRefresh
                  ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                  : "bg-slate-900/80 border-white/5 text-slate-400 hover:text-white"
              }`}
            >
              <SignalIcon className="w-4 h-4" />
              <span className="hidden sm:inline">{autoRefresh ? "Canlı" : "Oto-yenile"}</span>
            </button>

            <button
              onClick={() => { setLoading(true); fetchLogs(); }}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-slate-900/80 border border-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-50"
            >
              <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Yenile</span>
            </button>

            <button
              onClick={handleDownload}
              disabled={!data?.lines.length}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-slate-900/80 border border-white/5 text-slate-400 hover:text-white transition-all disabled:opacity-50"
            >
              <ArrowDownTrayIcon className="w-4 h-4" />
              <span className="hidden sm:inline">İndir</span>
            </button>

            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all"
            >
              <TrashIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Temizle</span>
            </button>
          </div>
        </div>

        {/* Log Metadata */}
        {data && (
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
            <span>Dosya: <code className="text-slate-400">{data.path}</code></span>
            <span>Boyut: <span className="text-slate-400">{formatBytes(data.fileSize)}</span></span>
            {data.lastModified && (
              <span>Son değişiklik: <span className="text-slate-400">{new Date(data.lastModified).toLocaleString("tr-TR")}</span></span>
            )}
            <span>Gösterilen: <span className="text-slate-400">{data.lines.length} satır</span></span>
          </div>
        )}

        {/* Log Viewer */}
        <div className="rounded-2xl bg-[#0d1117] border border-white/5 overflow-hidden">
          {/* Terminal Header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-[#161b22] border-b border-white/5">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            </div>
            <span className="text-xs text-slate-500 ml-2 font-mono">
              {logType === "app" ? "stdout" : "stderr"} — {data?.path || "..."}
            </span>
          </div>

          {/* Log Content */}
          <div
            ref={containerRef}
            className="overflow-y-auto font-mono text-[13px] leading-relaxed max-h-[60vh] min-h-[300px]"
          >
            {error ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <ExclamationTriangleIcon className="w-12 h-12 text-amber-500/50 mb-3" />
                <p className="text-amber-400 font-medium mb-1">Log dosyası okunamadı</p>
                <p className="text-sm">{error}</p>
                <p className="text-xs mt-2 text-slate-600">
                  Sunucuda log dosyasının mevcut olduğundan emin olun.
                </p>
              </div>
            ) : loading && !data ? (
              <div className="flex items-center justify-center py-20 text-slate-500">
                <ArrowPathIcon className="w-6 h-6 animate-spin mr-3" />
                <span>Loglar yükleniyor...</span>
              </div>
            ) : data?.lines.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <CommandLineIcon className="w-12 h-12 text-slate-700 mb-3" />
                <p className="font-medium">Log dosyası boş</p>
                <p className="text-sm text-slate-600">Henüz log kaydı yok veya filtre sonuç döndürmedi.</p>
              </div>
            ) : (
              <table className="w-full border-spacing-0">
                <tbody>
                  {data?.lines.map((line, i) => {
                    const level = classifyLine(line);
                    return (
                      <tr
                        key={i}
                        className={`group hover:bg-white/[0.02] border-b border-white/[0.02] ${
                          level === "error" ? "bg-red-500/[0.03]" : ""
                        }`}
                      >
                        <td className="text-right text-slate-600 select-none px-3 py-0.5 w-12 align-top text-[12px] border-r border-white/5">
                          {i + 1}
                        </td>
                        <td className="px-1 py-0.5 w-12 align-top">
                          <span className={`inline-block text-[10px] px-1.5 py-0.5 rounded font-medium border ${levelBadgeColors[level]}`}>
                            {level === "error" ? "ERR" : level === "warn" ? "WRN" : level === "debug" ? "DBG" : "INF"}
                          </span>
                        </td>
                        <td className={`px-3 py-0.5 whitespace-pre-wrap break-all ${levelColors[level]}`}>
                          {line}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
            <div ref={logEndRef} />
          </div>
        </div>

        {/* Scroll to Bottom */}
        <div className="flex items-center justify-between text-xs text-slate-500">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={autoScroll}
              onChange={(e) => setAutoScroll(e.target.checked)}
              className="rounded border-slate-600 bg-slate-800 text-sky-500 focus:ring-sky-500/25"
            />
            Otomatik kaydır (yeni loglar geldiğinde)
          </label>
          <button
            onClick={() => logEndRef.current?.scrollIntoView({ behavior: "smooth" })}
            className="text-sky-400 hover:text-sky-300 transition"
          >
            En alta git ↓
          </button>
        </div>
      </div>
    </AdminGuard>
  );
}
