"use client";
import { useState } from "react";
import { type SubdomainSettings, divisionTranslationSchema } from "@/lib/subdomain-content";
import DivisionContentEditor, { EditorField, ImageField } from "@/components/DivisionContentEditor";

export default function DivisionTranslationsEditor({ value, onChange }: { value: SubdomainSettings; onChange: (value: SubdomainSettings) => void }) {
  const primary = value.locale || "en";
  const [selected, setSelected] = useState<"tr" | "en" | "de">(primary === "tr" ? "en" : "tr");
  const language = selected === primary ? (primary === "tr" ? "en" : "tr") : selected;
  const [tab, setTab] = useState<"content" | "features" | "projects">("content");
  const [error, setError] = useState("");
  const variant = value.translations?.[language] || { published: false };
  const update = (patch: Partial<typeof variant>) => onChange({ ...value, translations: { ...value.translations, [language]: { ...variant, ...patch } } });
  const editorValue: SubdomainSettings = { ...variant, locale: language };
  return <div className="space-y-6">
    <p className="text-sm text-muted-foreground">Ana dil mevcut adreslerde kalır. Diğer dil kendi /tr veya /en adreslerinden yayınlanır. Çeviri taslakları ziyaretçilere ve arama motorlarına gösterilmez. Metinler otomatik çevrilmez; bu sürümün hizmetlerini ve projelerini ayrıca girin. Aynı hizmet/proje için aynı adresi kullanırsanız diller birbirine bağlanır.</p>
    <label className="block text-sm font-medium">Düzenlenecek dil<select className="division-editor-input mt-2" value={language} onChange={event => setSelected(event.target.value as typeof selected)}>{(["tr", "en", "de"] as const).filter(locale => locale !== primary).map(locale => <option key={locale} value={locale}>{({ tr: "Türkçe", en: "English", de: "Deutsch" })[locale]}</option>)}</select></label>
    <label className="block text-sm font-medium">JSON taslağı yükle<input className="block mt-2 text-sm" type="file" accept="application/json,.json" onChange={async event => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
        if (file.size > 500_000) throw new Error("Taslak dosyası en fazla 500 KB olabilir.");
        const result = divisionTranslationSchema.safeParse(JSON.parse(await file.text()));
        if (!result.success) throw new Error(result.error.issues.map(issue => `${issue.path.join(".")}: ${issue.message}`).join("; "));
        onChange({ ...value, translations: { ...value.translations, [language]: { ...result.data, published: false } } });
        setError("");
      } catch (cause) { setError(cause instanceof Error ? cause.message : "Dosya okunamadı."); }
      event.target.value = "";
    }} /><span className="block mt-1 text-xs text-muted-foreground">Seçili dilin formunu dosyadan doldurur ve taslak durumuna alır. Sunucuya yazmak için Kaydet gerekir.</span></label>
    {error && <p role="alert" className="text-sm text-red-500">{error}</p>}
    <label className="flex items-center gap-3"><input type="checkbox" checked={variant.published} onChange={event => update({ published: event.target.checked })} />Bu dil sürümü yayında</label>
    <EditorField label="Marka açıklaması *" value={variant.description} onChange={description => update({ description })} multiline hint="Yayın için açıklama, ana başlık ve hakkımızda metni gerekli. Ana dildeki açıklama buraya otomatik taşınmaz." />
    <EditorField label="Hakkımızda *" value={variant.aboutText} onChange={aboutText => update({ aboutText })} multiline />
    <EditorField label="Slogan" value={variant.tagline} onChange={tagline => update({ tagline })} />
    <EditorField label="SEO başlığı" value={variant.seo?.title} onChange={title => update({ seo: { ...variant.seo, title } })} />
    <EditorField label="SEO açıklaması" value={variant.seo?.description} onChange={description => update({ seo: { ...variant.seo, description } })} multiline />
    <ImageField label="Paylaşım görseli" value={variant.seo?.image} onChange={image => update({ seo: { ...variant.seo, image } })} />
    <div className="flex flex-wrap gap-3">{(["content", "features", "projects"] as const).map(key => <button type="button" key={key} onClick={() => setTab(key)} className={`px-3 py-2 rounded border ${tab === key ? "border-primary text-primary" : "border-border"}`}>{({ content: "Sayfa içeriği", features: "Hizmetler", projects: "Projeler" })[key]}</button>)}</div>
    <DivisionContentEditor fixedLocale key={`${language}-${tab}`} tab={tab} value={editorValue} onChange={next => {
      const { locale: _locale, translations: _translations, ...content } = next;
      update(content);
    }} />
  </div>;
}
