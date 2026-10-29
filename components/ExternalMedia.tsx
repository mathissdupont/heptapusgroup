"use client";
import { useCookiePreferences, openCookiePreferences } from "@/hooks/useCookiePreferences";
import { privacyText } from "@/lib/privacy-copy";
import { useEffect, useState } from "react";
import { isValidLocale, type Locale } from "@/lib/get-dictionary";

export default function ExternalMedia({ youtubeId, videoUrl }: { youtubeId?: string; videoUrl?: string }) {
  const choice = useCookiePreferences();
  const [locale, setLocale] = useState<Locale>("en");
  useEffect(() => { const lang = document.documentElement.lang; if (isValidLocale(lang)) setLocale(lang); }, []);
  const t = privacyText(locale);
  if (!choice?.externalMedia) return <div className="media-consent-placeholder"><p>{t.blocked}</p><button type="button" onClick={openCookiePreferences}>{t.settings}</button></div>;
  if (videoUrl && /^https?:\/\//.test(videoUrl)) return <video controls playsInline preload="metadata" className="w-full aspect-video block" src={videoUrl} />;
  if (!youtubeId || !/^[a-zA-Z0-9_-]{11}$/.test(youtubeId)) return null;
  return <iframe className="w-full aspect-video border-0 block" src={`https://www.youtube-nocookie.com/embed/${youtubeId}?playsinline=1&rel=0`} allow="encrypted-media; picture-in-picture" allowFullScreen loading="lazy" title="YouTube" />;
}
