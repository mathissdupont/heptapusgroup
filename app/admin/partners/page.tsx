"use client";

import { useEffect, useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import Image from "next/image";

interface Partner {
  id: string;
  name: string;
  logoUrl: string;
  website?: string | null;
  order: number;
  isActive: boolean;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: "", logoUrl: "", website: "", order: 0 });
  const [editId, setEditId] = useState<string | null>(null);

  const fetchPartners = () => {
    fetch("/api/partners")
      .then((r) => r.json())
      .then((d) => setPartners(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(fetchPartners, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await fetch(`/api/partners/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    } else {
      await fetch("/api/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
    }
    setForm({ name: "", logoUrl: "", website: "", order: 0 });
    setEditId(null);
    fetchPartners();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this partner?")) return;
    await fetch(`/api/partners/${id}`, { method: "DELETE" });
    fetchPartners();
  };

  const handleEdit = (p: Partner) => {
    setEditId(p.id);
    setForm({ name: p.name, logoUrl: p.logoUrl, website: p.website || "", order: p.order });
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-white">Partners</h1>

        {/* Form */}
        <form onSubmit={handleSubmit} className="rounded-xl border border-white/10 bg-slate-800/50 p-6 space-y-4">
          <h2 className="text-lg font-semibold text-white">{editId ? "Edit Partner" : "Add Partner"}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              type="text"
              placeholder="Partner Name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <input
              type="text"
              placeholder="Logo URL"
              required
              value={form.logoUrl}
              onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
              className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:ring-2 focus:ring-sky-500 outline-none"
            />
            <input
              type="text"
              placeholder="Website URL (optional)"
              value={form.website}
              onChange={(e) => setForm({ ...form, website: e.target.value })}
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
          <div className="flex gap-2">
            <button type="submit" className="rounded-lg bg-sky-500 px-5 py-2 text-sm font-semibold text-white hover:bg-sky-600 transition-colors">
              {editId ? "Update" : "Add"}
            </button>
            {editId && (
              <button type="button" onClick={() => { setEditId(null); setForm({ name: "", logoUrl: "", website: "", order: 0 }); }} className="rounded-lg border border-white/10 px-5 py-2 text-sm text-slate-400 hover:text-white transition-colors">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* List */}
        {loading ? (
          <div className="text-slate-400">Loading...</div>
        ) : partners.length === 0 ? (
          <div className="text-slate-400 text-center py-8">No partners added yet.</div>
        ) : (
          <div className="space-y-3">
            {partners.map((p) => (
              <div key={p.id} className="flex items-center gap-4 rounded-xl border border-white/10 bg-slate-800/50 p-4">
                <div className="h-10 w-20 relative flex-shrink-0">
                  <Image src={p.logoUrl} alt={p.name} fill className="object-contain" unoptimized />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white">{p.name}</div>
                  {p.website && <div className="text-xs text-slate-400 truncate">{p.website}</div>}
                </div>
                <span className="text-xs text-slate-500">#{p.order}</span>
                <button onClick={() => handleEdit(p)} className="text-xs text-sky-400 hover:text-sky-300">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-300">Delete</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminGuard>
  );
}
