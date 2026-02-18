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
  ArrowPathIcon,
  VideoCameraIcon,
  LockClosedIcon,
  BuildingOffice2Icon,
  ChartBarIcon
} from "@heroicons/react/24/outline";

export default function SettingsPage() {
  const { data, mutate } = useSWR<{ items: { key: string; value: string | null }[] }>(
    "/api/admin/settings",
    jfetch
  );

  const [form, setForm] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Password change state
  const [pw, setPw] = useState({ current: "", next: "", confirm: "" });
  const [pwStatus, setPwStatus] = useState<"idle" | "saving" | "success" | "error">("idle");
  const [pwError, setPwError] = useState("");

  useEffect(() => {
    if (data?.items) {
      const obj: Record<string, string> = {};
      data.items.forEach((s) => (obj[s.key] = s.value || ""));
      setForm(obj);
    }
  }, [data]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (isSuccess) setIsSuccess(false);
  }

  async function save() {
    setIsSaving(true);
    try {
      await jfetch("/api/admin/settings", { method: "POST", body: JSON.stringify(form) });
      await mutate();
      setIsSuccess(true);
      setTimeout(() => setIsSuccess(false), 3000);
    } catch (error) {
      console.error("Kaydetme hatası", error);
      alert("Bir hata oluştu.");
    } finally {
      setIsSaving(false);
    }
  }

  async function changePassword() {
    setPwError("");
    if (!pw.current || !pw.next) {
      setPwError("Tüm alanları doldurun.");
      return;
    }
    if (pw.next.length < 6) {
      setPwError("Yeni şifre en az 6 karakter olmalı.");
      return;
    }
    if (pw.next !== pw.confirm) {
      setPwError("Yeni şifreler eşleşmiyor.");
      return;
    }
    setPwStatus("saving");
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: pw.current, newPassword: pw.next }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error === "wrong_password") setPwError("Mevcut şifre yanlış.");
        else setPwError(data.error || "Bir hata oluştu.");
        setPwStatus("error");
        return;
      }
      setPwStatus("success");
      setPw({ current: "", next: "", confirm: "" });
      setTimeout(() => setPwStatus("idle"), 3000);
    } catch {
      setPwError("Bağlantı hatası.");
      setPwStatus("error");
    }
  }

  return (
    <AdminGuard>
      <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
        
        {/* Başlık ve Üst Buton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Site Ayarları</h1>
            <p className="text-slate-400 mt-1">
              Sitenin genel bilgileri, medya ve sosyal medya bağlantılarını buradan yönetebilirsin.
            </p>
          </div>
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

          {/* --- YENİ BÖLÜM: Medya Ayarları --- */}
          <div className="space-y-6 rounded-2xl bg-slate-900/50 border border-white/5 p-6 h-fit lg:col-span-2">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <VideoCameraIcon className="w-5 h-5 text-rose-400" />
              Anasayfa Medya
            </h2>

            <div className="space-y-4">
              {/* Hero Video URL */}
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">Anasayfa Video URL</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 group-focus-within:text-rose-400 transition">
                    <VideoCameraIcon className="w-5 h-5" />
                  </div>
                  <input
                    name="heroVideoUrl" // Backend'e bu key ile gidecek
                    value={form.heroVideoUrl || ""}
                    onChange={handleChange}
                    placeholder="/media/hero.mp4 veya https://..."
                    className="pl-10 w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 text-slate-200 focus:border-rose-500 focus:ring-1 focus:ring-rose-500 transition outline-none"
                  />
                </div>
                <p className="text-xs text-slate-500 ml-1">
                  MP4 dosya yolu (public klasörü içindeyse <code>/media/...</code>) veya tam harici URL (YouTube değil). Boş bırakılırsa varsayılan video oynatılır.
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* --- İstatistikler --- */}
        <div className="space-y-6 rounded-2xl bg-slate-900/50 border border-white/5 p-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <ChartBarIcon className="w-5 h-5 text-emerald-400" />
            Anasayfa İstatistikler
          </h2>
          <p className="text-sm text-slate-400 -mt-3">
            Anasayfada gösterilen istatistik sayılarını buradan düzenleyebilirsin. Boş bırakılırsa varsayılan değerler kullanılır.
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { key: "stat_companies", label: "Alt Şirket", placeholder: "7" },
              { key: "stat_projects", label: "Proje", placeholder: "50" },
              { key: "stat_team", label: "Ekip Üyesi", placeholder: "30" },
              { key: "stat_years", label: "Yıllık Deneyim", placeholder: "5" },
            ].map((s) => (
              <div key={s.key} className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">{s.label}</label>
                <input
                  name={s.key}
                  type="number"
                  min="0"
                  value={form[s.key] || ""}
                  onChange={handleChange}
                  placeholder={s.placeholder}
                  className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-3 text-slate-200 text-center text-lg font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition outline-none"
                />
              </div>
            ))}
          </div>
        </div>

        {/* --- Şirket Logoları --- */}
        <div className="space-y-6 rounded-2xl bg-slate-900/50 border border-white/5 p-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <BuildingOffice2Icon className="w-5 h-5 text-cyan-400" />
            Şirket Logoları
          </h2>
          <p className="text-sm text-slate-400 -mt-3">
            Ekibimiz sayfasında görünen şirket logolarının URL&apos;lerini buradan düzenleyebilirsin.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { key: "logo_heptanet", label: "HeptaNet" },
              { key: "logo_heptaware", label: "HeptaWare" },
              { key: "logo_heptacore", label: "HeptaCore" },
              { key: "logo_heptadynamics", label: "HeptaDynamics" },
              { key: "logo_heptasense", label: "HeptaSense" },
              { key: "logo_heptaflux", label: "HeptaFlux" },
              { key: "logo_heptashield", label: "HeptaShield" },
            ].map((c) => (
              <div key={c.key} className="space-y-1">
                <label className="text-sm font-medium text-slate-400 ml-1">{c.label}</label>
                <div className="flex items-center gap-3">
                  {form[c.key] ? (
                    <img src={form[c.key]} alt={c.label} className="w-10 h-10 rounded-lg object-contain bg-slate-800 border border-white/10 shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-800 border border-white/10 flex items-center justify-center text-slate-600 shrink-0">
                      <BuildingOffice2Icon className="w-5 h-5" />
                    </div>
                  )}
                  <input
                    name={c.key}
                    value={form[c.key] || ""}
                    onChange={handleChange}
                    placeholder="https://... veya /uploads/..."
                    className="flex-1 bg-slate-950 border border-white/10 rounded-lg py-2 px-3 text-sm text-slate-200 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition outline-none"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* --- Şifre Değiştirme --- */}
        <div className="space-y-6 rounded-2xl bg-slate-900/50 border border-white/5 p-6">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <LockClosedIcon className="w-5 h-5 text-amber-400" />
            Şifre Değiştir
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-400 ml-1">Mevcut Şifre</label>
              <input
                type="password"
                value={pw.current}
                onChange={(e) => { setPw({ ...pw, current: e.target.value }); setPwError(""); }}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-3 text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-400 ml-1">Yeni Şifre</label>
              <input
                type="password"
                value={pw.next}
                onChange={(e) => { setPw({ ...pw, next: e.target.value }); setPwError(""); }}
                placeholder="En az 6 karakter"
                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-3 text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-400 ml-1">Yeni Şifre (Tekrar)</label>
              <input
                type="password"
                value={pw.confirm}
                onChange={(e) => { setPw({ ...pw, confirm: e.target.value }); setPwError(""); }}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-white/10 rounded-lg py-2.5 px-3 text-slate-200 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition outline-none"
              />
            </div>
          </div>

          {pwError && (
            <p className="text-red-400 text-sm">{pwError}</p>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={changePassword}
              disabled={pwStatus === "saving"}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium text-white transition-all shadow-lg
                ${pwStatus === "success"
                  ? "bg-emerald-600 shadow-emerald-500/20"
                  : "bg-amber-600 hover:bg-amber-500 shadow-amber-500/20"
                }
                ${pwStatus === "saving" ? "opacity-75 cursor-not-allowed" : ""}
              `}
            >
              {pwStatus === "saving" ? (
                <>
                  <ArrowPathIcon className="w-5 h-5 animate-spin" />
                  Değiştiriliyor...
                </>
              ) : pwStatus === "success" ? (
                <>
                  <CheckCircleIcon className="w-5 h-5" />
                  Şifre Güncellendi
                </>
              ) : (
                <>
                  <LockClosedIcon className="w-5 h-5" />
                  Şifreyi Değiştir
                </>
              )}
            </button>
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