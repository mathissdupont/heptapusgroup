// app/admin/gallery/page.tsx
"use client";

import useSWR from "swr";
import { useEffect, useMemo, useRef, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { jfetch } from "@/lib/fetcher";
import {
  CloudArrowUpIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  LinkIcon,
  EyeIcon,
  XMarkIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  PhotoIcon,
  VideoCameraIcon,
  ArrowPathIcon
} from "@heroicons/react/24/outline";

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
    <AdminGuard allow={["ADMIN", "EDITOR"]}>
      <GalleryInner />
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

  // Upload & Drag State
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement | null>(null);

  // UI Feedback State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const maxPage = Math.max(1, Math.ceil(total / pageSize));

  useEffect(() => { setPage(1) }, [q, type]);

  async function onDropFiles(files: FileList | null) {
    if (!files?.length) return;
    setIsDragging(false);
    
    const fd = new FormData();
    Array.from(files).forEach((f) => fd.append("files", f));

    setUploading(true);
    try {
      const res = await fetch("/api/media", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || res.statusText);
      }

      setPage(1);
      mutate();
    } catch (e: any) {
      alert(e.message || "Yükleme başarısız");
    } finally {
      setUploading(false);
    }
  }

  async function onDelete(m: Media) {
    if (!confirm(`"${m.name}" dosyasını silmek istediğine emin misin?`)) return;
    try {
      await jfetch(`/api/media/${m.id}`, { method: "DELETE" });
      mutate();
      if (previewIndex !== null) setPreviewIndex(null); // Eğer açık olanı siliyorsak kapat
    } catch (e: any) {
      alert(e.message || "Silme başarısız");
    }
  }

  function copyUrl(m: Media) {
    const fullUrl = location.origin + m.url;
    navigator.clipboard.writeText(fullUrl);
    setCopiedId(m.id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  // --- Popup / Lightbox Logic ---
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const preview = previewIndex !== null ? items[previewIndex] : null;

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!preview) return;
      if (e.key === "Escape") setPreviewIndex(null);
      if (e.key === "ArrowRight") setPreviewIndex((i) => (i !== null ? Math.min(i + 1, items.length - 1) : i));
      if (e.key === "ArrowLeft") setPreviewIndex((i) => (i !== null ? Math.max(i - 1, 0) : i));
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [preview, items.length]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Medya Galeri</h1>
          <p className="text-slate-400 mt-1">
            Toplam <span className="text-sky-400 font-semibold">{total}</span> medya dosyası bulundu.
          </p>
        </div>
      </div>

      {/* --- Upload Area --- */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
        onDrop={(e) => { e.preventDefault(); onDropFiles(e.dataTransfer?.files || null); }}
        onClick={() => fileRef.current?.click()}
        className={`relative group flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden
          ${isDragging 
            ? "border-sky-500 bg-sky-500/10 scale-[1.01]" 
            : "border-slate-700 bg-slate-900/50 hover:border-sky-400/50 hover:bg-slate-800/50"
          }
        `}
      >
        <div className="relative z-10 flex flex-col items-center gap-3">
            <div className={`p-4 rounded-full transition-colors duration-300 ${isDragging ? 'bg-sky-500 text-white' : 'bg-slate-800 text-sky-400 group-hover:bg-sky-500 group-hover:text-white'}`}>
                {uploading ? (
                   <ArrowPathIcon className="w-8 h-8 animate-spin" />
                ) : (
                   <CloudArrowUpIcon className="w-8 h-8" />
                )}
            </div>
            <div className="text-center">
                <p className="text-lg font-medium text-slate-200">
                    {uploading ? "Dosyalar Yükleniyor..." : "Dosyaları buraya sürükle"}
                </p>
                <p className="text-sm text-slate-500 mt-1">
                    veya seçmek için <span className="text-sky-400 hover:underline">tıkla</span>
                </p>
            </div>
        </div>
        <input ref={fileRef} multiple type="file" className="hidden" onChange={(e) => onDropFiles(e.target.files)} />
      </div>

      {/* --- Filters --- */}
      <div className="flex flex-wrap gap-3 bg-slate-900/50 p-2 rounded-xl border border-white/5">
        <div className="relative flex-1 min-w-[200px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <MagnifyingGlassIcon className="w-5 h-5" />
          </div>
          <input
            value={q} onChange={(e) => setQ(e.target.value)}
            placeholder="Dosya ara..."
            className="pl-10 px-4 py-2.5 bg-transparent text-slate-200 placeholder:text-slate-500 w-full rounded-lg focus:bg-white/5 outline-none transition"
          />
        </div>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <FunnelIcon className="w-5 h-5" />
          </div>
          <select
            value={type}
            onChange={(e) => setType(e.target.value as any)}
            className="pl-10 pr-8 py-2.5 bg-slate-800 border border-white/10 text-slate-200 rounded-lg focus:border-sky-500 outline-none appearance-none cursor-pointer hover:bg-slate-700 transition"
          >
            <option value="">Tümü</option>
            <option value="image">Resimler</option>
            <option value="video">Videolar</option>
          </select>
        </div>
      </div>

      {/* --- Status --- */}
      {error && <div className="p-4 rounded-lg bg-rose-500/10 text-rose-400">Yüklenemedi: {String((error as any)?.message || error)}</div>}
      {isLoading && !data && (
         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {[...Array(10)].map((_,i) => <div key={i} className="aspect-square rounded-xl bg-slate-800 animate-pulse" />)}
         </div>
      )}

      {/* --- Grid --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {items.map((m, idx) => (
          <div
            key={m.id}
            className="group relative aspect-square rounded-xl bg-slate-900 border border-white/10 overflow-hidden hover:shadow-xl hover:shadow-black/50 hover:border-sky-500/30 transition-all duration-300"
          >
            {/* Thumbnail */}
            <div className="w-full h-full flex items-center justify-center bg-slate-950">
              {m.mime.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={m.url}
                  alt={m.name}
                  loading="lazy"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
              ) : (
                <div className="text-center p-4">
                  <VideoCameraIcon className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <div className="text-[10px] text-slate-500 break-all line-clamp-2">{m.name}</div>
                </div>
              )}
            </div>

            {/* Overlay Actions */}
            <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3">
               <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPreviewIndex(idx)}
                    title="Önizle"
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition transform hover:scale-110"
                  >
                    <EyeIcon className="w-5 h-5" />
                  </button>
                  
                  <button
                    onClick={() => copyUrl(m)}
                    title="URL Kopyala"
                    className="p-2 rounded-full bg-white/10 hover:bg-sky-500/20 hover:text-sky-400 text-white transition transform hover:scale-110 relative"
                  >
                    {copiedId === m.id ? (
                        <CheckCircleIcon className="w-5 h-5 text-emerald-400" />
                    ) : (
                        <LinkIcon className="w-5 h-5" />
                    )}
                  </button>
               </div>
               
               <button
                  onClick={() => onDelete(m)}
                  title="Sil"
                  className="px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium hover:bg-rose-500 hover:text-white transition"
               >
                  Sil
               </button>

               <div className="absolute bottom-2 left-0 right-0 text-center px-2">
                 <span className="text-[10px] text-slate-400">{(m.size/1024).toFixed(0)} KB</span>
               </div>
            </div>
          </div>
        ))}
      </div>

      {items.length === 0 && !isLoading && (
        <div className="text-center py-20 text-slate-500">
           <PhotoIcon className="w-12 h-12 mx-auto mb-3 opacity-30" />
           <p>Dosya bulunamadı.</p>
        </div>
      )}

      {/* --- Pagination --- */}
      {maxPage > 1 && (
        <div className="flex items-center justify-center gap-4 mt-8">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 transition"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <span className="text-sm font-mono text-slate-400">
             {page} / {maxPage}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(maxPage, p + 1))}
            disabled={page >= maxPage}
            className="p-2 rounded-lg border border-white/10 hover:bg-white/5 disabled:opacity-30 transition"
          >
            <ChevronRightIcon className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* --- Lightbox Modal --- */}
      {preview && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex flex-col animate-in fade-in duration-200"
          onClick={() => setPreviewIndex(null)}
        >
          {/* Toolbar */}
          <div className="flex items-center justify-between p-4 z-50">
             <div className="text-white font-medium truncate max-w-md">
                {preview.name}
             </div>
             <button onClick={() => setPreviewIndex(null)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
                <XMarkIcon className="w-6 h-6" />
             </button>
          </div>

          {/* Main Content */}
          <div className="flex-1 relative flex items-center justify-center p-4 overflow-hidden">
             
             {/* Nav Prev */}
             {previewIndex! > 0 && (
                <button
                   onClick={(e) => { e.stopPropagation(); setPreviewIndex(i => i! - 1); }}
                   className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-10"
                >
                   <ChevronLeftIcon className="w-6 h-6" />
                </button>
             )}

             {/* Image/Video */}
             <div className="relative max-w-full max-h-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                {preview.mime.startsWith("image/") ? (
                   // eslint-disable-next-line @next/next/no-img-element
                   <img src={preview.url} alt={preview.name} className="max-h-[80vh] max-w-full object-contain rounded-lg" />
                ) : (
                   <video src={preview.url} controls autoPlay className="max-h-[80vh] max-w-full rounded-lg" />
                )}
             </div>

             {/* Nav Next */}
             {previewIndex! < items.length - 1 && (
                <button
                   onClick={(e) => { e.stopPropagation(); setPreviewIndex(i => i! + 1); }}
                   className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition z-10"
                >
                   <ChevronRightIcon className="w-6 h-6" />
                </button>
             )}
          </div>

          {/* Footer Info */}
          <div className="p-4 bg-black/50 text-center text-xs text-slate-400">
             {preview.mime} • {(preview.size / 1024).toFixed(2)} KB • {new Date(preview.createdAt).toLocaleString("tr-TR")}
          </div>
        </div>
      )}
    </div>
  );
}