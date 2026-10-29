"use client";
import { useSyncExternalStore } from "react";
import { COOKIE_PREFERENCE_EVENT, COOKIE_PREFERENCE_KEY, COOKIE_SETTINGS_EVENT, newCookiePreferences, parseCookiePreferences } from "@/lib/cookie-preferences";

let memory: string | null = null;
let volatile = false;
function snapshot(): string | null {
  let raw = memory;
  if (!volatile) { try { raw = window.localStorage.getItem(COOKIE_PREFERENCE_KEY); } catch {} }
  return parseCookiePreferences(raw) ? raw : null;
}
function subscribe(listener: () => void) {
  const storage = (event: StorageEvent) => { if (event.key === null || event.key === COOKIE_PREFERENCE_KEY) { volatile = false; memory = null; listener(); } };
  const timer = window.setInterval(listener, 60_000);
  window.addEventListener(COOKIE_PREFERENCE_EVENT, listener);
  window.addEventListener("storage", storage);
  return () => { clearInterval(timer); window.removeEventListener(COOKIE_PREFERENCE_EVENT, listener); window.removeEventListener("storage", storage); };
}
export function useCookiePreferences() {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null);
  return parseCookiePreferences(raw);
}
export function saveCookiePreferences(externalMedia: boolean): boolean {
  memory = JSON.stringify(newCookiePreferences(externalMedia));
  let persisted = true;
  try { localStorage.setItem(COOKIE_PREFERENCE_KEY, memory); localStorage.removeItem("cookie-consent"); } catch { persisted = false; }
  volatile = !persisted;
  window.dispatchEvent(new Event(COOKIE_PREFERENCE_EVENT));
  return persisted;
}
export function openCookiePreferences() { window.dispatchEvent(new Event(COOKIE_SETTINGS_EVENT)); }
