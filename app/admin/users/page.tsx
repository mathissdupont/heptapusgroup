"use client";

import { FormEvent, useState } from "react";
import useSWR from "swr";
import AdminGuard from "@/components/AdminGuard";
import { jfetch } from "@/lib/fetcher";

type Role = "ADMIN" | "EDITOR" | "VIEWER";
type User = {
  id: string;
  email: string;
  name?: string | null;
  role: Role;
  createdAt: string;
};
type UsersResponse = { items: User[]; currentUserId: string };

const EMPTY_USER = { email: "", name: "", password: "", role: "VIEWER" as Role };

export default function UsersPage() {
  return (
    <AdminGuard allow={["ADMIN"]}>
      <UsersInner />
    </AdminGuard>
  );
}

function UsersInner() {
  const { data, error: loadError, isLoading, mutate } = useSWR<UsersResponse>(
    "/api/admin/users",
    jfetch,
  );
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newUser, setNewUser] = useState(EMPTY_USER);

  function showError(error: unknown) {
    setMessage({
      type: "error",
      text: error instanceof Error ? error.message : "İşlem tamamlanamadı.",
    });
  }

  async function setRole(id: string, role: Role) {
    setMessage(null);
    try {
      await jfetch("/api/admin/users", {
        method: "PUT",
        body: JSON.stringify({ id, role }),
      });
      await mutate();
      setMessage({ type: "success", text: "Kullanıcı rolü güncellendi." });
    } catch (error) {
      showError(error);
      await mutate();
    }
  }

  async function deleteUser(user: User) {
    if (!confirm(`${user.email} kullanıcısı silinsin mi?`)) return;

    setMessage(null);
    try {
      await jfetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, { method: "DELETE" });
      await mutate();
      setMessage({ type: "success", text: "Kullanıcı silindi." });
    } catch (error) {
      showError(error);
    }
  }

  async function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setSubmitting(true);

    try {
      await jfetch("/api/admin/users", {
        method: "POST",
        body: JSON.stringify(newUser),
      });
      setNewUser(EMPTY_USER);
      setAdding(false);
      await mutate();
      setMessage({ type: "success", text: "Kullanıcı başarıyla eklendi." });
    } catch (error) {
      showError(error);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Kullanıcılar</h1>
          <p className="mt-1 text-sm text-slate-400">Panel erişimi olan hesapları ve rollerini yönetin.</p>
        </div>
        <button
          type="button"
          onClick={() => {
            setMessage(null);
            setAdding(true);
          }}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500"
        >
          + Yeni kullanıcı
        </button>
      </div>

      {(message || loadError) && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${
            message?.type === "success"
              ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
              : "border-red-500/30 bg-red-500/10 text-red-300"
          }`}
        >
          {message?.text || (loadError instanceof Error ? loadError.message : "Kullanıcılar yüklenemedi.")}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-white/10 bg-slate-900/40">
        {isLoading ? (
          <div className="p-5 text-sm text-slate-400">Kullanıcılar yükleniyor…</div>
        ) : data?.items.length ? (
          <div className="divide-y divide-white/10">
            {data.items.map((user) => {
              const isCurrentUser = user.id === data.currentUserId;
              return (
                <div
                  key={user.id}
                  className="flex flex-col gap-3 p-4 transition hover:bg-white/5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-semibold text-white">{user.email}</span>
                      {isCurrentUser && (
                        <span className="rounded bg-sky-500/10 px-2 py-0.5 text-xs text-sky-300">Siz</span>
                      )}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">{user.name || "İsim belirtilmemiş"}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      aria-label={`${user.email} rolü`}
                      value={user.role}
                      disabled={isCurrentUser}
                      onChange={(event) => setRole(user.id, event.target.value as Role)}
                      className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                    <button
                      type="button"
                      disabled={isCurrentUser}
                      onClick={() => deleteUser(user)}
                      className="rounded-lg bg-rose-600 px-3 py-2 text-sm font-medium text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-5 text-sm text-slate-400">Kayıtlı kullanıcı bulunamadı.</div>
        )}
      </div>

      {adding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <form
            onSubmit={addUser}
            className="w-full max-w-md space-y-4 rounded-xl border border-white/10 bg-slate-900 p-6 shadow-2xl"
          >
            <div>
              <h2 className="text-lg font-bold text-white">Yeni kullanıcı ekle</h2>
              <p className="mt-1 text-sm text-slate-400">Şifre en az 10 karakter olmalıdır.</p>
            </div>

            <label className="block text-sm text-slate-300">
              E-posta
              <input
                required
                type="email"
                autoComplete="email"
                value={newUser.email}
                onChange={(event) => setNewUser({ ...newUser, email: event.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500/60"
              />
            </label>
            <label className="block text-sm text-slate-300">
              İsim
              <input
                value={newUser.name}
                onChange={(event) => setNewUser({ ...newUser, name: event.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500/60"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Şifre
              <input
                required
                minLength={10}
                type="password"
                autoComplete="new-password"
                value={newUser.password}
                onChange={(event) => setNewUser({ ...newUser, password: event.target.value })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500/60"
              />
            </label>
            <label className="block text-sm text-slate-300">
              Rol
              <select
                value={newUser.role}
                onChange={(event) => setNewUser({ ...newUser, role: event.target.value as Role })}
                className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500/60"
              >
                <option value="ADMIN">ADMIN</option>
                <option value="EDITOR">EDITOR</option>
                <option value="VIEWER">VIEWER</option>
              </select>
            </label>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                disabled={submitting}
                onClick={() => setAdding(false)}
                className="rounded-lg border border-white/10 px-4 py-2 text-sm text-slate-300 hover:bg-white/5"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {submitting ? "Kaydediliyor…" : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
