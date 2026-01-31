import { cookies, headers } from "next/headers";

export async function getServerLang() {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("lang")?.value;

  if (langCookie === "tr" || langCookie === "en") return langCookie;

  // Çerez yoksa tarayıcı diline bak
  const headerList = await headers();
  const acceptLang = headerList.get("accept-language");
  return acceptLang?.startsWith("tr") ? "tr" : "en";
}