"use client";

import { FormEvent, useState } from "react";
import { useSWRConfig } from "swr";
import { loginAndVerify } from "@/lib/login-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { mutate } = useSWRConfig();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setMessage("");
    setSubmitting(true);

    try {
      const session = await loginAndVerify(email, password);
      await mutate("/api/auth/me", session, { revalidate: false });
      // A fresh document also discards prefetched anonymous admin responses.
      window.location.replace("/admin");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Sunucuya ulaşılamadı. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="admin-shell dark mx-auto flex min-h-[70vh] w-[92%] max-w-sm items-center py-12 text-slate-200">
      <div className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl">
        <h1 className="text-2xl font-bold">Yönetim paneli</h1>
        <p className="mt-1 text-sm text-slate-400">Yetkili hesabınızla giriş yapın.</p>
        <p className="mt-3 text-xs leading-relaxed text-slate-500">Yeni panel hesapları mevcut bir yönetici tarafından Kullanıcılar bölümünden oluşturulur.</p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block text-sm text-slate-300">
            E-posta
            <input
              required
              type="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500/60"
            />
          </label>
          <label className="block text-sm text-slate-300">
            Şifre
            <input
              required
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-1 w-full rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-white outline-none focus:border-sky-500/60"
            />
          </label>

          {message && (
            <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-[var(--brand-royal-violet)] px-4 py-2.5 font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </form>
      </div>
    </main>
  );
}
