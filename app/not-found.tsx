import Link from "next/link";
import { getServerLang } from "@/lib/get-server-lang";
import { getDictionaries } from "@/lib/get-dictionary";

const dictionaries = getDictionaries();

const getLang = getServerLang;

export default async function NotFound() {
  const lang = await getLang();
  const t = dictionaries[lang].not_found;

  return (
    <section className="mx-auto flex min-h-[60vh] w-[92%] max-w-[1120px] flex-col items-center justify-center py-16 text-center">
      <img
        src="/icons/heptapus_logo_white.png"
        alt=""
        width={80}
        height={80}
        className="mb-6 dark:invert-0 invert opacity-40"
      />
      <h1 className="text-7xl font-black text-foreground mb-4">404</h1>
      <h2 className="text-2xl font-bold text-foreground mb-3">{t.title}</h2>
      <p className="text-muted-foreground max-w-md mb-8">{t.description}</p>
      <Link
        href="/"
        className="rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90 transition-opacity no-underline"
      >
        {t.go_home}
      </Link>
    </section>
  );
}
