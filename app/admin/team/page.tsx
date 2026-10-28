"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Plus, Pencil, Trash2, ExternalLink } from "lucide-react";
import AdminGuard from "@/components/AdminGuard";
import MediaPicker from "@/components/MediaPicker";
import { jfetch } from "@/lib/fetcher";
import { teamCopy, teamGroups, teamMemberSchema } from "@/lib/team-validation";

type MemberForm = {
  name: string; slug: string; title: string; group: typeof teamGroups[number];
  summary: string; biography: string; photoUrl: string; resumeUrl: string;
  linkedinUrl: string; order: number; isActive: boolean;
};
type Member = MemberForm & { id: string };
const emptyMember: MemberForm = { name: "", slug: "", title: "", group: "BOARD", summary: "", biography: "", photoUrl: "", resumeUrl: "", linkedinUrl: "", order: 0, isActive: false };
const fieldClass = "mt-2 w-full rounded-lg border border-white/15 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none focus:border-sky-400";
const slugify = (value: string) => value.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function TeamAdminPage() {
  return <AdminGuard><TeamEditor /></AdminGuard>;
}

function TeamEditor() {
  const { data, error, isLoading, mutate } = useSWR<{ items: Member[] }>("/api/admin/team", jfetch);
  const [form, setForm] = useState<MemberForm>({ ...emptyMember });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [picker, setPicker] = useState(false);
  const [message, setMessage] = useState("");
  const [failed, setFailed] = useState(false);

  function report(error: unknown) { setFailed(true); setMessage(error instanceof Error ? error.message : "İşlem tamamlanamadı."); }
  function change<K extends keyof MemberForm>(key: K, value: MemberForm[K]) { setForm(current => ({ ...current, [key]: value })); }

  function edit(member?: Member) {
    setMessage(""); setFailed(false);
    setEditingId(member?.id || null);
    setForm(member ? {
      name: member.name, slug: member.slug, title: member.title, group: member.group,
      summary: member.summary, biography: member.biography, photoUrl: member.photoUrl || "",
      resumeUrl: member.resumeUrl || "", linkedinUrl: member.linkedinUrl || "", order: member.order, isActive: member.isActive,
    } : { ...emptyMember, order: Math.max(-1, ...(data?.items || []).map(item => item.order)) + 1 });
    setOpen(true);
  }

  async function save(event: FormEvent) {
    event.preventDefault();
    if (saving || uploading) return;
    setSaving(true); setMessage("");
    try {
      const parsed = teamMemberSchema.safeParse(form);
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message);
      await jfetch(editingId ? `/api/admin/team/${editingId}` : "/api/admin/team", {
        method: editingId ? "PUT" : "POST", body: JSON.stringify(parsed.data),
      });
      await mutate(); setOpen(false); setFailed(false);
      setMessage("Ekip üyesi kaydedildi.");
    } catch (error) { report(error); } finally { setSaving(false); }
  }

  async function upload(file: File | undefined, key: "photoUrl" | "resumeUrl") {
    if (!file) return;
    setUploading(true); setMessage("");
    try {
      const body = new FormData(); body.append("file", file);
      body.append("purpose", key === "resumeUrl" ? "team-resume" : "image");
      const response = await jfetch<{ url: string }>("/api/upload", { method: "POST", body });
      change(key, response.url); setFailed(false);
      setMessage("Dosya yüklendi. Profile eklemek için değişiklikleri kaydedin.");
    } catch (error) { report(error); } finally { setUploading(false); }
  }

  async function remove(member: Member) {
    if (!confirm(`${member.name} profili silinsin mi? Profili gizlemek için yayından kaldırabilirsiniz.`)) return;
    setSaving(true); setMessage("");
    try {
      await jfetch(`/api/admin/team/${member.id}`, { method: "DELETE" });
      if (editingId === member.id) setOpen(false);
      await mutate(); setFailed(false); setMessage("Profil silindi.");
    } catch (error) { report(error); } finally { setSaving(false); }
  }

  return <div className="space-y-7 text-slate-200">
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div><h1 className="text-2xl font-semibold text-white">Ekibimiz</h1><p className="text-sm text-slate-400 mt-2">Yönetim kurulu, yönetim ekibi ve ekip üyelerinin profillerini yönetin.</p></div>
      <div className="flex gap-3"><Link className="inline-flex items-center gap-2 border border-white/15 rounded-lg px-4 py-2 text-sm" href="/team" target="_blank">Sayfayı görüntüle<ExternalLink size={15} /></Link><button disabled={saving || uploading} onClick={() => edit()} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white"><Plus size={16} />Üye ekle</button></div>
    </div>

    {(message || error) && <p role={failed || error ? "alert" : "status"} className={`rounded-lg border px-4 py-3 text-sm ${failed || error ? "border-red-500/30 text-red-300 bg-red-500/10" : "border-emerald-500/30 text-emerald-300 bg-emerald-500/10"}`}>{message || (error instanceof Error ? error.message : "Ekip bilgileri yüklenemedi.")}</p>}

    {open && <form onSubmit={save} className="rounded-xl border border-white/10 bg-slate-900/60 p-5 md:p-7 space-y-5">
      <h2 className="text-lg font-semibold text-white">{editingId ? "Profili düzenle" : "Yeni ekip üyesi"}</h2>
      <div className="grid gap-5 md:grid-cols-2">
        <label className="text-sm">Ad soyad *<input required maxLength={160} className={fieldClass} value={form.name} onChange={event => { const name = event.target.value; setForm(current => ({ ...current, name, slug: !editingId && (!current.slug || current.slug === slugify(current.name)) ? slugify(name) : current.slug })); }} /></label>
        <label className="text-sm">Görev / unvan *<input required maxLength={200} className={fieldClass} value={form.title} onChange={event => change("title", event.target.value)} placeholder="Örn. Yönetim Kurulu Başkanı" /></label>
        <label className="text-sm">Bölüm<select className={fieldClass} value={form.group} onChange={event => change("group", event.target.value as MemberForm["group"])}>{teamGroups.map(group => <option key={group} value={group}>{teamCopy.tr[group]}</option>)}</select></label>
        <label className="text-sm">Profil adresi *<input required pattern="[a-z0-9]+(-[a-z0-9]+)*" className={fieldClass} value={form.slug} onChange={event => change("slug", event.target.value)} /><span className="text-xs text-slate-500 mt-1 block">/team/{form.slug || "ad-soyad"}</span></label>
        <label className="text-sm md:col-span-2">Kısa biyografi<textarea maxLength={2000} rows={3} className={fieldClass} value={form.summary} onChange={event => change("summary", event.target.value)} /><span className="block text-xs text-slate-500 mt-1">Ekip listesindeki kartta gösterilir.</span></label>
        <label className="text-sm md:col-span-2">Detaylı özgeçmiş<textarea maxLength={60_000} rows={10} className={fieldClass} value={form.biography} onChange={event => change("biography", event.target.value)} placeholder="## Deneyim&#10;&#10;## Eğitim&#10;&#10;## Uzmanlık alanları" /><span className="block text-xs text-slate-500 mt-1">Profil sayfasında gösterilir. Markdown başlıkları, listeleri ve bağlantıları desteklenir.</span></label>
        <div><label className="text-sm">Portre görseli<input className={fieldClass} value={form.photoUrl} onChange={event => change("photoUrl", event.target.value)} placeholder="/uploads/... veya https://..." /></label><div className="flex flex-wrap gap-4 mt-3 text-xs"><button type="button" className="underline" onClick={() => setPicker(true)}>Kütüphaneden seç</button><label className="underline cursor-pointer">{uploading ? "Yükleniyor…" : "Görsel yükle"}<input type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" disabled={uploading || saving} className="sr-only" onChange={event => { void upload(event.target.files?.[0], "photoUrl"); event.target.value = ""; }} /></label></div>{form.photoUrl && <img src={form.photoUrl} alt="Portre önizlemesi" className="mt-4 h-32 w-28 object-cover rounded" />}</div>
        <div><label className="text-sm">CV bağlantısı<input className={fieldClass} value={form.resumeUrl} onChange={event => change("resumeUrl", event.target.value)} placeholder="/uploads/...pdf veya https://..." /></label><label className="block underline cursor-pointer mt-3 text-xs">PDF yükle (en fazla 10 MB)<input type="file" accept="application/pdf" disabled={uploading || saving} className="sr-only" onChange={event => { void upload(event.target.files?.[0], "resumeUrl"); event.target.value = ""; }} /></label><p className="text-xs text-slate-500 mt-3">Yayınlanan profildeki CV dosyası ziyaretçilere açık olur.</p></div>
        <label className="text-sm">LinkedIn<input className={fieldClass} value={form.linkedinUrl} onChange={event => change("linkedinUrl", event.target.value)} placeholder="https://www.linkedin.com/in/..." /></label>
        <label className="text-sm">Sıralama<input type="number" required min={-10000} max={10000} className={fieldClass} value={form.order} onChange={event => change("order", Number(event.target.value))} /><span className="block text-xs text-slate-500 mt-1">Küçük değerler önce gösterilir.</span></label>
      </div>
      <label className="inline-flex items-center gap-3 text-sm"><input type="checkbox" checked={form.isActive} onChange={event => change("isActive", event.target.checked)} />Profil yayında{!form.isActive && <span className="text-slate-500">(taslak)</span>}</label>
      {failed && message && <p role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-300">{message}</p>}
      <div className="flex justify-end gap-3 border-t border-white/10 pt-5"><button type="button" disabled={saving || uploading} className="px-4 py-2 text-sm" onClick={() => setOpen(false)}>Vazgeç</button><button disabled={saving || uploading} className="rounded-lg bg-sky-600 px-5 py-2 text-sm font-medium text-white disabled:opacity-50">{saving ? "Kaydediliyor…" : "Değişiklikleri kaydet"}</button></div>
    </form>}

    {isLoading ? <p className="text-slate-400">Ekip yükleniyor…</p> : <div className="divide-y divide-white/10 rounded-xl border border-white/10 bg-slate-900/40">
      {data?.items.length === 0 && <p className="p-6 text-slate-400 text-sm">Henüz ekip üyesi eklenmemiş. İlk profili “Üye ekle” düğmesiyle oluşturabilirsiniz.</p>}
      {data?.items.map(member => <article key={member.id} className="p-5 flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-4"><span className="text-xs text-slate-500 w-5">{member.order}</span>{member.photoUrl && <img src={member.photoUrl} alt="" className="h-14 w-12 rounded object-cover" />}<div><h2 className="font-semibold text-white">{member.name}</h2><p className="text-sm text-slate-400 mt-1">{member.title}</p><p className="text-xs text-slate-500 mt-1">{teamCopy.tr[member.group]} · {member.isActive ? "Yayında" : "Taslak"}</p></div></div><div className="flex items-center gap-3">{member.isActive && <Link href={`/team/${member.slug}`} target="_blank" className="p-2" aria-label={`${member.name} profilini görüntüle`}><ExternalLink size={17} /></Link>}<button disabled={saving || uploading} onClick={() => edit(member)} className="p-2" aria-label={`${member.name} profilini düzenle`}><Pencil size={17} /></button><button disabled={saving || uploading} onClick={() => remove(member)} className="p-2 text-red-400" aria-label={`${member.name} profilini sil`}><Trash2 size={17} /></button></div></article>)}
    </div>}
    <MediaPicker open={picker} onClose={() => setPicker(false)} onPick={url => change("photoUrl", url)} />
  </div>;
}
