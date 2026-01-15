// app/admin/uploads/page.tsx
"use client";
import AdminGuard from "@/components/AdminGuard";
import { useState, useRef } from "react";
import { 
  CloudArrowUpIcon, 
  PhotoIcon, 
  ClipboardDocumentCheckIcon, 
  ClipboardDocumentIcon,
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon
} from "@heroicons/react/24/outline";

export default function UploadsPage() {
  return (
    <AdminGuard allow={["ADMIN", "EDITOR"]}>
      <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Başlık Bölümü */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Medya Yükleme</h1>
          <p className="text-slate-400 mt-1">
            Projelerinde kullanmak üzere görselleri buradan yükleyip linklerini alabilirsin.
          </p>
        </div>

        <Uploader />
      </div>
    </AdminGuard>
  );
}

function Uploader() {
  const [urls, setUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Kopyalama işlemi için geçici bildirim state'i
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return;

    setIsUploading(true);
    const promises = Array.from(files).map(async (f) => {
      const fd = new FormData();
      fd.append("file", f);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) throw new Error("Upload failed");
        const j = await res.json();
        return j.url;
      } catch (e) {
        console.error("Yükleme hatası:", e);
        return null;
      }
    });

    const results = await Promise.all(promises);
    // Başarılı olanları (null olmayanları) filtrele ve listeye ekle
    const successUrls = results.filter((url): url is string => url !== null);
    
    setUrls((prev) => [...successUrls, ...prev]);
    setIsUploading(false);
  }

  // Sürükle-Bırak olayları
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    onFiles(e.dataTransfer.files);
  };

  // URL Kopyalama Fonksiyonu
  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000); // 2 saniye sonra ikonu eski haline getir
  };

  return (
    <div className="space-y-8">
      
      {/* --- DROP ZONE --- */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative group flex flex-col items-center justify-center p-12 border-2 border-dashed rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden
          ${isDragging 
            ? "border-sky-500 bg-sky-500/10 scale-[1.01]" 
            : "border-slate-700 bg-slate-900/50 hover:border-sky-400/50 hover:bg-slate-800/50"
          }
        `}
      >
        <input 
          ref={fileInputRef}
          onChange={(e) => onFiles(e.target.files)} 
          type="file" 
          accept="image/*" 
          multiple 
          className="hidden" 
        />
        
        {/* İkon ve Metin */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-4">
          <div className={`p-4 rounded-full transition-colors duration-300 ${isDragging ? 'bg-sky-500 text-white' : 'bg-slate-800 text-sky-400 group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white'}`}>
             {isUploading ? (
               <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
             ) : (
               <CloudArrowUpIcon className="w-8 h-8" />
             )}
          </div>
          <div>
            <p className="text-lg font-medium text-slate-200">
              {isUploading ? "Yükleniyor..." : "Görselleri buraya sürükle"}
            </p>
            <p className="text-sm text-slate-500 mt-1">
              veya dosya seçmek için <span className="text-sky-400 hover:underline">tıkla</span>
            </p>
          </div>
        </div>

        {/* Arkaplan Efekti */}
        <div className="absolute inset-0 bg-gradient-to-tr from-sky-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* --- GALERİ GRID --- */}
      {urls.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <PhotoIcon className="w-4 h-4" />
            <span>Son Yüklenenler</span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {urls.map((u, i) => (
              <div 
                key={i} 
                className="group relative aspect-square rounded-xl bg-slate-900 border border-white/10 overflow-hidden shadow-lg transition hover:shadow-sky-500/10"
              >
                {/* Görsel */}
                <img 
                  src={u} 
                  alt="Uploaded" 
                  className="w-full h-full object-cover transition duration-500 group-hover:scale-110" 
                />
                
                {/* Overlay (Hover'da açılan menü) */}
                <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-3">
                  
                  {/* Kopyala Butonu */}
                  <button
                    onClick={() => copyToClipboard(u)}
                    className="flex items-center gap-2 px-4 py-2 bg-white text-slate-900 rounded-lg font-medium hover:bg-sky-50 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300"
                  >
                    {copiedUrl === u ? (
                      <>
                        <CheckCircleIcon className="w-5 h-5 text-emerald-600" />
                        <span>Kopyalandı</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="w-5 h-5" />
                        <span>URL Kopyala</span>
                      </>
                    )}
                  </button>

                  {/* Yeni Sekmede Aç */}
                  <a 
                    href={u} 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-white/70 hover:text-white text-xs flex items-center gap-1 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 delay-75"
                  >
                    <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                    Yeni sekmede aç
                  </a>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}