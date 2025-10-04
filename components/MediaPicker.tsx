// components/MediaPicker.tsx
"use client";
import useSWR from "swr";
import { jfetch } from "@/lib/fetcher";

type Media = {
  id: string;
  url: string;
  filename: string;
  mime: string;
  size: number;
  createdAt: string;
};

export default function MediaPicker({
  open,
  onClose,
  onPick,
}: {
  open: boolean;
  onClose: () => void;
  onPick: (url: string, id: string) => void;
}) {
  const { data, mutate } = useSWR<{ items: Media[] }>(
    open ? "/api/media" : null,
    jfetch
  );

  async function remove(id: string) {
    await jfetch(`/api/media/${id}`, { method: "DELETE" });
    mutate();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/60 grid place-items-center">
      <div className="w-[900px] max-w-[94%] bg-slate-900 border border-white/10 rounded-lg p-4">
        <div className="flex justify-between items-center mb-3">
          <div className="font-semibold">Medya Kütüphanesi</div>
          <button onClick={onClose} className="px-3 py-1.5 border border-white/10 rounded">
            Kapat
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {(data?.items ?? []).map((m) => (
            <div key={m.id} className="border border-white/10 rounded overflow-hidden">
              <img
                src={m.url}
                alt={m.filename}
                className="w-full h-32 object-cover cursor-pointer"
                onClick={() => { onPick(m.url, m.id); onClose(); }}
              />
              <div className="px-2 py-1 text-xs flex justify-between items-center">
                <span className="truncate w-[140px]" title={m.filename}>{m.filename}</span>
                <button
                  onClick={() => remove(m.id)}
                  className="text-rose-400 hover:text-rose-300"
                  title="Sil"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>

        {(data?.items?.length ?? 0) === 0 && (
          <div className="text-slate-400 text-sm">Henüz medya yok.</div>
        )}
      </div>
    </div>
  );
}
