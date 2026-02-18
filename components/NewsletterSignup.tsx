"use client";

import { useState, useCallback } from "react";
import { Send } from "lucide-react";
import Turnstile from "@/components/Turnstile";

interface NewsletterSignupProps {
  t?: { title: string; placeholder: string; success: string; error: string };
}

export default function NewsletterSignup({ t }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const onTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const onTurnstileExpire = useCallback(() => setTurnstileToken(null), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstileToken }),
      });
      if (res.ok) {
        setStatus("success");
        setEmail("");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  return (
    <div>
      <h4 className="text-sm font-semibold text-foreground mb-3">{t?.title ?? "Newsletter"}</h4>
      <p className="text-sm text-muted-foreground mb-4">
        {t?.title ?? "Stay updated with the latest from Heptapus Group."}
      </p>
      {status === "success" ? (
        <p className="text-sm text-green-600 dark:text-green-400 font-medium">
          ✓ {t?.success ?? "Subscribed successfully!"}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="email"
              required
              placeholder={t?.placeholder ?? "your@email.com"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 min-w-0 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:ring-2 focus:ring-ring focus:border-transparent outline-none transition-shadow"
            />
            <button
              type="submit"
              disabled={status === "sending" || !turnstileToken}
              className="inline-flex items-center rounded-lg bg-foreground px-3 py-2 text-background hover:opacity-90 transition-opacity disabled:opacity-60"
              aria-label="Subscribe"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <Turnstile
            onVerify={onTurnstileVerify}
            onExpire={onTurnstileExpire}
          />
        </form>
      )}
      {status === "error" && (
        <p className="text-xs text-red-600 dark:text-red-400 mt-2">{t?.error ?? "Something went wrong. Try again."}</p>
      )}
    </div>
  );
}
