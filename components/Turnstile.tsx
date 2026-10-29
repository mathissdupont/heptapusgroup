"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { isValidLocale, type Locale } from "@/lib/get-dictionary";
import { privacyText } from "@/lib/privacy-copy";

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId: string) => void;
      remove: (widgetId: string) => void;
    };
  }
}

interface TurnstileProps {
  onVerify: (token: string) => void;
  onExpire?: () => void;
  className?: string;
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"; // test key fallback
let scriptPromise: Promise<void> | null = null;
function loadScript(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) scriptPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => { script.remove(); scriptPromise = null; reject(new Error("Verification unavailable")); };
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export default function Turnstile({ onVerify, onExpire, className }: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [failed, setFailed] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => { const lang = document.documentElement.lang; if (isValidLocale(lang)) setLocale(lang); }, []);
  const t = privacyText(locale);

  const renderWidget = useCallback(() => {
    if (!containerRef.current || !window.turnstile) return;
    if (widgetId.current) {
      window.turnstile.remove(widgetId.current);
    }
    widgetId.current = window.turnstile.render(containerRef.current, {
      sitekey: SITE_KEY,
      callback: onVerify,
      "expired-callback": () => onExpire?.(),
      "error-callback": () => onExpire?.(),
      theme: "auto",
      size: "compact",
    });
  }, [onVerify, onExpire]);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    loadScript().then(() => { if (!cancelled) renderWidget(); }).catch(() => { if (!cancelled) { setFailed(true); setEnabled(false); } });
    return () => { cancelled = true; };
  }, [enabled, renderWidget]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (widgetId.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetId.current);
        } catch {}
      }
    };
  }, []);

  return <div className={className}>
    <p className="text-xs text-muted-foreground leading-relaxed mb-3">{t.security} <a className="underline" href={`https://heptapusgroup.com/kvkk?lang=${locale}#security`}>{t.notice}</a></p>
    {!enabled && <button className="privacy-control" type="button" onClick={() => { setFailed(false); setEnabled(true); }}>{t.verify}</button>}
    {failed && <p role="alert" className="text-sm text-red-500">{locale === "tr" ? "Doğrulama yüklenemedi. Tekrar deneyebilir veya bize e-posta gönderebilirsiniz." : locale === "de" ? "Die Prüfung konnte nicht geladen werden. Versuchen Sie es erneut oder schreiben Sie uns eine E-Mail." : "Verification could not load. Retry or contact us by email."}</p>}
    <div ref={containerRef} />
  </div>;
}
