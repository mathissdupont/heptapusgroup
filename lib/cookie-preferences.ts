export const COOKIE_PREFERENCE_KEY = "hepta.cookie-preferences.v1";
export const COOKIE_POLICY_VERSION = "2026-10-29";
export const COOKIE_PREFERENCE_DAYS = 180;
export const COOKIE_PREFERENCE_EVENT = "hepta:cookie-preferences";
export const COOKIE_SETTINGS_EVENT = "hepta:cookie-settings";
export type CookiePreferences = {
  version: string; necessary: true; externalMedia: boolean; savedAt: string; expiresAt: string;
};
export function parseCookiePreferences(raw: string | null, now = Date.now()): CookiePreferences | null {
  try {
    if (!raw) return null;
    const value = JSON.parse(raw);
    if (value.version !== COOKIE_POLICY_VERSION || value.necessary !== true || typeof value.externalMedia !== "boolean") return null;
    const saved = Date.parse(value.savedAt), expires = Date.parse(value.expiresAt);
    if (!Number.isFinite(saved) || !Number.isFinite(expires) || saved > now || expires <= now || expires - saved > COOKIE_PREFERENCE_DAYS * 86400000) return null;
    return { version: value.version, necessary: true, externalMedia: value.externalMedia, savedAt: value.savedAt, expiresAt: value.expiresAt };
  } catch { return null; }
}
export function newCookiePreferences(externalMedia: boolean, now = Date.now()): CookiePreferences {
  return { version: COOKIE_POLICY_VERSION, necessary: true, externalMedia, savedAt: new Date(now).toISOString(), expiresAt: new Date(now + COOKIE_PREFERENCE_DAYS * 86400000).toISOString() };
}
