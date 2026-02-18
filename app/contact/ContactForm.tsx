"use client";
import React, { useMemo, useState, useCallback } from "react";
import Turnstile from "@/components/Turnstile";

type Fields = {
  name: string;
  email: string;
  subject: string;
  message: string;
  website?: string;
};

const MAX_LEN = 1000;
const MIN_MSG = 10;

// t prop'u için tip tanımı
interface ContactFormProps {
  t: {
    title: string;
    description: string;
    name_label: string;
    name_placeholder: string;
    email_label: string;
    email_placeholder: string;
    subject_label: string;
    subject_placeholder: string;
    message_label: string;
    message_placeholder: string;
    chars_left: string;
    min_msg_warn: string;
    sending: string;
    send: string;
    clear: string;
    success: string;
    error_prefix: string;
    spam_err: string;
    footer_note: string;
  };
}

export default function ContactForm({ t }: ContactFormProps) {
  const [values, setValues] = useState<Fields>({
    name: "",
    email: "",
    subject: "",
    message: "",
    website: "",
  });
  const [pending, setPending] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const onTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const onTurnstileExpire = useCallback(() => setTurnstileToken(null), []);

  const left = useMemo(() => MAX_LEN - values.message.length, [values.message]);
  const weak =
    values.message.trim().length < MIN_MSG ||
    !values.name.trim() ||
    !values.subject.trim() ||
    !/^\S+@\S+\.\S+$/.test(values.email) ||
    !turnstileToken;

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (values.website) {
      setErr(t.spam_err);
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
          turnstileToken,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Save error");
      setOk(true);
      setValues({ name: "", email: "", subject: "", message: "", website: "" });
    } catch (error: any) {
      setErr(error.message || "Unknown error");
    } finally {
      setPending(false);
    }
  }

  const labelClass = "block text-sm font-medium text-foreground";
  const inputClass =
    "w-full rounded-xl border border-border bg-secondary/50 px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none " +
    "focus:border-primary/40 focus:ring-2 focus:ring-primary/20 disabled:opacity-60";
  const cardClass =
    "rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm";

  return (
    <div className={cardClass}>
      <div className="mb-4">
        <h2 className="text-xl font-bold text-card-foreground text-center">{t.title}</h2>
        <p className="text-sm text-muted-foreground text-center">{t.description}</p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4">
        {/* Honeypot */}
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

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="name">{t.name_label}</label>
            <input
              id="name"
              className={inputClass}
              placeholder={t.name_placeholder}
              value={values.name}
              onChange={(e) => setValues((s) => ({ ...s, name: e.target.value }))}
              required
              disabled={pending}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="email">{t.email_label}</label>
            <input
              id="email"
              className={inputClass}
              type="email"
              placeholder={t.email_placeholder}
              value={values.email}
              onChange={(e) => setValues((s) => ({ ...s, email: e.target.value }))}
              required
              disabled={pending}
            />
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="subject">{t.subject_label}</label>
          <input
            id="subject"
            className={inputClass}
            placeholder={t.subject_placeholder}
            value={values.subject}
            onChange={(e) => setValues((s) => ({ ...s, subject: e.target.value }))}
            required
            disabled={pending}
          />
        </div>

        <div>
          <div className="flex items-end justify-between">
            <label className={labelClass} htmlFor="message">{t.message_label}</label>
            <span className={`text-xs ${left < 0 ? "text-destructive" : "text-muted-foreground"}`}>
              {Math.max(left, 0)} {t.chars_left}
            </span>
          </div>
          <textarea
            id="message"
            className={`${inputClass} min-h-[140px] resize-y`}
            placeholder={t.message_placeholder}
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
            <p className="mt-1 text-xs text-yellow-700 dark:text-yellow-400">
              {t.min_msg_warn.replace("{min}", MIN_MSG.toString())}
            </p>
          )}
        </div>

        <Turnstile
          onVerify={onTurnstileVerify}
          onExpire={onTurnstileExpire}
        />

        <div className="mt-2 flex items-center gap-3">
          <button
            type="submit"
            disabled={pending || weak}
            className="inline-flex items-center rounded-xl px-4 py-2 font-semibold bg-primary text-primary-foreground disabled:opacity-60 shadow-sm"
          >
            {pending ? (
              <span className="inline-flex items-center gap-2">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-90" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {t.sending}
              </span>
            ) : t.send}
          </button>

          <button
            type="button"
            onClick={() => setValues({ name: "", email: "", subject: "", message: "", website: "" })}
            disabled={pending}
            className="rounded-xl border border-border px-4 py-2 text-foreground hover:bg-secondary disabled:opacity-60"
          >
            {t.clear}
          </button>
        </div>

        {ok && (
          <div className="rounded-lg border border-green-200 dark:border-green-800/40 bg-green-50 dark:bg-green-950/20 p-3 text-green-700 dark:text-green-400">
            {t.success}
          </div>
        )}
        {err && (
          <div className="rounded-lg border border-red-200 dark:border-red-800/40 bg-red-50 dark:bg-red-950/20 p-3 text-red-700 dark:text-red-400">
            {t.error_prefix} {err}
          </div>
        )}
      </form>

      <p className="mt-4 text-xs text-muted-foreground">{t.footer_note}</p>
    </div>
  );
}