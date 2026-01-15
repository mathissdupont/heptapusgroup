// app/admin/settings/page.tsx
"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { jfetch } from "@/lib/fetcher";
import AdminGuard from "@/components/AdminGuard";
import { 
  GlobeAltIcon, 
  DocumentTextIcon, 
  LinkIcon, 
  CodeBracketIcon, 
  BriefcaseIcon,
  CheckCircleIcon,
  ArrowPathIcon 
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const { data, mutate } = useSWR<{ items: { key: string; value: string | null }[] }>(
    "/api/admin/settings",
    jfetch
  );

  const [form, setForm] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (data?.items) {
      const obj: Record<string, string> = {};
      data.items.forEach((s) => (obj[s.key] = s.value || ""));
      setForm(obj);
    }
  }, [data]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Kullanıcı bir şey değiştirdiğinde başarı mesajını sıfırla
    if (isSuccess) setIsSuccess(false);
  }

  async function save() {
    setIsSaving(true);
    try {
      await jfetch("/api/admin/settings", { method: "POST", body: JSON.stringify(form) });
      await mutate();
      setIsSuccess(true);
      
      // 3 saniye sonra başarı mesajını kaldır
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Kaydetme hatası", error);
      alert("Bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Başlık */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Site Ayarları</h1>
            <p className="text-slate-400 mt-1">
              Sitenin genel meta bilgileri ve sosyal medya bağlantılarını buradan yönetebilirsin.
            </p>
          </div>
          
          {/* Kaydet Butonu (Header'da da olabilir, aşağıda da. Ben aşağıya form sonuna koydum ama burası da opsiyonel) */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* --- Bölüm 1: Genel Bilgiler --- */}
          <div className="space-y-6 rounded-2xl bg-slate-900/50 border border-white/5 p-6 h-fit">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <GlobeAltIcon className="w-5 h-5 text-sky-400" />
              Genel Bilgiler
            </h2>
            
            <div className="space-y-4">
              {/* Site Başlığı */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">Site Başlığı</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                    <span className="font-bold text-xs">H1</span>
                  </div>
                  <input
                    name="siteTitle"
                    value={form.siteTitle || ""}
                    onChange={handleChange}
                    placeholder="Örn: Heptapus Portfolio"
                    className="pl-10 w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition outline-none"
                  />
                </div>
              </div>

              {/* Meta Açıklama */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">Meta Açıklaması</label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none text-slate-500">
                    <DocumentTextIcon className="w-5 h-5" />
                  </div>
                  <textarea
                    name="description"
                    value={form.description || ""}
                    onChange={handleChange}
                    placeholder="Site hakkında kısa bir açıklama..."
                    rows={4}
                    className="pl-10 w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 text-slate-200 focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition outline-none resize-none"
                  />
                </div>
                <p className="text-xs text-slate-500 text-right">SEO için önemlidir.</p>
              </div>
            </div>
          </div>

          {/* --- Bölüm 2: Sosyal Medya --- */}
          <div className="space-y-6 rounded-2xl bg-slate-900/50 border border-white/5 p-6 h-fit">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <LinkIcon className="w-5 h-5 text-indigo-400" />
              Sosyal Bağlantılar
            </h2>

            <div className="space-y-4">
              
              {/* Twitter / X */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">Twitter (X)</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition">
                    <span className="font-bold text-lg">𝕏</span>
                  </div>
                  <input
                    name="twitter"
                    value={form.twitter || ""}
                    onChange={handleChange}
                    placeholder="https://x.com/kullanici"
                    className="pl-10 w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition outline-none"
                  />
                </div>
              </div>

              {/* GitHub */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">GitHub</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition">
                    <CodeBracketIcon className="w-5 h-5" />
                  </div>
                  <input
                    name="github"
                    value={form.github || ""}
                    onChange={handleChange}
                    placeholder="https://github.com/kullanici"
                    className="pl-10 w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition outline-none"
                  />
                </div>
              </div>

              {/* LinkedIn */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">LinkedIn</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-indigo-400 transition">
                    <BriefcaseIcon className="w-5 h-5" />
                  </div>
                  <input
                    name="linkedin"
                    value={form.linkedin || ""}
                    onChange={handleChange}
                    placeholder="https://linkedin.com/in/kullanici"
                    className="pl-10 w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 text-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition outline-none"
                  />
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* --- Action Bar --- */}
        <div className="flex items-center justify-end pt-4 border-t border-white/5">
           <div className="flex items-center gap-4">
              {isSuccess && (
                <span className="text-emerald-400 text-sm font-medium flex items-center gap-1 animate-in slide-in-from-right-2 fade-in">
                  <CheckCircleIcon className="w-5 h-5" />
                  Ayarlar güncellendi
                </span>
              )}
              
              <button
                onClick={save}
                disabled={isSaving}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-lg font-medium text-white transition-all shadow-lg
                  ${isSuccess 
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20" 
                    : "bg-sky-600 hover:bg-sky-500 shadow-sky-500/20"
                  }
                  ${isSaving ? "opacity-75 cursor-not-allowed" : ""}
                `}
              >
                {isSaving ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    <span>Kaydediliyor...</span>
                  </>
                ) : isSuccess ? (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    <span>Kaydedildi</span>
                  </>
                ) : (
                  <span>Değişiklikleri Kaydet</span>
                )}
              </button>
           </div>
        </div>

      </div>
    </AdminGuard>
  );
}