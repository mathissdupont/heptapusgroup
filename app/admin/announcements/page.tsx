"use client";

import { useState, useEffect, useCallback } from "react";
import AdminGuard from "@/components/AdminGuard";

interface Announcement {
  id: string;
  message: string;
  linkUrl: string | null;
  linkText: string | null;
  bgColor: string;
  isActive: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

const BG_COLORS = ["violet", "blue", "green", "red", "yellow"] as const;

const emptyForm = {
  message: "",
  linkUrl: "",
  linkText: "",
  bgColor: "violet",
  isActive: true,
  startsAt: "",
  endsAt: "",
};

export default function AdminAnnouncementsPage() {
  const [items, setItems] = useState<Announcement[]>([]);
  const [form, setForm] = useState({ ...emptyForm });
  const [editId, setEditId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch("/api/admin/announcements");
    if (res.ok) {
      const data = await res.json();
      setItems(Array.isArray(data) ? data : data.items ?? []);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        startsAt: form.startsAt || null,
        endsAt: form.endsAt || null,
        linkUrl: form.linkUrl || null,
        linkText: form.linkText || null,
      };
      if (editId) {
        await fetch(`/api/admin/announcements/${editId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/admin/announcements", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }
      setForm({ ...emptyForm });
      setEditId(null);
      setShowForm(false);
      load();
    } catch {
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (a: Announcement) => {
    setForm({
      message: a.message,
      linkUrl: a.linkUrl || "",
      linkText: a.linkText || "",
      bgColor: a.bgColor,
      isActive: a.isActive,
      startsAt: a.startsAt ? a.startsAt.slice(0, 16) : "",
      endsAt: a.endsAt ? a.endsAt.slice(0, 16) : "",
    });
    setEditId(a.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this announcement?")) return;
    await fetch(`/api/admin/announcements/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Announcements</h1>
          <button
            onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ ...emptyForm }); }}
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors"
          >
            {showForm ? "Cancel" : "+ New"}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-slate-800/50 p-6 space-y-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Message *</label>
              <input
                type="text"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none"
                placeholder="Important announcement text..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Link URL</label>
                <input
                  type="text"
                  value={form.linkUrl}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Link Text</label>
                <input
                  type="text"
                  value={form.linkText}
                  onChange={(e) => setForm({ ...form, linkText: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none"
                  placeholder="Learn more →"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Color</label>
                <select
                  value={form.bgColor}
                  onChange={(e) => setForm({ ...form, bgColor: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none"
                >
                  {BG_COLORS.map((c) => (
                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Starts At</label>
                <input
                  type="datetime-local"
                  value={form.startsAt}
                  onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Ends At</label>
                <input
                  type="datetime-local"
                  value={form.endsAt}
                  onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-sky-500 outline-none"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 text-sm text-slate-300">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                  className="rounded border-white/20 bg-slate-900"
                />
                Active
              </label>
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-sky-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-600 transition-colors disabled:opacity-60"
              >
                {saving ? "Saving..." : editId ? "Update" : "Create"}
              </button>
            </div>
          </form>
        )}

        <div className="space-y-3">
          {items.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-800/50 px-5 py-4">
              <div className="flex items-center gap-3">
                <span className={`inline-block w-3 h-3 rounded-full ${
                  a.bgColor === "violet" ? "bg-violet-500" :
                  a.bgColor === "blue" ? "bg-blue-500" :
                  a.bgColor === "green" ? "bg-green-500" :
                  a.bgColor === "red" ? "bg-red-500" : "bg-yellow-500"
                }`} />
                <span className={`text-sm ${a.isActive ? "text-white" : "text-slate-500"}`}>{a.message}</span>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEdit(a)} className="text-sky-400 hover:text-sky-300 text-xs">Edit</button>
                <button onClick={() => handleDelete(a.id)} className="text-red-400 hover:text-red-300 text-xs">Delete</button>
              </div>
            </div>
          ))}
          {items.length === 0 && (
            <p className="text-center text-slate-500 py-8">No announcements yet</p>
          )}
        </div>
      </div>
    </AdminGuard>
  );
}
