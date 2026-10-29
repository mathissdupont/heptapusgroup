"use client";

import { useEffect, useId, useRef, useState } from "react";
import { COOKIE_SETTINGS_EVENT } from "@/lib/cookie-preferences";
import { saveCookiePreferences, useCookiePreferences } from "@/hooks/useCookiePreferences";
import { privacyText } from "@/lib/privacy-copy";
import type { Locale } from "@/lib/get-dictionary";

export default function CookieConsent({ locale }: { locale: Locale }) {
  const choice = useCookiePreferences();
  const t = privacyText(locale);
  const [mounted, setMounted] = useState(false);
  const [media, setMedia] = useState(false);
  const [error, setError] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const heading = useId();
  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    function open() { setMedia(choice?.externalMedia || false); dialog.current?.showModal(); }
    window.addEventListener(COOKIE_SETTINGS_EVENT, open);
    return () => window.removeEventListener(COOKIE_SETTINGS_EVENT, open);
  }, [choice?.externalMedia]);
  function save(enabled: boolean) {
    setError(!saveCookiePreferences(enabled));
    dialog.current?.close();
  }
  function open() { setMedia(choice?.externalMedia || false); dialog.current?.showModal(); }
  return <>
    {mounted && !choice && <section className="cookie-banner" aria-label={t.title}>
      <div className="cookie-banner-copy"><p>{t.intro}</p><a href={`https://heptapusgroup.com/cookies?lang=${locale}`}>{t.policy}</a></div>
      <div className="cookie-actions"><button type="button" onClick={() => save(false)}>{t.reject}</button><button type="button" onClick={open}>{t.settings}</button><button type="button" onClick={() => save(true)}>{t.accept}</button></div>
    </section>}
    {mounted && choice && <button type="button" className="cookie-reopen" onClick={open}>{t.settings}</button>}
    {error && <p role="status" className="cookie-storage-error">{t.storageError}</p>}
    <dialog ref={dialog} aria-labelledby={heading} className="cookie-dialog">
      <div className="cookie-dialog-header"><h2 id={heading}>{t.title}</h2><button type="button" onClick={() => dialog.current?.close()} aria-label={t.close}>✕</button></div>
      <div className="cookie-dialog-content">
      <p>{t.intro}</p>
      <section><div className="cookie-category"><h3>{t.necessary}</h3><span>{t.required}</span></div><p>{t.necessaryText}</p></section>
      <section><label className="cookie-category"><span>{t.media}</span><input type="checkbox" checked={media} onChange={event => setMedia(event.target.checked)} /></label><p>{t.mediaText}</p></section>
      <section><h3>{t.unused}</h3><p>{t.unusedText}</p></section>
      <p>{t.lifetime}</p>
      <div className="flex flex-wrap gap-4 text-sm underline"><a href={`https://heptapusgroup.com/cookies?lang=${locale}`}>{t.policy}</a><a href={`https://heptapusgroup.com/kvkk?lang=${locale}`}>{t.notice}</a></div>
      </div>
      <div className="cookie-actions mt-6"><button type="button" onClick={() => save(false)}>{t.reject}</button><button type="button" onClick={() => save(media)}>{t.save}</button><button type="button" onClick={() => save(true)}>{t.accept}</button></div>
    </dialog>
  </>;
}
