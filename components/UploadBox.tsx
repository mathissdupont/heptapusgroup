// components/UploadBox.tsx
"use client";
import { useState } from "react";
import { jfetch } from "@/lib/fetcher";

export default function UploadBox({
  onUploaded,
}: {
  onUploaded: (url: string, id: string) => void;
}) {
  const [busy, setBusy] = useState(false);

  async function handleFiles(files: FileList | null) {
    if (!files || !files[0]) return;
    setBusy(true);
    const fd = new FormData();
    fd.append("file", files[0]);
    try {
      const res = await jfetch<{ ok: boolean; id: string; url: string }>(
        "/api/upload",
        { method: "POST", body: fd, headers: {} as any } // jfetch default header'ı override etmesin
      );
      onUploaded(res.url, res.id);
    } finally {
      setBusy(false);
    }
  }

  return (
    <label
      className="block w-full h-32 border border-white/10 rounded grid place-items-center text-slate-300/80 cursor-pointer"
    >
      {busy ? "Yükleniyor…" : "Görsel seç / sürükle"}
      <input
        type="file"
        className="hidden"
        accept="image/*"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </label>
  );
}
