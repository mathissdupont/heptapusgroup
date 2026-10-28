"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import useSWR from "swr";
import { ArrowUp, ArrowDown, Plus, Trash2, ExternalLink } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";
import { jfetch } from "@/lib/fetcher";
import type { AboutContent, AboutLocaleContent, Statistic } from "@/lib/about-content";
import type { Locale } from "@/lib/get-dictionary";

const languages: { value: Locale; label: string }[] = [{ value: "tr", label: "Türkçe" }, { value: "en", label: "English" }, { value: "de", label: "Deutsch" }];
const inputClass = "mt-2 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2.5 text-sm text-white";

function OrderButtons({ index, count, move, remove }: { index: number; count: number; move: (target: number) => void; remove: () => void }) {
  return <div className="flex gap-1 shrink-0"><button type="button" className="division-editor-icon" disabled={!index} aria-label="Satırı yukarı taşı" onClick={() => move(index - 1)}><ArrowUp size={16} /></button><button type="button" className="division-editor-icon" disabled={index === count - 1} aria-label="Satırı aşağı taşı" onClick={() => move(index + 1)}><ArrowDown size={16} /></button><button type="button" className="division-editor-icon text-red-400" aria-label="Satırı kaldır" onClick={remove}><Trash2 size={16} /></button></div>;
}

function StatsEditor({ title, description, items, change }: { title: string; description: string; items: Statistic[]; change: (items: Statistic[]) => void }) {
  return <section className="rounded-xl border border-white/10 bg-slate-900/40 p-5 md:p-6 space-y-5">
    <div><h2 className="text-xl font-semibold text-white">{title}</h2><p className="text-sm text-slate-400 mt-2">{description}</p></div>
    {!items.length && <p className="text-sm text-slate-500">Bu bölüm gösterilmeyecek. İstatistik ekleyerek tekrar açabilirsiniz.</p>}
    {items.map((item, index) => <div key={index} className="flex flex-wrap items-end gap-4 border-t border-white/10 pt-4">
      <label className="text-sm flex-1 min-w-32">Değer<input required maxLength={40} className={inputClass} value={item.value} placeholder="7+, 2024, 24/7" onChange={event => change(items.map((row, i) => i === index ? { ...row, value: event.target.value } : row))} /></label>
      <label className="text-sm flex-[2] min-w-48">Başlık<input required maxLength={120} className={inputClass} value={item.label} placeholder="Örn. Aktif proje" onChange={event => change(items.map((row, i) => i === index ? { ...row, label: event.target.value } : row))} /></label>
      <OrderButtons index={index} count={items.length} move={target => { const next = [...items]; [next[index], next[target]] = [next[target], next[index]]; change(next); }} remove={() => change(items.filter((_, i) => i !== index))} />
    </div>)}
    <button type="button" className="division-editor-add" disabled={items.length >= 12} onClick={() => change([...items, { value: "", label: "" }])}><Plus size={16} />İstatistik ekle</button>
  </section>;
}

export default function AboutAdminPage() { return <AdminGuard><AboutEditor /></AdminGuard>; }

function AboutEditor() {
  const { data, error, isLoading, mutate } = useSWR<{ content: AboutContent }>("/api/admin/about", jfetch, { revalidateOnFocus: false });
  const [form, setForm] = useState<AboutContent | null>(null);
  const [locale, setLocale] = useState<Locale>("tr");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);
  useEffect(() => { if (data && !dirty) setForm(data.content); }, [data, dirty]);

  function change<K extends keyof AboutLocaleContent>(key: K, value: AboutLocaleContent[K]) {
    setForm(current => current ? { ...current, [locale]: { ...current[locale], [key]: value } } : current);
    setDirty(true); setMessage("");
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (!form || saving) return;
    setSaving(true); setMessage("");
    try {
      const response = await fetch("/api/admin/about", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form), credentials: "include" });
      const result = await response.json();
      if (!response.ok) {
        if (languages.some(language => language.value === result.locale)) setLocale(result.locale);
        throw new Error(result.error || "İçerik kaydedilemedi.");
      }
      await mutate({ content: result.content }, { revalidate: false });
      setForm(result.content); setDirty(false); setFailed(false);
      setMessage("Değişiklikler kaydedildi. Sayfa yenilendiğinde yeni içerikler gösterilir.");
    } catch (error) { setFailed(true); setMessage(error instanceof Error ? error.message : "İşlem tamamlanamadı."); }
    finally { setSaving(false); }
  }

  if (isLoading || (!form && !error)) return <p className="text-slate-400">İçerik yükleniyor…</p>;
  if (error || !form) return <div role="alert" className="text-red-300"><p>{error instanceof Error ? error.message : "İçerik yüklenemedi."}</p><button onClick={() => mutate()} className="underline mt-3">Tekrar dene</button></div>;
  const content = form[locale];

  return <div className="max-w-5xl mx-auto space-y-7 text-slate-200">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h1 className="text-2xl font-semibold text-white">Hakkımızda ve istatistikler</h1><p className="text-sm text-slate-400 mt-2">Yolculuğumuz bölümünü ve istatistik kartlarını yönetin. Kaydedilen içerikler için yeniden build gerekmez.</p></div><Link href="/about" target="_blank" className="division-editor-add">Sayfayı görüntüle<ExternalLink size={15} /></Link></div>
    <form onSubmit={save}>
      <fieldset disabled={saving} className="space-y-6">
        <div className="flex flex-wrap gap-2">{languages.map(language => <button key={language.value} type="button" aria-pressed={locale === language.value} onClick={() => setLocale(language.value)} className={`rounded-lg px-4 py-2 text-sm border ${locale === language.value ? "bg-[var(--brand-royal-violet)] text-white border-transparent" : "border-white/15 text-slate-400"}`}>{language.label}</button>)}</div>
        <p className="text-xs text-slate-500">Her dilin başlıkları ve satırları ayrı kaydedilir. Tüm dil sekmelerindeki değişiklikler birlikte kaydedilir.</p>
        <StatsEditor title="Hakkımızda istatistikleri" description="Kartın hem değerini hem başlığını değiştirebilir, sırasını düzenleyebilir veya kaldırabilirsiniz." items={content.stats} change={items => change("stats", items)} />
        <section className="rounded-xl border border-white/10 bg-slate-900/40 p-5 md:p-6 space-y-5">
          <h2 className="text-xl font-semibold text-white">Yolculuğumuz</h2>
          <label className="block text-sm">Bölüm başlığı<input required maxLength={160} className={inputClass} value={content.timelineTitle} onChange={event => change("timelineTitle", event.target.value)} /></label>
          {!content.timeline.length && <p className="text-sm text-slate-500">Tüm satırlar kaldırıldığında yolculuk bölümü gizlenir.</p>}
          {content.timeline.map((item, index) => <div key={index} className="rounded-lg border border-white/10 bg-slate-950/50 p-4 space-y-4">
            <div className="flex items-end gap-4"><label className="text-sm flex-1 min-w-0">Yıl / dönem<input required maxLength={40} className={inputClass} value={item.year} onChange={event => change("timeline", content.timeline.map((row, i) => i === index ? { ...row, year: event.target.value } : row))} placeholder="2026 veya 2026 Q4" /></label><OrderButtons index={index} count={content.timeline.length} move={target => { const next = [...content.timeline]; [next[index], next[target]] = [next[target], next[index]]; change("timeline", next); }} remove={() => change("timeline", content.timeline.filter((_, i) => i !== index))} /></div>
            <label className="block text-sm">Açıklama<textarea required maxLength={2000} rows={3} className={inputClass} value={item.event} onChange={event => change("timeline", content.timeline.map((row, i) => i === index ? { ...row, event: event.target.value } : row))} /></label>
          </div>)}
          <button type="button" className="division-editor-add" disabled={content.timeline.length >= 50} onClick={() => change("timeline", [...content.timeline, { year: "", event: "" }])}><Plus size={16} />Dönüm noktası ekle</button>
        </section>
        <StatsEditor title="Ana sayfa istatistikleri" description="“Alt Şirket”, “Proje” gibi sabit başlıkları da buradan değiştirebilirsiniz. Artı işareti dahil gösterilmesini istediğiniz değeri yazın." items={content.homeStats} change={items => change("homeStats", items)} />
        <div className="sticky bottom-0 border-t border-white/15 bg-slate-950/95 p-4 rounded-lg flex flex-wrap items-center justify-between gap-4">
          <div className="text-sm">{message ? <p role={failed ? "alert" : "status"} className={failed ? "text-red-300" : "text-emerald-300"}>{message}</p> : <span className="text-slate-400">{dirty ? "Kaydedilmemiş değişiklikler var." : "Değişiklik yok."}</span>}</div>
          <button disabled={!dirty || saving} className="group-primary-button disabled:opacity-40">{saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}</button>
        </div>
      </fieldset>
    </form>
  </div>;
}
