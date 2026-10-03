"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setSubmitting(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        setMessage(result.error || "Giriş yapılamadı.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setMessage("Sunucuya ulaşılamadı. Lütfen tekrar deneyin.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-[70vh] w-[92%] max-w-sm items-center py-12 text-slate-200">
      <div className="w-full rounded-2xl border border-white/10 bg-slate-900/70 p-6 shadow-2xl">
        <h1 className="text-2xl font-bold">Yönetim paneli</h1>
        <p className="mt-1 text-sm text-slate-400">Yetkili hesabınızla giriş yapın.</p>

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
            className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Giriş yapılıyor…" : "Giriş yap"}
          </button>
        </form>
      </div>
    </main>
  );
}
