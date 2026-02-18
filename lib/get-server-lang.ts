import { cookies, headers } from "next/headers";
import { type Locale, isValidLocale } from "./get-dictionary";

export async function getServerLang(): Promise<Locale> {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("lang")?.value;

  if (langCookie && isValidLocale(langCookie)) return langCookie;

  // Çerez yoksa tarayıcı diline bak
  const headerList = await headers();
  const acceptLang = headerList.get("accept-language") || "";
  
  if (acceptLang.startsWith("tr")) return "tr";
  if (acceptLang.startsWith("de")) return "de";
  return "en";
}