"use client";
import { useEffect, useState } from "react";
import { isValidLocale, type Locale } from "@/lib/get-dictionary";
import { privacyText } from "@/lib/privacy-copy";
export default function FormPrivacyNotice({ purpose = "contact", locale: provided }: { purpose?: "contact" | "careers" | "newsletter"; locale?: Locale }) {
  const [detected, setDetected] = useState<Locale>("en");
  useEffect(() => { const lang = document.documentElement.lang; if (isValidLocale(lang)) setDetected(lang); }, []);
  const locale = provided || detected, t = privacyText(locale);
  return <span className="block text-xs text-muted-foreground leading-relaxed">Heptapus Group — {purpose === "careers" ? t.recruitment : purpose === "newsletter" ? t.newsletter : t.form}{" "}<a className="underline" href={`https://heptapusgroup.com/kvkk?lang=${locale}#${purpose}`}>{t.notice}</a>{" · "}<a className="underline" href={`https://heptapusgroup.com/consent?lang=${locale}`}>{t.consent}</a></span>;
}
