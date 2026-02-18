export type Locale = 'tr' | 'en' | 'de';

export const SUPPORTED_LOCALES: Locale[] = ['tr', 'en', 'de'];

export const LOCALE_LABELS: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
  de: 'Deutsch',
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  tr: '🇹🇷',
  en: '🇬🇧',
  de: '🇩🇪',
};

const dictionaries: Record<Locale, () => Promise<any>> = {
  en: () => import('../dictionaries/en.json').then((module) => module.default),
  tr: () => import('../dictionaries/tr.json').then((module) => module.default),
  de: () => import('../dictionaries/de.json').then((module) => module.default),
};

export function isValidLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()

// Static dictionary imports for server components that need synchronous access
import tr from '../dictionaries/tr.json';
import en from '../dictionaries/en.json';
import de from '../dictionaries/de.json';

export type Dictionary = typeof tr;

const staticDictionaries: Record<Locale, Dictionary> = { tr, en, de };

/** Returns a map of all dictionaries for server-side use */
export function getDictionaries(): Record<Locale, Dictionary> {
  return staticDictionaries;
}

/** Get the client lang from document.cookie */
export function getClientLang(): Locale {
  if (typeof document === 'undefined') return 'tr';
  const cookie = document.cookie
    .split('; ')
    .find((row) => row.startsWith('lang='))
    ?.split('=')[1];
  if (cookie && isValidLocale(cookie)) return cookie;
  return 'tr';
}