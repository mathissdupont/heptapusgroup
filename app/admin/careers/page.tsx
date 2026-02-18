"use client";

import { useState, useEffect, useCallback } from "react";
import AdminGuard from "@/components/AdminGuard";
import LanguageTabs from "@/components/LanguageTabs";
import { parseTranslations, buildTranslations } from "@/lib/i18n";

interface Job {
  id: string;
  title: string;
  slug: string;
  department: string | null;
  location: string | null;
  type: string;
  isActive: boolean;
  createdAt: string;
  _count?: { applications: number };
}

const JOB_TYPES = ["FULL_TIME", "PART_TIME", "INTERNSHIP", "CONTRACT", "REMOTE"] as const;
const JOB_TYPE_LABELS: Record<string, string> = {
  FULL_TIME: "Full Time",
  PART_TIME: "Part Time",
  INTERNSHIP: "Internship",
  CONTRACT: "Contract",
  REMOTE: "Remote",
};

const emptyForm = {
  title: "",
  slug: "",
  department: "",
  location: "",
  type: "FULL_TIME",
  description: "",
  requirements: "",
  isActive: true,
};

const emptyTrans = { title: "", description: "", requirements: "" };

type TField = "title" | "description" | "requirements";

export default function AdminCareersPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({
    en: { ...emptyTrans },
    de: { ...emptyTrans },
  });
  const [activeLang, setActiveLang] = useState("tr");
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/careers");
    if (res.ok) {
      const data = await res.json();
      setJobs(Array.isArray(data) ? data : data.items ?? []);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const autoSlug = (t: string) =>
    t.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

  const getFieldValue = (field: TField) =>
    activeLang === "tr" ? (form as any)[field] || "" : translations[activeLang]?.[field] || "";

  const setFieldValue = (field: TField, value: string) => {
    if (activeLang === "tr") {
      setForm((f) => ({ ...f, [field]: value }));
    } else {
      setTranslations((t) => ({
        ...t,
        [activeLang]: { ...t[activeLang], [field]: value },
      }));
    }
  };

  const populated: Record<string, boolean> = {
    tr: !!(form.title || form.description),
    en: !!(translations.en?.title || translations.en?.description),
    de: !!(translations.de?.title || translations.de?.description),
  };

  const resetForm = () => {
    setForm({ ...emptyForm });
    setTranslations({ en: { ...emptyTrans }, de: { ...emptyTrans } });
    setActiveLang("tr");
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, translations: buildTranslations(translations) };
      if (editId) {
        const job = jobs.find((j) => j.id === editId);
        await fetch(`/api/careers/${job?.slug}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/careers", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      resetForm();
      load();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const startEdit = async (job: Job) => {
    const res = await fetch(`/api/careers/${job.slug}`);
    if (res.ok) {
      const json = await res.json();
      const d = json.item ?? json;
      setForm({
        title: d.title || "",
        slug: d.slug || "",
        department: d.department || "",
        location: d.location || "",
        type: d.type || "FULL_TIME",
        description: d.description || "",
        requirements: d.requirements || "",
        isActive: d.isActive ?? true,
      });
      const parsed = parseTranslations(d.translations);
      setTranslations({
        en: { title: parsed.en?.title || "", description: parsed.en?.description || "", requirements: parsed.en?.requirements || "" },
        de: { title: parsed.de?.title || "", description: parsed.de?.description || "", requirements: parsed.de?.requirements || "" },
      });
      setEditId(d.id);
      setActiveLang("tr");
      setShowForm(true);
    }
  };

  const handleDelete = async (slug: string) => {
    if (!confirm("Delete this job posting?")) return;
    await fetch(`/api/careers/${slug}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Careers</h1>
          <button
            onClick={() => { if (showForm) resetForm(); else setShowForm(true); }}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
          >
            {showForm ? "Cancel" : "+ New Job"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-slate-800/50 p-6 space-y-4">
            {/* Language Tabs */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="text-sm font-medium text-white">{editId ? "Edit Job" : "New Job"}</span>
              <LanguageTabs activeLang={activeLang} onChangeLang={setActiveLang} populated={populated} />
            </div>

            {/* Translatable: Title */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Title *</label>
                <input
                  type="text"
                  required={activeLang === "tr"}
                  value={getFieldValue("title")}
                  onChange={(e) => {
                    setFieldValue("title", e.target.value);
                    if (activeLang === "tr" && !editId) setForm((f) => ({ ...f, title: e.target.value, slug: autoSlug(e.target.value) }));
                  }}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              {activeLang === "tr" && (
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Slug</label>
                  <input type="text" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>
              )}
            </div>

            {/* Non-translatable fields — only on TR tab */}
            {activeLang === "tr" && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Department</label>
                  <input type="text" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Location</label>
                  <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none" />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Job Type</label>
                  <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none">
                    {JOB_TYPES.map((t) => (
                      <option key={t} value={t}>{JOB_TYPE_LABELS[t]}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Translatable: Description */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Description * (HTML){activeLang !== "tr" ? ` — ${activeLang.toUpperCase()}` : ""}</label>
              <textarea
                required={activeLang === "tr"}
                rows={6}
                value={getFieldValue("description")}
                onChange={(e) => setFieldValue("description", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none resize-none font-mono"
              />
            </div>

            {/* Translatable: Requirements */}
            <div>
              <label className="block text-sm text-slate-400 mb-1">Requirements (HTML){activeLang !== "tr" ? ` — ${activeLang.toUpperCase()}` : ""}</label>
              <textarea
                rows={4}
                value={getFieldValue("requirements")}
                onChange={(e) => setFieldValue("requirements", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none resize-none font-mono"
              />
            </div>

            <div className="flex items-center gap-4">
              {activeLang === "tr" && (
                <label className="flex items-center gap-2 text-sm text-slate-300">
                  <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded border-white/20 bg-slate-900" />
                  Active
                </label>
              )}
              <button type="submit" disabled={saving}
                className="rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors disabled:opacity-60">
                {saving ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        )}

        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-800/80 text-slate-400">
              <tr>
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Apps</th>
                <th className="px-4 py-3">Active</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {jobs.map((job) => (
                <tr key={job.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{job.title}</td>
                  <td className="px-4 py-3 text-slate-400">{job.department || "—"}</td>
                  <td className="px-4 py-3 text-slate-400">{JOB_TYPE_LABELS[job.type] || job.type}</td>
                  <td className="px-4 py-3 text-slate-400">{job._count?.applications ?? 0}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-block w-2 h-2 rounded-full ${job.isActive ? "bg-emerald-400" : "bg-slate-600"}`} />
                  </td>
                  <td className="px-4 py-3 text-right space-x-2">
                    <button onClick={() => startEdit(job)} className="text-sky-400 hover:text-sky-300 text-xs">Edit</button>
                    <button onClick={() => handleDelete(job.slug)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
                  </td>
                </tr>
              ))}
              {jobs.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">No job postings yet</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminGuard>
  );
}
