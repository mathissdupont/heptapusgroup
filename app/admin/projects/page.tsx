"use client";

import useSWR from "swr";
import { jfetch } from "@/lib/fetcher";
import AdminGuard from "@/components/AdminGuard";
import { useConfirm } from "@/components/ui/Confirm";
import type { Project as BaseProject } from "@/types/project";
import { useMemo, useState } from "react";

/* -------------------- Types -------------------- */

type Project = BaseProject & { content?: string | null };
type ListRes = { items: Project[]; total?: number } | Project[];

/* -------------------- Page -------------------- */

export default function ProjectsAdmin() {
  return (
    <AdminGuard allow={["ADMIN", "EDITOR"]}>
      <ProjectsInner />
    </AdminGuard>
  );
}

/* -------------------- Inner -------------------- */

function ProjectsInner() {
  const { data, error, mutate } = useSWR<ListRes>("/api/projects", jfetch);

  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | "LIVE" | "UAT" | "DRAFT">("");

  const { Modal, ask, set: setConfirm } = useConfirm();
  const [edit, setEdit] = useState<Project | null>(null);

  const items = useMemo(() => {
    const list: Project[] = Array.isArray(data)
      ? (data as Project[])
      : ((data as any)?.items ?? []);
    return list.filter(
      (p) =>
        (!q ||
          `${p.title} ${p.summary} ${p.slug}`
            .toLowerCase()
            .includes(q.toLowerCase())) &&
        (!status || p.status === status)
    );
  }, [data, q, status]);

  async function onDelete(p: Project) {
    setConfirm((s) => ({
      ...s,
      onYes: async () => {
        try {
          await jfetch(`/api/projects/${p.id}`, { method: "DELETE" });
          mutate();
        } catch (err: any) {
          alert(`Silme hatası: ${err.message || err}`);
        }
      },
    }));
    await ask(`"${p.title}" silinsin mi?`);
  }

  return (
    <div className="space-y-5">
      {Modal}

      {/* Header & Actions */}
      <div className="flex flex-wrap gap-3 justify-between items-center">
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Ara…"
            className="px-3 py-2 bg-slate-950/60 border border-white/10 rounded w-[240px] focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as any)}
            className="px-3 py-2 bg-slate-950/60 border border-white/10 rounded focus:border-sky-500 focus:ring-1 focus:ring-sky-500 outline-none"
          >
            <option value="">Tümü</option>
            <option>LIVE</option>
            <option>UAT</option>
            <option>DRAFT</option>
          </select>
        </div>

        <button
          onClick={() => setEdit(EMPTY)}
          className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow"
        >
          + Yeni Proje
        </button>
      </div>

      {/* Status/Error states */}
      {error && (
        <div className="text-rose-400">
          Projeler yüklenemedi: {String((error as any)?.message || error)}
        </div>
      )}
      {!data && <div className="text-slate-400">Yükleniyor…</div>}

      {/* Grid */}
      <div className="grid gap-4">
        {items?.map((p) => (
          <div
            key={p.id}
            className="rounded-lg border border-white/10 p-4 flex gap-4 items-start bg-slate-900/40 hover:bg-slate-900/60 transition"
          >
            <img
              src={p.imageUrl || "/placeholder.svg"}
              className="w-32 h-20 object-cover rounded border border-white/10 bg-slate-800/40"
              alt=""
            />
            <div className="flex-1 space-y-1">
              <div className="font-semibold text-lg">
                {p.title}{" "}
                <span className="text-xs opacity-60">({p.slug})</span>
              </div>
              <div className="text-slate-400 text-sm line-clamp-2">
                {p.summary}
              </div>
              <div className="mt-2 flex gap-2 flex-wrap">
                <StatusTag status={p.status} />
                {p.tags?.map((t) => (
                  <span
                    key={t}
                    className="px-2 py-0.5 text-xs border border-white/10 rounded opacity-75"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setEdit(p)}
                className="px-3 py-1.5 rounded border border-white/10 hover:bg-white/10"
              >
                Düzenle
              </button>
              <button
                onClick={() => onDelete(p)}
                className="px-3 py-1.5 rounded bg-rose-600 hover:bg-rose-500 text-white"
              >
                Sil
              </button>
            </div>
          </div>
        ))}
        {items?.length === 0 && (
          <div className="text-slate-400">Kayıt yok.</div>
        )}
      </div>

      {edit && (
        <ProjectForm
          initial={edit}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            mutate();
          }}
        />
      )}
    </div>
  );
}

/* -------------------- Status Tag -------------------- */

function StatusTag({ status }: { status: string }) {
  const colors: Record<string, string> = {
    LIVE: "bg-emerald-600/30 text-emerald-300 border-emerald-600/50",
    UAT: "bg-yellow-600/30 text-yellow-300 border-yellow-600/50",
    DRAFT: "bg-slate-600/30 text-slate-300 border-slate-600/50",
  };
  return (
    <span
      className={`px-2 py-0.5 text-xs rounded border ${colors[status] || ""}`}
    >
      {status}
    </span>
  );
}

/* -------------------- Form -------------------- */

const EMPTY: Project = {
  id: "",
  title: "",
  slug: "",
  summary: "",
  imageUrl: "",
  status: "DRAFT",
  tags: [],
  createdAt: "",
  updatedAt: "",
  content: "",
};

function ProjectForm({
  initial,
  onClose,
  onSaved,
}: {
  initial: Project;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [data, setData] = useState<Project>(initial);
  const isNew = !initial.id;

  async function save() {
    const payload = {
      title: (data.title || "").trim(),
      slug: (data.slug || "").trim(),
      summary: data.summary || "",
      imageUrl: data.imageUrl || null,
      status: data.status,
      tags: (data.tags || []).map(String),
      content: data.content || null,
    };

    try {
      if (isNew) {
        await jfetch("/api/projects", {
          method: "POST",
          body: JSON.stringify(payload),
        });
      } else {
        await jfetch(`/api/projects/${data.id}`, {
          method: "PUT",
          body: JSON.stringify(payload),
        });
      }
      onSaved();
    } catch (err: any) {
      alert(`Kaydetme hatası: ${err.message || err}`);
    }
  }

  return (
    <div className="fixed inset-0 z-[90] grid place-items-center bg-black/70 backdrop-blur">
      <div className="w-[960px] max-w-[95%] max-h-[90vh] overflow-y-auto rounded-lg border border-white/10 bg-slate-900 p-6 shadow-xl">
        <div className="font-bold mb-4 text-lg">
          {isNew ? "Yeni Proje" : "Projeyi Düzenle"}
        </div>

        <div className="grid gap-4">
          {/* Title + Slug */}
          <div className="grid grid-cols-2 gap-3">
            <input
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              placeholder="Başlık"
              className="px-3 py-2 bg-slate-950/60 border border-white/10 rounded"
            />
            <input
              value={data.slug}
              onChange={(e) =>
                setData({
                  ...data,
                  slug: e.target.value.replace(/\s+/g, "-").toLowerCase(),
                })
              }
              placeholder="slug"
              className="px-3 py-2 bg-slate-950/60 border border-white/10 rounded"
            />
          </div>

          {/* Summary */}
          <textarea
            value={data.summary}
            onChange={(e) => setData({ ...data, summary: e.target.value })}
            placeholder="Özet"
            rows={3}
            className="px-3 py-2 bg-slate-950/60 border border-white/10 rounded"
          />

          {/* Image + Status */}
          <div className="grid grid-cols-2 gap-3">
            <input
              value={data.imageUrl || ""}
              onChange={(e) => setData({ ...data, imageUrl: e.target.value })}
              placeholder="Kapak görsel URL"
              className="px-3 py-2 bg-slate-950/60 border border-white/10 rounded"
            />
            <select
              value={data.status}
              onChange={(e) =>
                setData({ ...data, status: e.target.value as any })
              }
              className="px-3 py-2 bg-slate-950/60 border border-white/10 rounded"
            >
              <option>LIVE</option>
              <option>UAT</option>
              <option>DRAFT</option>
            </select>
          </div>

          {/* Tags */}
          <input
            value={(data.tags || []).join(", ")}
            onChange={(e) =>
              setData({
                ...data,
                tags: e.target.value
                  .split(",")
                  .map((s) => s.trim())
                  .filter(Boolean),
              })
            }
            placeholder="Etiketler (virgülle ayır)"
            className="px-3 py-2 bg-slate-950/60 border border-white/10 rounded"
          />

          {/* Markdown content */}
          <div className="grid gap-2">
            <label className="text-sm text-slate-300">İçerik (Markdown)</label>
            <textarea
              value={data.content || ""}
              onChange={(e) => setData({ ...data, content: e.target.value })}
              placeholder="## Başlık

- madde 1
- madde 2

**kalın** _italik_ `code`"
              rows={12}
              className="px-3 py-2 bg-slate-950/60 border border-white/10 rounded font-mono text-sm"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex justify-end gap-2 sticky bottom-0 bg-slate-900 pt-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded border border-white/10 hover:bg-white/10"
          >
            Kapat
          </button>
          <button
            onClick={save}
            className="px-4 py-2 rounded bg-emerald-600 hover:bg-emerald-500 text-white font-medium"
          >
            {isNew ? "Kaydet" : "Güncelle"}
          </button>
        </div>
      </div>
    </div>
  );
}
