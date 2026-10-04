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
  isActive: boolean;
  createdAt: string;
};
type UsersResponse = { items: User[]; currentUserId: string; total: number; page: number; totalPages: number };

const EMPTY_USER = { email: "", name: "", password: "", role: "VIEWER" as Role };

export default function UsersPage() {
  return (
    <AdminGuard allow={["ADMIN"]}>
      <UsersInner />
    </AdminGuard>
  );
}

function UsersInner() {
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(1);
  const params = new URLSearchParams({ q: query, page: String(page) });
  if (roleFilter) params.set("role", roleFilter);
  if (statusFilter) params.set("status", statusFilter);
  const { data, error: loadError, isLoading, mutate } = useSWR<UsersResponse>(
    `/api/admin/users?${params}`,
    jfetch,
  );
  const [adding, setAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [newUser, setNewUser] = useState(EMPTY_USER);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [resetUser, setResetUser] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState("");

  function showError(error: unknown) {
    setMessage({
      type: "error",
      text: error instanceof Error ? error.message : "İşlem tamamlanamadı.",
    });
  }

  async function setRole(id: string, role: Role) {
    setMessage(null);
    setBusyId(id);
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
    } finally {
      setBusyId(null);
    }
  }

  async function updateAccount(user: User, changes: { isActive: boolean } | { password: string }) {
    setMessage(null);
    setBusyId(user.id);
    try {
      await jfetch("/api/admin/users", { method: "PUT", body: JSON.stringify({ id: user.id, ...changes }) });
      setResetUser(null);
      setResetPassword("");
      await mutate();
      setMessage({ type: "success", text: "Hesap güncellendi. Eski oturumlar kapatıldı." });
    } catch (error) {
      showError(error);
    } finally {
      setBusyId(null);
    }
  }

  async function deleteUser(user: User) {
    if (!confirm(`${user.email} kullanıcısı silinsin mi?`)) return;

    setMessage(null);
    setBusyId(user.id);
    try {
      await jfetch(`/api/admin/users?id=${encodeURIComponent(user.id)}`, { method: "DELETE" });
      await mutate();
      setMessage({ type: "success", text: "Kullanıcı silindi." });
    } catch (error) {
      showError(error);
    } finally {
      setBusyId(null);
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

      <div className="flex flex-col gap-3 sm:flex-row">
        <input aria-label="Kullanıcı ara" placeholder="E-posta veya isim ara" value={query}
          onChange={(event) => { setQuery(event.target.value); setPage(1); }}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-white" />
        <select aria-label="Rol filtresi" value={roleFilter} onChange={(event) => { setRoleFilter(event.target.value); setPage(1); }} className="rounded-lg bg-slate-900 px-3 py-2 text-white">
          <option value="">Tüm roller</option><option>ADMIN</option><option>EDITOR</option><option>VIEWER</option>
        </select>
        <select aria-label="Hesap durumu filtresi" value={statusFilter} onChange={(event) => { setStatusFilter(event.target.value); setPage(1); }} className="rounded-lg bg-slate-900 px-3 py-2 text-white">
          <option value="">Tüm hesaplar</option><option value="active">Aktif</option><option value="inactive">Devre dışı</option>
        </select>
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
                      {!user.isActive && <span className="rounded bg-rose-500/10 px-2 py-0.5 text-xs text-rose-300">Devre dışı</span>}
                    </div>
                    <div className="mt-1 text-sm text-slate-400">{user.name || "İsim belirtilmemiş"}</div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      aria-label={`${user.email} rolü`}
                      value={user.role}
                      disabled={isCurrentUser || busyId !== null}
                      onChange={(event) => setRole(user.id, event.target.value as Role)}
                      className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm text-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="ADMIN">ADMIN</option>
                      <option value="EDITOR">EDITOR</option>
                      <option value="VIEWER">VIEWER</option>
                    </select>
                    <button type="button" disabled={isCurrentUser || busyId !== null}
                      onClick={() => updateAccount(user, { isActive: !user.isActive })}
                      className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 disabled:opacity-40">
                      {user.isActive ? "Devre dışı bırak" : "Etkinleştir"}
                    </button>
                    <button type="button" disabled={isCurrentUser || busyId !== null}
                      onClick={() => { setResetUser(user); setResetPassword(""); setMessage(null); }}
                      className="rounded-lg border border-white/10 px-3 py-2 text-sm text-slate-200 disabled:opacity-40">Şifre yenile</button>
                    <button
                      type="button"
                      disabled={isCurrentUser || busyId !== null}
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

      {data && <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-300">
        <span>{data.total} kullanıcı · Sayfa {data.page} / {data.totalPages}</span>
        <div className="flex gap-2">
          <button disabled={page <= 1 || isLoading} onClick={() => setPage(page - 1)} className="rounded border border-white/10 px-3 py-2 disabled:opacity-40">Önceki</button>
          <button disabled={page >= data.totalPages || isLoading} onClick={() => setPage(page + 1)} className="rounded border border-white/10 px-3 py-2 disabled:opacity-40">Sonraki</button>
        </div>
      </div>}

      {resetUser && <form onSubmit={(event) => { event.preventDefault(); void updateAccount(resetUser, { password: resetPassword }); }}
        className="space-y-3 rounded-xl border border-white/10 bg-slate-900 p-5">
        <h2 className="font-semibold text-white">{resetUser.email} — şifre yenile</h2>
        <p className="text-sm text-slate-400">En az 10 karakter kullanın. Bu işlem hesabın tüm oturumlarını kapatır.</p>
        <label className="block text-sm text-slate-300">Yeni şifre
          <input required minLength={10} type="password" autoComplete="new-password" value={resetPassword}
            onChange={(event) => setResetPassword(event.target.value)} className="mt-1 w-full rounded-lg bg-slate-950 px-3 py-2 text-white" />
        </label>
        <div className="flex gap-2">
          <button disabled={busyId !== null} className="rounded-lg bg-sky-600 px-4 py-2 text-white disabled:opacity-40">Şifreyi güncelle</button>
          <button type="button" disabled={busyId !== null} onClick={() => { setResetUser(null); setResetPassword(""); }} className="rounded-lg border border-white/10 px-4 py-2 text-slate-300">İptal</button>
        </div>
      </form>}

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
