// app/admin/projects/page.tsx
"use client";

import useSWR from "swr";
import { jfetch } from "@/lib/fetcher";
import AdminGuard from "@/components/AdminGuard";
import { useConfirm } from "@/components/ui/Confirm";
import type { Project as BaseProject } from "@/types/project";
import { useMemo, useState } from "react";
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  FunnelIcon, 
  PencilSquareIcon, 
  TrashIcon, 
  XMarkIcon,
  PhotoIcon,
  TagIcon,
  CommandLineIcon,
  CheckCircleIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

/* -------------------- Types -------------------- */

type Project = BaseProject & { content?: string | null };
type ListRes = { items: Project[]; total?: number } | Project[];

/* -------------------- Page -------------------- */

export default function ProjectsAdmin() {
  return (
    <AdminGuard allow={["ADMIN", "EDITOR"]}>
      <ProjectsInner />
    </AdminGuard>
  );
}

/* -------------------- Inner -------------------- */

function ProjectsInner() {
  const { data, error, mutate } = useSWR<ListRes>("/api/projects", jfetch);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "LIVE" | "UAT" | "DRAFT">("");

  const { Modal, ask, set: setConfirm } = useConfirm();
  const [edit, setEdit] = useState<Project | null>(null);

  const items = useMemo(() => {
    const list: Project[] = Array.isArray(data)
      ? (data as Project[])
      : ((data as any)?.items ?? []);
    return list.filter(
      (p) =>
        (!q ||
          `${p.title} ${p.summary} ${p.slug}`.toLowerCase().includes(q.toLowerCase())) &&
        (!status || p.status === status)
    );
  }, [data, q, status]);

  async function onDelete(p: Project) {
    setConfirm((s) => ({
      ...s,
      onYes: async () => {
        try {
          await jfetch(`/api/projects/${p.id}`, { method: "DELETE" });
          mutate();
        } catch (err: any) {
          alert(`Silme hatası: ${err.message || err}`);
        }
      },
    }));
    await ask(`"${p.title}" projesini silmek istediğine emin misin?`);
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {Modal}

      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Projeler</h1>
          <p className="text-slate-400 mt-1">
            Portfolyondaki tüm çalışmaları buradan yönetebilirsin.
          </p>
        </div>

        <button
          onClick={() => setEdit(EMPTY)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-medium shadow-lg shadow-sky-500/20 transition-all active:scale-95"
        >
          <PlusIcon className="w-5 h-5" />
          Yeni Proje
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 bg-slate-900/50 p-2 rounded-2xl border border-white/5">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </div>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Proje ara..."
            className="pl-10 px-4 py-2.5 bg-transparent text-slate-200 placeholder:text-slate-500 w-full rounded-xl focus:bg-white/5 outline-none transition"
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <FunnelIcon className="w-5 h-5" />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="pl-10 pr-8 py-2.5 bg-slate-800 border border-white/10 text-slate-200 rounded-xl focus:border-sky-500 outline-none appearance-none cursor-pointer hover:bg-slate-700 transition"
          >
            <option value="">Tüm Durumlar</option>
            <option value="LIVE">Yayında (LIVE)</option>
            <option value="UAT">Test (UAT)</option>
            <option value="DRAFT">Taslak (DRAFT)</option>
          </select>
        </div>
      </div>

      {/* Status/Error states */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-2">
          <XMarkIcon className="w-5 h-5" />
          Projeler yüklenemedi: {String((error as any)?.message || error)}
        </div>
      )}
      {!data && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
           {[1,2,3].map(i => <div key={i} className="h-64 rounded-2xl bg-slate-800/50 animate-pulse" />)}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items?.map((p) => (
          <div
            key={p.id}
            className="group relative flex flex-col bg-slate-900 border border-white/10 rounded-2xl overflow-hidden hover:border-sky-500/30 hover:shadow-2xl hover:shadow-sky-500/10 transition-all duration-300"
          >
            {/* Image Area */}
            <div className="relative h-48 bg-slate-800 overflow-hidden">
              {p.imageUrl ? (
                <img
                  src={p.imageUrl}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={p.title}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-slate-600">
                  <PhotoIcon className="w-12 h-12" />
                </div>
              )}
              <div className="absolute top-3 right-3">
                 <StatusTag status={p.status} />
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 p-5 space-y-3">
              <div>
                <h3 className="font-bold text-lg text-slate-100 group-hover:text-sky-400 transition-colors">
                  {p.title}
                </h3>
                <p className="text-xs text-slate-500 font-mono mt-0.5">{p.slug}</p>
              </div>
              
              <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
                {p.summary}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-2">
                {p.tags?.slice(0, 3).map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-[10px] font-medium bg-white/5 text-slate-300 rounded border border-white/5"
                  >
                    {t}
                  </span>
                ))}
                {(p.tags?.length || 0) > 3 && (
                   <span className="px-2 py-0.5 text-[10px] text-slate-500">+{p.tags!.length - 3}</span>
                )}
              </div>
            </div>

            {/* Action Footer */}
            <div className="p-4 border-t border-white/5 bg-slate-950/30 flex justify-between items-center">
               <span className="text-xs text-slate-500">
                  {new Date(p.createdAt || Date.now()).toLocaleDateString("tr-TR")}
               </span>
               <div className="flex gap-2">
                 <button
                    onClick={() => setEdit(p)}
                    className="p-2 rounded-lg text-slate-400 hover:text-sky-400 hover:bg-sky-400/10 transition"
                    title="Düzenle"
                 >
                    <PencilSquareIcon className="w-5 h-5" />
                 </button>
                 <button
                    onClick={() => onDelete(p)}
                    className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-400/10 transition"
                    title="Sil"
                 >
                    <TrashIcon className="w-5 h-5" />
                 </button>
               </div>
            </div>
          </div>
        ))}
      </div>
      
      {items?.length === 0 && data && (
        <div className="text-center py-20 bg-slate-900/50 rounded-2xl border border-dashed border-white/10">
          <div className="inline-flex p-4 rounded-full bg-slate-800 text-slate-500 mb-4">
             <MagnifyingGlassIcon className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-medium text-white">Sonuç bulunamadı</h3>
          <p className="text-slate-400 text-sm mt-1">Arama kriterlerini değiştirip tekrar dene.</p>
        </div>
      )}

      {edit && (
        <ProjectForm
          initial={edit}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            mutate();
          }}
        />
      )}
    </div>
  );
}

/* -------------------- Status Tag -------------------- */

function StatusTag({ status }: { status: string }) {
  const styles: Record<string, string> = {
    LIVE: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10",
    UAT: "bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-amber-500/10",
    DRAFT: "bg-slate-600/30 text-slate-300 border-slate-500/30",
  };
  return (
    <span
      className={`px-2.5 py-1 text-[10px] font-bold tracking-wide rounded-full border shadow-lg backdrop-blur-sm ${styles[status] || styles.DRAFT}`}
    >
      {status}
    </span>
  );
}

/* -------------------- Form -------------------- */

const EMPTY: Project = {
  id: "",
  title: "",
  slug: "",
  summary: "",
  imageUrl: "",
  status: "DRAFT",
  tags: [],
  createdAt: "",
  updatedAt: "",
  content: "",
};

function ProjectForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Project;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [data, setData] = useState<Project>(initial);
  const [isSaving, setIsSaving] = useState(false);
  const isNew = !initial.id;

  async function save() {
    setIsSaving(true);
    const payload = {
      title: (data.title || "").trim(),
      slug: (data.slug || "").trim(),
      summary: data.summary || "",
      imageUrl: data.imageUrl || null,
      status: data.status,
      tags: (data.tags || []).map(String),
      content: data.content || null,
    };

    try {
      const url = isNew ? "/api/projects" : `/api/projects/${data.id}`;
      const method = isNew ? "POST" : "PUT";
      
      await jfetch(url, {
        method,
        body: JSON.stringify(payload),
      });

      onSaved();
    } catch (err: any) {
      alert(`Kaydetme hatası: ${err.message || err}`);
    } finally {
        setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col bg-slate-900 border border-white/10 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 bg-slate-900 z-10 rounded-t-2xl">
           <div>
             <h2 className="text-xl font-bold text-white">
                {isNew ? "Yeni Proje Oluştur" : "Projeyi Düzenle"}
             </h2>
             <p className="text-sm text-slate-400 mt-1">Proje detaylarını ve içeriğini buradan yönetebilirsin.</p>
           </div>
           <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition">
             <XMarkIcon className="w-6 h-6" />
           </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Main Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-400">Proje Başlığı</label>
                <input
                    value={data.title}
                    onChange={(e) => setData({ ...data, title: e.target.value })}
                    placeholder="Örn: E-Ticaret Platformu"
                    className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition"
                />
            </div>
            <div className="space-y-4">
                <label className="block text-sm font-medium text-slate-400">Slug (URL)</label>
                <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-600">
                      <span className="text-xs">/projects/</span>
                   </div>
                   <input
                        value={data.slug}
                        onChange={(e) =>
                        setData({
                            ...data,
                            slug: e.target.value.replace(/\s+/g, "-").toLowerCase(),
                        })
                        }
                        placeholder="e-ticaret-platformu"
                        className="w-full pl-16 px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none transition font-mono text-sm"
                    />
                </div>
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
             <label className="block text-sm font-medium text-slate-400">Özet (Meta & Liste görünümü)</label>
             <textarea
                value={data.summary}
                onChange={(e) => setData({ ...data, summary: e.target.value })}
                placeholder="Proje hakkında kısa bir açıklama..."
                rows={3}
                className="w-full px-4 py-2.5 bg-slate-950 border border-white/10 rounded-xl focus:border-sky-500 outline-none transition resize-none"
              />
          </div>

          {/* Media & Status */}
          <div className="p-4 rounded-xl bg-slate-800/30 border border-white/5 space-y-4">
             <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <PhotoIcon className="w-4 h-4 text-sky-400" />
                Medya ve Durum
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                   <label className="block text-xs text-slate-400 mb-1.5">Kapak Görseli URL</label>
                   <input
                        value={data.imageUrl || ""}
                        onChange={(e) => setData({ ...data, imageUrl: e.target.value })}
                        placeholder="https://..."
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm focus:border-sky-500 outline-none"
                    />
                </div>
                <div>
                   <label className="block text-xs text-slate-400 mb-1.5">Yayın Durumu</label>
                   <select
                        value={data.status}
                        onChange={(e) =>
                        setData({ ...data, status: e.target.value as any })
                        }
                        className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm focus:border-sky-500 outline-none"
                    >
                        <option value="LIVE">🟢 Yayında (LIVE)</option>
                        <option value="UAT">🟡 Test (UAT)</option>
                        <option value="DRAFT">⚪ Taslak (DRAFT)</option>
                    </select>
                </div>
             </div>
             
             {/* Tags */}
             <div>
                <label className="block text-xs text-slate-400 mb-1.5 flex items-center gap-1">
                    <TagIcon className="w-3 h-3" /> Etiketler
                </label>
                <input
                    value={(data.tags || []).join(", ")}
                    onChange={(e) =>
                    setData({
                        ...data,
                        tags: e.target.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean),
                    })
                    }
                    placeholder="React, Next.js, Tailwind (Virgülle ayır)"
                    className="w-full px-3 py-2 bg-slate-950 border border-white/10 rounded-lg text-sm focus:border-sky-500 outline-none"
                />
             </div>
          </div>

          {/* Markdown Editor */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-400 flex items-center gap-2">
                <CommandLineIcon className="w-4 h-4 text-indigo-400" />
                İçerik (Markdown)
            </label>
            <div className="relative">
                <textarea
                    value={data.content || ""}
                    onChange={(e) => setData({ ...data, content: e.target.value })}
                    placeholder="# Proje Detayları..."
                    rows={12}
                    className="w-full px-4 py-4 bg-slate-950 border border-white/10 rounded-xl font-mono text-sm leading-relaxed text-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition"
                />
            </div>
            <p className="text-xs text-slate-500 text-right">Markdown formatı desteklenir.</p>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-white/5 bg-slate-900 rounded-b-2xl flex justify-end gap-3 z-10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-white/10 text-slate-300 hover:bg-white/5 transition font-medium"
            disabled={isSaving}
          >
            İptal
          </button>
          <button
            onClick={save}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-600/20 transition disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSaving ? (
                <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Kaydediliyor...</span>
                </>
            ) : (
                <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>{isNew ? "Projeyi Oluştur" : "Güncelle"}</span>
                </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}