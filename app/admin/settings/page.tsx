"use client";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { jfetch } from "@/lib/fetcher";

export default function SettingsPage() {
  const { data, mutate } = useSWR<{items:{key:string,value:string|null}[]}>(
    "/api/admin/settings",
    jfetch
  );

  const [form, setForm] = useState<any>({});

  useEffect(() => {
    if (data?.items) {
      const obj: any = {};
      data.items.forEach(s => obj[s.key] = s.value || "");
      setForm(obj);
    }
  }, [data]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement|HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function save() {
    await jfetch("/api/admin/settings", { method:"POST", body: JSON.stringify(form) });
    mutate();
    alert("Ayarlar kaydedildi!");
  }

  return (
    <div className="rounded border border-white/10 p-5 text-slate-300 space-y-4">
      <div className="font-bold text-lg">Site Ayarları</div>

      <input
        name="siteTitle"
        value={form.siteTitle || ""}
        onChange={handleChange}
        placeholder="Site Başlığı"
        className="px-3 py-2 bg-transparent border border-white/10 rounded w-full"
      />

      <textarea
        name="description"
        value={form.description || ""}
        onChange={handleChange}
        placeholder="Meta Açıklaması"
        rows={3}
        className="px-3 py-2 bg-transparent border border-white/10 rounded w-full"
      />

      <input
        name="twitter"
        value={form.twitter || ""}
        onChange={handleChange}
        placeholder="Twitter URL"
        className="px-3 py-2 bg-transparent border border-white/10 rounded w-full"
      />

      <input
        name="github"
        value={form.github || ""}
        onChange={handleChange}
        placeholder="GitHub URL"
        className="px-3 py-2 bg-transparent border border-white/10 rounded w-full"
      />

      <input
        name="linkedin"
        value={form.linkedin || ""}
        onChange={handleChange}
        placeholder="LinkedIn URL"
        className="px-3 py-2 bg-transparent border border-white/10 rounded w-full"
      />

      <button
        onClick={save}
        className="px-4 py-2 rounded bg-emerald-600 text-white"
      >
        Kaydet
      </button>
    </div>
  );
}
