"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AdminGuard from "@/components/AdminGuard";
import LanguageTabs from "@/components/LanguageTabs";
import { parseTranslations, buildTranslations } from "@/lib/i18n";

type TField = "title" | "excerpt" | "content";

export default function AdminBlogEditPage() {
  const router = useRouter();
  const { slug } = useParams<{ slug: string }>();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    excerpt: "",
    content: "",
    coverImage: "",
    author: "",
    tags: "",
    status: "DRAFT" as "DRAFT" | "PUBLISHED",
  });
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({
    en: { title: "", excerpt: "", content: "" },
    de: { title: "", excerpt: "", content: "" },
  });
  const [activeLang, setActiveLang] = useState("tr");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/blog/${slug}`)
      .then((r) => r.json())
      .then((d) => {
        const item = d.item ?? d;
        setForm({
          title: item.title || "",
          slug: item.slug || "",
          excerpt: item.excerpt || "",
          content: item.content || "",
          coverImage: item.coverImage || "",
          author: item.author || "",
          tags: Array.isArray(item.tags) ? item.tags.join(", ") : "",
          status: item.status || "DRAFT",
        });
        const parsed = parseTranslations(item.translations);
        setTranslations({
          en: { title: parsed.en?.title || "", excerpt: parsed.en?.excerpt || "", content: parsed.en?.content || "" },
          de: { title: parsed.de?.title || "", excerpt: parsed.de?.excerpt || "", content: parsed.de?.content || "" },
        });
        setLoading(false);
      });
  }, [slug]);

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
    tr: !!(form.title || form.content),
    en: !!(translations.en?.title || translations.en?.content),
    de: !!(translations.de?.title || translations.de?.content),
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/blog/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
          translations: buildTranslations(translations),
        }),
      });
      if (res.ok) router.push("/admin/blog");
    } catch {
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminGuard>
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-slate-700" />
          <div className="h-96 rounded-xl bg-slate-800/50" />
        </div>
      </AdminGuard>
    );
  }

  return (
    <AdminGuard>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Edit Blog Post</h1>

        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-slate-800/50 p-6 space-y-4">
          {/* Language Tabs */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <LanguageTabs activeLang={activeLang} onChangeLang={setActiveLang} populated={populated} />
            <span className="text-xs text-slate-500">
              {activeLang === "tr" ? "Varsayılan dil (Türkçe)" : `Çeviri: ${activeLang.toUpperCase()}`}
            </span>
          </div>

          {/* Translatable: Title */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Title *</label>
              <input
                type="text"
                required={activeLang === "tr"}
                value={getFieldValue("title")}
                onChange={(e) => setFieldValue("title", e.target.value)}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
            {activeLang === "tr" && (
              <div>
                <label className="block text-sm text-slate-400 mb-1">Slug</label>
                <input
                  type="text"
                  value={form.slug}
                  onChange={(e) => setForm({ ...form, slug: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            )}
          </div>

          {/* Translatable: Excerpt */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Excerpt</label>
            <input
              type="text"
              value={getFieldValue("excerpt")}
              onChange={(e) => setFieldValue("excerpt", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
              placeholder="Brief summary..."
            />
          </div>

          {/* Translatable: Content */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Content * (HTML)</label>
            <textarea
              required={activeLang === "tr"}
              rows={12}
              value={getFieldValue("content")}
              onChange={(e) => setFieldValue("content", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none resize-none font-mono"
            />
          </div>

          {/* Non-translatable fields — only on TR tab */}
          {activeLang === "tr" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Cover Image URL</label>
                <input type="text" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Author</label>
                <input type="text" value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tags (comma-separated)</label>
                <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none" placeholder="AI, Engineering, News" />
              </div>
            </div>
          )}

          <div className="flex items-center gap-4">
            {activeLang === "tr" && (
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as any })}
                className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none">
                <option value="DRAFT">Draft</option>
                <option value="PUBLISHED">Published</option>
              </select>
            )}
            <button type="submit" disabled={saving}
              className="rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors disabled:opacity-60">
              {saving ? "Saving..." : "Update Post"}
            </button>
            <button type="button" onClick={() => router.push("/admin/blog")}
              className="rounded-lg border border-white/10 px-6 py-2.5 text-sm text-slate-400 hover:text-white transition-colors">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </AdminGuard>
  );
}
