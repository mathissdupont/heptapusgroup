"use client";
import AdminGuard from "@/components/AdminGuard";
import useSWR from "swr";
import { jfetch } from "@/lib/fetcher";
import { useState } from "react";

type User = { id: string; email: string; name?: string | null; role: "ADMIN" | "EDITOR" | "VIEWER" };

export default function UsersPage() {
  return (
    <AdminGuard allow={["ADMIN"]}>
      <UsersInner />
    </AdminGuard>
  );
}

function UsersInner() {
  const { data, mutate } = useSWR<{ items: User[] }>("/api/admin/users", jfetch);
  const [adding, setAdding] = useState(false);
  const [newUser, setNewUser] = useState({ email: "", name: "", password: "", role: "VIEWER" as User["role"] });

  async function setRole(id: string, role: User["role"]) {
    await jfetch("/api/admin/users", { method: "PUT", body: JSON.stringify({ id, role }) });
    mutate();
  }

  async function deleteUser(id: string) {
    if (!confirm("Bu kullanıcı silinsin mi?")) return;
    await jfetch(`/api/admin/users/${id}`, { method: "DELETE" });
    mutate();
  }

  async function addUser() {
    if (!newUser.email || !newUser.password) {
      alert("Email ve şifre gerekli");
      return;
    }
    await jfetch("/api/admin/users", { method: "POST", body: JSON.stringify(newUser) });
    setNewUser({ email: "", name: "", password: "", role: "VIEWER" });
    setAdding(false);
    mutate();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Kullanıcılar</h1>
        <button
          onClick={() => setAdding(true)}
          className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-500"
        >
          + Yeni Kullanıcı
        </button>
      </div>

      {/* Kullanıcı listesi */}
      <div className="rounded border border-white/10 divide-y divide-white/10 bg-slate-900/40">
        {data?.items?.length ? (
          data.items.map((u) => (
            <div
              key={u.id}
              className="p-3 flex items-center justify-between hover:bg-white/5 transition"
            >
              <div>
                <div className="font-semibold">{u.email}</div>
                <div className="text-slate-400 text-sm">{u.name || "—"}</div>
              </div>

              <div className="flex gap-2 items-center">
                <select
                  value={u.role}
                  onChange={(e) => setRole(u.id, e.target.value as User["role"])}
                  className="px-3 py-1 bg-transparent border border-white/10 rounded"
                >
                  <option>ADMIN</option>
                  <option>EDITOR</option>
                  <option>VIEWER</option>
                </select>
                <button
                  onClick={() => deleteUser(u.id)}
                  className="px-3 py-1.5 rounded bg-rose-600 text-white hover:bg-rose-500"
                >
                  Sil
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="p-3 text-slate-400">Kayıt yok.</div>
        )}
      </div>

      {/* Yeni kullanıcı ekleme formu */}
      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-slate-900 border border-white/10 rounded-lg p-6 w-[420px] space-y-4">
            <h2 className="text-lg font-bold">Yeni Kullanıcı Ekle</h2>

            <input
              value={newUser.email}
              onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              placeholder="Email"
              className="w-full px-3 py-2 bg-transparent border border-white/10 rounded"
            />
            <input
              value={newUser.name}
              onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              placeholder="İsim"
              className="w-full px-3 py-2 bg-transparent border border-white/10 rounded"
            />
            <input
              type="password"
              value={newUser.password}
              onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              placeholder="Şifre"
              className="w-full px-3 py-2 bg-transparent border border-white/10 rounded"
            />
            <select
              value={newUser.role}
              onChange={(e) => setNewUser({ ...newUser, role: e.target.value as User["role"] })}
              className="w-full px-3 py-2 bg-transparent border border-white/10 rounded"
            >
              <option value="ADMIN">ADMIN</option>
              <option value="EDITOR">EDITOR</option>
              <option value="VIEWER">VIEWER</option>
            </select>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setAdding(false)}
                className="px-3 py-2 rounded border border-white/10"
              >
                İptal
              </button>
              <button
                onClick={addUser}
                className="px-3 py-2 rounded bg-emerald-600 text-white hover:bg-emerald-500"
              >
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
