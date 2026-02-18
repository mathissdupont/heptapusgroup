/**
 * i18n utility for handling multilingual content from database models.
 * 
 * Models store the default language (Turkish) in their main fields (title, summary, etc.)
 * and translations for other languages in a `translations` JSON field:
 * {
 *   "en": { "title": "English Title", "summary": "English Summary", "content": "..." },
 *   "de": { "title": "German Title", "summary": "German Summary", "content": "..." }
 * }
 */

import { type Locale } from "./get-dictionary";

/** The default language — main fields in the database are in this language */
export const DEFAULT_LOCALE: Locale = "tr";

type TranslationsMap = Record<string, Record<string, string>>;

/**
 * Get a translated field from a database record.
 * Falls back to the default field value if no translation exists.
 */
export function getTranslatedField<T extends Record<string, any>>(
  record: T,
  field: keyof T & string,
  locale: Locale
): string {
  // If requesting default locale, return the main field
  if (locale === DEFAULT_LOCALE) {
    return (record[field] as string) || "";
  }

  // Try to get from translations
  const translations = parseTranslations(record.translations);
  const localeTranslations = translations[locale];
  
  if (localeTranslations && localeTranslations[field]) {
    return localeTranslations[field];
  }

  // Fallback to default field
  return (record[field] as string) || "";
}

/**
 * Get all translatable fields for a record in a given locale.
 * Returns an object with the translated values.
 */
export function getTranslatedRecord<T extends Record<string, any>>(
  record: T,
  fields: string[],
  locale: Locale
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of fields) {
    result[field] = getTranslatedField(record, field, locale);
  }
  return result;
}

/**
 * Parse the translations JSON field, handling both string and object formats.
 */
export function parseTranslations(translations: unknown): TranslationsMap {
  if (!translations) return {};
  if (typeof translations === "string") {
    try {
      return JSON.parse(translations);
    } catch {
      return {};
    }
  }
  if (typeof translations === "object") {
    return translations as TranslationsMap;
  }
  return {};
}

/**
 * Build a translations JSON object for saving to the database.
 * Takes a map of locale -> fields and produces the translations JSON.
 */
export function buildTranslations(
  localeData: Record<string, Record<string, string>>
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};
  
  for (const [locale, fields] of Object.entries(localeData)) {
    if (locale === DEFAULT_LOCALE) continue; // Default locale uses main fields
    
    const nonEmpty: Record<string, string> = {};
    for (const [key, value] of Object.entries(fields)) {
      if (value && value.trim()) {
        nonEmpty[key] = value.trim();
      }
    }
    
    if (Object.keys(nonEmpty).length > 0) {
      result[locale] = nonEmpty;
    }
  }
  
  return result;
}
