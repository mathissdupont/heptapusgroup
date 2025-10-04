"use client";

import useSWR from "swr";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { jfetch } from "@/lib/fetcher";

type Media = {
  id: string;
  url: string;
  name: string;
  mime: string;
  size: number;
  width?: number | null;
  height?: number | null;
  createdAt: string;
};

type ListRes = { items: Media[]; total: number; page: number; pageSize: number };

export default function GalleryAdminPage() {
  return (
    <AdminGuard allow={["ADMIN","EDITOR"]}>
      <GalleryInner/>
    </AdminGuard>
  );
}

function GalleryInner() {
  const [q, setQ] = useState("");
  const [type, setType] = useState<"" | "image" | "video">("");
  const [page, setPage] = useState(1);
  const pageSize = 30;

  const key = useMemo(
    () => `/api/media?page=${page}&pageSize=${pageSize}&q=${encodeURIComponent(q)}&type=${type}`,
    [q, type, page]
  );
  const { data, error, mutate, isLoading } = useSWR<ListRes>(key, jfetch);

  // upload state
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => { setPage(1) }, [q, type]);

  async function onDropFiles(files: FileList | null) {
    if (!files?.length) return;
    const fd = new FormData();
    Array.from(files).forEach(f => fd.append("files", f));

    setUploading(true);
    try {
      await fetch("/api/media", {
        method: "POST",
        body: fd,
        headers: { "x-admin-key": localStorage.getItem("ADMIN_KEY") || "" },
      }).then(async r => {
        if (!r.ok) throw new Error((await r.json().catch(()=>({})))?.error || r.statusText);
      });
      setPage(1);
      mutate();
    } catch (e:any) {
      alert(e.message || "upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(m: Media) {
    if (!confirm(`Silinsin mi?\n${m.name}`)) return;
    try {
      await jfetch(`/api/media/${m.id}`, { method: "DELETE" });
      mutate();
    } catch (e:any) {
      alert(e.message || "delete failed");
    }
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(location.origin + url);
  }

  // Popup state
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);

  const preview = previewIndex !== null ? items[previewIndex] : null;

  // Keyboard navigation (ESC, arrows)
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!preview) return;
      if (e.key === "Escape") setPreviewIndex(null);
      if (e.key === "ArrowRight") setPreviewIndex(i => (i !== null ? Math.min(i+1, items.length-1) : i));
      if (e.key === "ArrowLeft") setPreviewIndex(i => (i !== null ? Math.max(i-1, 0) : i));
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [preview, items.length]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <h1 className="text-2xl font-bold mb-2 border-b border-white/10 pb-2 sticky top-0 bg-slate-950/80 backdrop-blur z-10">
        Galeri
      </h1>

      {/* Upload area */}
      <div
        onDragOver={(e)=>{e.preventDefault();}}
        onDrop={(e)=>{e.preventDefault(); onDropFiles(e.dataTransfer?.files || null);}}
        className="border-2 border-dashed border-sky-500/40 rounded-xl p-8 bg-slate-900/40 text-center hover:bg-slate-900/60 transition cursor-pointer"
      >
        <div className="text-sky-300 font-medium">Dosya yüklemek için sürükle bırak</div>
        <div className="opacity-60 mt-1 text-sm">veya</div>
        <button
          onClick={()=>fileRef.current?.click()}
          className="mt-3 px-4 py-2 rounded bg-sky-600 hover:bg-sky-500 text-white font-medium transition"
          disabled={uploading}
        >
          {uploading ? "Yükleniyor…" : "Dosya Seç"}
        </button>
        <input
          ref={fileRef}
          multiple
          type="file"
          className="hidden"
          onChange={(e)=>onDropFiles(e.target.files)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center p-3 border border-white/10 rounded-lg bg-slate-900/40">
        <input
          value={q} onChange={(e)=>setQ(e.target.value)}
          placeholder="Ara (isim, url, mime)…"
          className="px-3 py-2 bg-slate-950/60 border border-white/10 rounded-lg w-[260px] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
        />
        <select
          value={type}
          onChange={(e)=>setType(e.target.value as any)}
          className="px-3 py-2 bg-slate-950/60 border border-white/10 rounded-lg focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
        >
          <option value="">Tümü</option>
          <option value="image">Resimler</option>
          <option value="video">Videolar</option>
        </select>

        <div className="ml-auto text-sm opacity-70">{total} kayıt</div>
      </div>

      {/* Grid */}
      {error && <div className="text-rose-400">Yüklenemedi: {String((error as any)?.message || error)}</div>}
      {isLoading && <div className="text-slate-400">Yükleniyor…</div>}

      <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
        {items.map((m, idx) => (
          <article
            key={m.id}
            className="flex flex-col rounded-lg border border-white/10 overflow-hidden bg-slate-900/60 hover:shadow-lg hover:shadow-sky-500/10 transition"
          >
            <div
              className="aspect-square bg-slate-950/60 grid place-items-center cursor-pointer"
              onClick={()=>setPreviewIndex(idx)}
            >
              {m.mime.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.url}
                  alt={m.name}
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <div className="text-xs opacity-70 p-2 text-center break-all">
                  {m.mime}<br/>{m.name}
                </div>
              )}
            </div>
            <div className="p-3 text-xs space-y-2 flex flex-col flex-1">
              <div className="line-clamp-1 font-medium" title={m.name}>{m.name}</div>
              <div className="opacity-60">{(m.size/1024).toFixed(0)} KB</div>
              <div className="flex gap-2 mt-auto">
                <button
                  onClick={()=>copyUrl(m.url)}
                  className="px-2 py-1 rounded border border-white/10 hover:bg-white/10 transition"
                >
                  Kopyala
                </button>
                <a
                  href={m.url}
                  target="_blank"
                  className="px-2 py-1 rounded border border-white/10 hover:bg-white/10 transition"
                >
                  Aç
                </a>
                <button
                  onClick={()=>onDelete(m)}
                  className="px-2 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white ml-auto transition"
                >
                  Sil
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {/* Pagination */}
      {maxPage > 1 && (
        <div className="flex items-center gap-3 justify-center pt-4">
          <button
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-40 transition"
            disabled={page<=1}
            onClick={()=>setPage(p=>Math.max(1,p-1))}
          >‹ Önceki</button>
          <div className="text-sm opacity-70">Sayfa {page} / {maxPage}</div>
          <button
            className="px-3 py-1.5 rounded-lg border border-white/10 bg-slate-900/60 hover:bg-slate-800 disabled:opacity-40 transition"
            disabled={page>=maxPage}
            onClick={()=>setPage(p=>Math.min(maxPage,p+1))}
          >Sonraki ›</button>
        </div>
      )}

      {/* Popup Preview */}
      {preview && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={()=>setPreviewIndex(null)}
        >
          <div className="max-w-5xl max-h-[90vh] p-4 relative" onClick={e=>e.stopPropagation()}>
            {preview.mime.startsWith("image/") ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview.url} alt={preview.name} className="max-h-[80vh] max-w-full object-contain mx-auto"/>
            ) : (
              <video src={preview.url} controls className="max-h-[80vh] max-w-full mx-auto"/>
            )}
            <div className="mt-3 flex justify-between items-center text-slate-200 text-sm">
              <span>{preview.name}</span>
              <button
                onClick={()=>setPreviewIndex(null)}
                className="px-3 py-1 rounded bg-rose-600 hover:bg-rose-500 text-white"
              >
                Kapat (ESC)
              </button>
            </div>

            {/* Navigation buttons */}
            {previewIndex! > 0 && (
              <button
                onClick={()=>setPreviewIndex(i => (i !== null ? i-1 : i))}
                className="absolute left-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white"
              >
                ‹
              </button>
            )}
            {previewIndex! < items.length-1 && (
              <button
                onClick={()=>setPreviewIndex(i => (i !== null ? i+1 : i))}
                className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-white"
              >
                ›
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
