"use client";

import { useState } from "react";
import useSWR from "swr";
import AdminGuard from "@/components/AdminGuard";
import { jfetch } from "@/lib/fetcher";
import { AUDIT_ACTIONS } from "@/lib/audit";

type Entry = { id: string; actorEmail: string | null; action: keyof typeof AUDIT_ACTIONS; targetId: string | null; createdAt: string };
type Result = { items: Entry[]; total: number; page: number; totalPages: number };

export default function AuditPage() {
  return <AdminGuard allow={["ADMIN"]}><AuditList /></AdminGuard>;
}

function AuditList() {
  const [page, setPage] = useState(1);
  const [action, setAction] = useState("");
  const { data, error, isLoading } = useSWR<Result>(`/api/admin/audit?page=${page}${action ? `&action=${action}` : ""}`, jfetch);
  return <div className="space-y-5">
    <h1 className="text-2xl font-bold text-white">İşlem geçmişi</h1>
    <p className="text-sm text-slate-400">Hesap işlemleri ve giriş denemeleri. Şifreler ve oturum anahtarları kaydedilmez.</p>
    <select aria-label="İşlem filtresi" value={action} onChange={(event) => { setAction(event.target.value); setPage(1); }} className="max-w-full rounded-lg bg-slate-900 px-3 py-2 text-white">
      <option value="">Tüm işlemler</option>
      {Object.entries(AUDIT_ACTIONS).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
    </select>
    {error && <p role="alert" className="text-red-300">{error instanceof Error ? error.message : "Geçmiş okunamadı."}</p>}
    {isLoading ? <p className="text-slate-400">Yükleniyor…</p> : <div className="divide-y divide-white/10 rounded-xl border border-white/10">
      {data?.items.length ? data.items.map((item) => <div key={item.id} className="space-y-1 p-4 text-sm">
        <div className="flex flex-wrap justify-between gap-2 text-white"><span>{AUDIT_ACTIONS[item.action] || item.action}</span><time className="text-slate-400">{new Date(item.createdAt).toLocaleString("tr-TR")}</time></div>
        <p className="break-all text-slate-300">{item.actorEmail || "Giriş denemesi"}</p>
        {item.targetId && <p className="break-all text-xs text-slate-500">Hedef hesap: {item.targetId}</p>}
      </div>) : <p className="p-4 text-slate-400">Kayıt bulunamadı.</p>}
    </div>}
    {data && <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
      <span>{data.total} kayıt · Sayfa {data.page} / {data.totalPages}</span>
      <div className="flex gap-2">
        <button disabled={page <= 1 || isLoading} onClick={() => setPage(page - 1)} className="rounded border border-white/10 px-3 py-2 disabled:opacity-40">Önceki</button>
        <button disabled={page >= data.totalPages || isLoading} onClick={() => setPage(page + 1)} className="rounded border border-white/10 px-3 py-2 disabled:opacity-40">Sonraki</button>
      </div>
    </div>}
  </div>;
}
