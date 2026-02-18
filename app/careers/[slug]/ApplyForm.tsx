"use client";

import { useState, useCallback } from "react";
import Turnstile from "@/components/Turnstile";

export default function ApplyForm({ slug }: { slug: string }) {
  const [form, setForm] = useState({ name: "", email: "", phone: "", coverLetter: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const onTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const onTurnstileExpire = useCallback(() => setTurnstileToken(null), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch(`/api/careers/${slug}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, turnstileToken }),
      });
      if (res.ok) {
        setStatus("success");
        setForm({ name: "", email: "", phone: "", coverLetter: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="text-center py-8">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-50 dark:bg-green-950/30 mb-4">
          <svg className="h-6 w-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="font-semibold text-foreground">Application Submitted!</p>
        <p className="text-sm text-muted-foreground mt-1">We'll be in touch soon.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-shadow"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">Email *</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-shadow"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Phone</label>
        <input
          type="tel"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-shadow"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-foreground mb-1">Cover Letter</label>
        <textarea
          rows={5}
          value={form.coverLetter}
          onChange={(e) => setForm({ ...form, coverLetter: e.target.value })}
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-shadow resize-none"
          placeholder="Tell us about yourself and why you'd be a great fit..."
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-red-700 dark:text-red-400">Something went wrong. Please try again.</p>
      )}

      <Turnstile
        onVerify={onTurnstileVerify}
        onExpire={onTurnstileExpire}
      />

      <button
        type="submit"
        disabled={status === "sending" || !turnstileToken}
        className="inline-flex items-center rounded-lg px-6 py-2.5 font-semibold bg-foreground text-background hover:opacity-90 transition-colors shadow-sm disabled:opacity-60"
      >
        {status === "sending" ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}
