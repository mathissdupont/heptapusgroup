"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import LanguageTabs from "@/components/LanguageTabs";
import { parseTranslations, buildTranslations } from "@/lib/i18n";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  order: number;
  isActive: boolean;
  translations?: any;
}

type TField = "question" | "answer";

export default function AdminFaqPage() {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ question: "", answer: "", category: "", order: 0 });
  const [translations, setTranslations] = useState<Record<string, Record<string, string>>>({
    en: { question: "", answer: "" },
    de: { question: "", answer: "" },
  });
  const [activeLang, setActiveLang] = useState("tr");
  const [editId, setEditId] = useState<string | null>(null);

  const fetchItems = () => {
    fetch("/api/faq")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchItems, []);

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
    tr: !!(form.question || form.answer),
    en: !!(translations.en?.question || translations.en?.answer),
    de: !!(translations.de?.question || translations.de?.answer),
  };

  const resetForm = () => {
    setForm({ question: "", answer: "", category: "", order: 0 });
    setTranslations({ en: { question: "", answer: "" }, de: { question: "", answer: "" } });
    setActiveLang("tr");
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, translations: buildTranslations(translations) };
    if (editId) {
      await fetch(`/api/faq/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/faq", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    }
    resetForm();
    fetchItems();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this FAQ item?")) return;
    await fetch(`/api/faq/${id}`, { method: "DELETE" });
    fetchItems();
  };

  const handleEdit = (item: FaqItem) => {
    setEditId(item.id);
    setForm({ question: item.question, answer: item.answer, category: item.category || "", order: item.order });
    const parsed = parseTranslations(item.translations);
    setTranslations({
      en: { question: parsed.en?.question || "", answer: parsed.en?.answer || "" },
      de: { question: parsed.de?.question || "", answer: parsed.de?.answer || "" },
    });
    setActiveLang("tr");
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">FAQ Management</h1>

        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-slate-800/50 p-6 space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-lg font-semibold text-white">{editId ? "Edit FAQ" : "Add FAQ"}</h2>
            <LanguageTabs activeLang={activeLang} onChangeLang={setActiveLang} populated={populated} />
          </div>

          {/* Translatable: Question */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Question{activeLang !== "tr" ? ` (${activeLang.toUpperCase()})` : ""}</label>
            <input
              type="text"
              placeholder="Question"
              required={activeLang === "tr"}
              value={getFieldValue("question")}
              onChange={(e) => setFieldValue("question", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
            />
          </div>

          {/* Translatable: Answer */}
          <div>
            <label className="block text-sm text-slate-400 mb-1">Answer{activeLang !== "tr" ? ` (${activeLang.toUpperCase()})` : ""}</label>
            <textarea
              placeholder="Answer"
              required={activeLang === "tr"}
              rows={4}
              value={getFieldValue("answer")}
              onChange={(e) => setFieldValue("answer", e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none resize-none"
            />
          </div>

          {/* Non-translatable: Category & Order — only on TR tab */}
          {activeLang === "tr" && (
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Category (optional)"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
              />
              <input
                type="number"
                placeholder="Order"
                value={form.order}
                onChange={(e) => setForm({ ...form, order: Number(e.target.value) })}
                className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
              />
            </div>
          )}

          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors">
              {editId ? "Update" : "Add"}
            </button>
            {editId && (
              <button type="button" onClick={resetForm} className="rounded-lg border border-white/10 px-5 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <div className="text-slate-400">Loading...</div>
        ) : items.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No FAQ items yet.</div>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className="rounded-xl border border-white/10 bg-slate-800/50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-white">{item.question}</div>
                    <div className="text-sm text-slate-400 mt-1 line-clamp-2">{item.answer}</div>
                    {item.category && <span className="inline-block mt-2 text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded">{item.category}</span>}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button onClick={() => handleEdit(item)} className="text-xs text-sky-400 hover:text-sky-300">Edit</button>
                    <button onClick={() => handleDelete(item.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
