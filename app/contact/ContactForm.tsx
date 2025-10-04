"use client";
import React, { useMemo, useState } from "react";

type Fields = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string; // honeypot
};

const MAX_LEN = 1000;
const MIN_MSG = 10;

export default function ContactForm() {
  const [values, setValues] = useState<Fields>({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "", // honeypot
  });
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const left = useMemo(() => MAX_LEN - values.message.length, [values.message]);
  const weak =
    values.message.trim().length < MIN_MSG ||
    !values.name.trim() ||
    !values.subject.trim() ||
    !/^\S+@\S+\.\S+$/.test(values.email);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // honeypot: botlar doldurursa kaydetme
    if (values.website) {
      setErr("Spam şüphesi.");
      return;
    }

    setPending(true);
    setOk(false);
    setErr(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject.trim(),
          message: values.message.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Kaydetme hatası");
      setOk(true);
      setValues({ name: "", email: "", subject: "", message: "", website: "" });
    } catch (e: any) {
      setErr(e.message || "Bilinmeyen hata");
    } finally {
      setPending(false);
    }
  }

  const label = "block text-sm font-medium text-slate-300";
  const input =
    "w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-slate-100 placeholder:text-slate-400 outline-none " +
    "focus:border-sky-400/40 focus:ring-2 focus:ring-sky-400/20 disabled:opacity-60";
  const card =
    "rounded-2xl border border-white/10 bg-gradient-to-b from-slate-900/40 to-slate-900/10 p-5 sm:p-6";

  return (
    <div className={card}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-slate-100" style={{textAlign:"center" }}>Bize Yaz</h2>
        <p className="text-sm text-slate-400" style={{textAlign:"center" }}>
          Sorun, istek veya iş birliği için formu doldurabilirsin.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        {/* Honeypot (gizli) */}
        <div className="hidden">
          <label>
            Website
            <input
              name="website"
              autoComplete="off"
              value={values.website}
              onChange={(e) => setValues((s) => ({ ...s, website: e.target.value }))}
            />
          </label>
        </div>

        {/* Ad Soyad + E-posta */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={label} htmlFor="name">
              Ad Soyad
            </label>
            <input
              id="name"
              className={input}
              placeholder="Ad Soyad"
              value={values.name}
              onChange={(e) => setValues((s) => ({ ...s, name: e.target.value }))}
              required
              disabled={pending}
            />
          </div>
          <div>
            <label className={label} htmlFor="email">
              E-posta
            </label>
            <input
              id="email"
              className={input}
              type="email"
              placeholder="ornek@eposta.com"
              value={values.email}
              onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
              required
              disabled={pending}
            />
          </div>
        </div>

        {/* Konu */}
        <div>
          <label className={label} htmlFor="subject">
            Konu
          </label>
          <input
            id="subject"
            className={input}
            placeholder="Kısa bir başlık"
            value={values.subject}
            onChange={(e) => setValues((s) => ({ ...s, subject: e.target.value }))}
            required
            disabled={pending}
          />
        </div>

        {/* Mesaj */}
        <div>
          <div className="flex items-end justify-between">
            <label className={label} htmlFor="message">
              Mesaj
            </label>
            <span
              className={`text-xs ${left < 0 ? "text-rose-400" : "text-slate-400"}`}
            >
              {Math.max(left, 0)} karakter kaldı
            </span>
          </div>
          <textarea
            id="message"
            className={`${input} min-h-[140px] resize-y`}
            placeholder="İhtiyacını birkaç cümleyle anlatabilirsin…"
            value={values.message}
            onChange={(e) =>
              setValues((s) => ({
                ...s,
                message: e.target.value.slice(0, MAX_LEN),
              }))
            }
            required
            disabled={pending}
          />
          {values.message && values.message.length < MIN_MSG && (
            <p className="mt-1 text-xs text-amber-400">
              Mesaj çok kısa. En az {MIN_MSG} karakter yaz.
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending || weak}
            className={[
              "inline-flex items-center rounded-xl px-4 py-2 font-semibold text-slate-900",
              "bg-gradient-to-r from-sky-400 to-violet-400",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              "shadow-[0_6px_30px_rgba(56,189,248,.15)]",
            ].join(" ")}
          >
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-20"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-90"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                Gönderiliyor…
              </span>
            ) : (
              "Gönder"
            )}
          </button>

          <button
            type="button"
            onClick={() =>
              setValues({ name: "", email: "", subject: "", message: "", website: "" })
            }
            disabled={pending}
            className="rounded-xl border border-white/10 px-4 py-2 text-slate-200 hover:bg-white/5 disabled:opacity-60"
          >
            Temizle
          </button>
        </div>

        {/* Alerts */}
        {ok && (
          <div className="rounded-lg border border-emerald-400/20 bg-emerald-500/10 p-3 text-emerald-300">
            Mesaj kaydedildi. En kısa sürede dönüş yapacağız.
          </div>
        )}
        {err && (
          <div className="rounded-lg border border-rose-400/20 bg-rose-500/10 p-3 text-rose-300">
            Hata: {err}
          </div>
        )}
      </form>

      {/* Küçük dipnot */}
      <p className="mt-4 text-xs text-slate-400">
        Gönderilen iletiler yalnızca ekip içinde görüntülenir ve üçüncü taraflarla
        paylaşılmaz.
      </p>
    </div>
  );
}
