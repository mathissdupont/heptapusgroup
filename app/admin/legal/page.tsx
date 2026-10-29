"use client";
import { useEffect, useState } from "react";
import { type LegalSettings, defaultLegalSettings, legalReviewComplete } from "@/lib/legal-settings";
import { EditorField } from "@/components/DivisionContentEditor";

export default function LegalEditor() {
  const [value, setValue] = useState<LegalSettings>(defaultLegalSettings);
  const [ready, setReady] = useState(false), [busy, setBusy] = useState(false), [error, setError] = useState(""), [notice, setNotice] = useState("");
  useEffect(() => { fetch("/api/admin/legal", { cache: "no-store" }).then(async response => { const data = await response.json(); if (!response.ok) throw new Error(data.error); setValue(data.settings); setReady(true); }).catch(cause => setError(cause.message)); }, []);
  async function save(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/legal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(value) });
      const data = await response.json(); if (!response.ok) throw new Error(data.error);
      setNotice("Hukuki bilgiler kaydedildi. Sayfalar sonraki istekte güncellenir.");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Kaydedilemedi."); } finally { setBusy(false); }
  }
  return <div className="max-w-4xl mx-auto p-5 sm:p-8"><h1 className="text-2xl font-semibold mb-4">Hukuki bilgiler</h1>
    <p className="text-sm text-muted-foreground mb-6">Heptapus Group proje/marka adıdır; tek başına ayrı bir tüzel kişi veya gerçek kişinin yasal kimliğinin karşılığı değildir. Kişisel kimlik bilgileri otomatik doldurulmaz. Hetzner DPA/AB sözleşmeleri KVKK aktarım güvencesi olarak kendiliğinden kabul edilmez. Bu alanlar avukat incelemesinin yerine geçmez.</p>
    <p className="border border-border rounded p-4 mb-6 text-sm">{legalReviewComplete(value) ? "Gerekli bilgi alanları dolduruldu; bu durum hukuki uygunluk sertifikası değildir." : "Kimlik, adres, yedek konumu, saklama düzeni veya KVKK aktarım güvencesi eksik. Kamuya açık metinlerde incelemenin tamamlanmadığı belirtilir."}</p>
    {error && <p role="alert" className="text-red-500 mb-4">{error}</p>}{notice && <p role="status" className="text-primary mb-4">{notice}</p>}
    <form onSubmit={save} className="space-y-5">
      {([
        ["controllerName", "Veri sorumlusunun gerçek/yasal kimliği", false], ["controllerAddress", "Veri sorumlusunun başvuru adresi", true],
        ["contactEmail", "KVKK iletişim e-postası", false], ["hostingCountry", "Uygulama sunucusunun ülkesi", false],
        ["backupLocations", "Veritabanı, yedek ve felaket kurtarma konumları", true], ["transferDetails", "Aktarım güvencesi, sağlayıcı kapsamı ve bildirim bilgisi", true],
        ["retentionDetails", "Saklama süreleri / ölçütleri, yedeklerden silinme ve uygulanan ayıklama düzeni", true],
        ["additionalTr", "Türkçe ek bilgilendirme (Markdown)", true], ["additionalEn", "English additional disclosure (Markdown)", true], ["additionalDe", "Deutsche Zusatzinformationen (Markdown)", true],
      ] as const).map(([key, label, multiline]) => <EditorField key={key} label={label} value={value[key]} multiline={multiline} onChange={next => setValue({ ...value, [key]: next })} />)}
      <label className="block text-sm">Aktarım değerlendirmesi<select className="division-editor-input mt-2" value={value.transferStatus} onChange={event => setValue({ ...value, transferStatus: event.target.value as LegalSettings["transferStatus"] })}><option value="HETZNER_DPA_ONLY">Yalnızca Hetzner DPA/AB sözleşmesi doğrulandı</option><option value="KVKK_SAFEGUARDS_REVIEWED">KVKK m.9 güvenceleri kapsamıyla birlikte ayrıca incelendi</option></select></label>
      <button className="group-primary-button" disabled={!ready || busy} type="submit">{busy ? "Kaydediliyor…" : "Kaydet"}</button>
    </form>
  </div>;
}
