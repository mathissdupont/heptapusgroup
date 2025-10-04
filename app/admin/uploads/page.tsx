"use client";
import AdminGuard from "@/components/AdminGuard";
import { useState } from "react";

export default function UploadsPage() {
  return (
    <AdminGuard allow={["ADMIN","EDITOR"]}>
      <Uploader/>
    </AdminGuard>
  );
}

function Uploader() {
  const [urls, setUrls] = useState<string[]>([]);
  async function onFiles(files: FileList | null) {
    if (!files || !files.length) return;
    const out: string[] = [];
    for (const f of Array.from(files)) {
      const fd = new FormData(); fd.append("file", f);
      const res = await fetch("/api/upload", { method:"POST", body: fd });
      const j = await res.json(); if (res.ok) out.push(j.url);
    }
    setUrls(u=>[...out, ...u]);
  }

  return (
    <div className="space-y-4">
      <label className="block rounded border border-dashed border-white/15 p-8 text-center cursor-pointer hover:border-white/30">
        <div className="text-slate-300">Görsel seç / sürükle</div>
        <input onChange={e=>onFiles(e.target.files)} type="file" accept="image/*" multiple className="hidden" />
      </label>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {urls.map(u=>(
          <div key={u} className="rounded border border-white/10 p-2">
            <img src={u} className="w-full h-36 object-cover rounded" />
            <div className="text-[11px] mt-1 break-all text-slate-400">{u}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
