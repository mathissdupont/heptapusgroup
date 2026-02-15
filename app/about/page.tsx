import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import DecryptedText from "@/components/DecryptedText";
import Breadcrumb from "@/components/Breadcrumb";

// Sözlükler
import tr from "@/dictionaries/tr.json";
import en from "@/dictionaries/en.json";

const dictionaries = { tr, en };

// Dil tespit fonksiyonu
async function getLang() {
  const cookieStore = await cookies();
  const langCookie = cookieStore.get("lang")?.value;
  if (langCookie === "tr" || langCookie === "en") return langCookie;

  const headerList = await headers();
  return headerList.get("accept-language")?.startsWith("tr") ? "tr" : "en";
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  const t = dictionaries[lang].about;

  return {
    title: t.meta_title,
  };
}

export default async function AboutPage() {
  const lang = await getLang();
  const t = dictionaries[lang].about;
  const nav = dictionaries[lang].nav;

  return (
    <section className="mx-auto w-[92%] max-w-[1120px] py-16 relative">
      <Breadcrumb items={[
        { label: nav.home, href: "/" },
        { label: nav.about },
      ]} />

      {/* === LOGO + BAŞLIK === */}
      <div className="text-center mb-6">
        <img
          src="/icons/heptapus_logo_white.png"
          alt="Heptapus Logo"
          className="w-[180px] h-auto mx-auto mb-4 select-none pointer-events-none dark:invert-0 invert drop-shadow-lg"
        />
        <h1 className="text-3xl md:text-4xl font-extrabold text-foreground mb-2 text-center">
          <DecryptedText
            text={t.title}
            animateOn="view"
            revealDirection="center"
            speed={80}
            characters="01#@$%&"
          />
        </h1>
        <p className="text-muted-foreground mx-auto max-w-[860px] leading-relaxed text-center text-base">
          <DecryptedText
            text={t.subtitle}
            animateOn="view"
            revealDirection="center"
            speed={52}
          />
        </p>
      </div>

      <div className="hairline-sep" />

      {/* === STATS === */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-10">
        {t.stats.map((stat: { value: string; label: string }, i: number) => (
          <div key={i} className="text-center border border-border rounded-2xl bg-card p-6 shadow-sm">
            <div className="text-3xl md:text-4xl font-black text-foreground">{stat.value}</div>
            <div className="text-sm text-muted-foreground mt-1 font-medium">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* === METİNLER === */}
      <div className="max-w-[900px] mx-auto text-center">
        {[t.p1, t.p2, t.p3, t.p4].map((para, idx) => (
          <p key={idx} className="text-muted-foreground leading-relaxed mt-3">
            <DecryptedText
              text={para}
              animateOn="view"
              revealDirection={idx % 2 === 0 ? "center" : "start"}
              speed={48 + idx * 2}
            />
          </p>
        ))}

        {/* Kart Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
          {[
            { h: t.mission_h, p: t.mission_p },
            { h: t.vision_h, p: t.vision_p },
            { h: t.values_h, p: t.values_p },
          ].map((x) => (
            <div
              key={x.h}
              className="border border-border rounded-2xl bg-card p-5 shadow-sm"
            >
              <h3 className="font-bold text-card-foreground text-center mb-2">
                <DecryptedText text={x.h} animateOn="view" revealDirection="center" />
              </h3>
              <p className="text-muted-foreground text-center leading-relaxed text-sm">
                <DecryptedText text={x.p} animateOn="view" revealDirection="end" speed={60} />
              </p>
            </div>
          ))}
        </div>

        {/* === TIMELINE === */}
        <div className="mt-14">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            <DecryptedText text={t.timeline_title} animateOn="view" revealDirection="center" speed={70} />
          </h2>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border -translate-x-1/2 hidden sm:block" />
            <div className="space-y-6 sm:space-y-0">
              {t.timeline.map((item: { year: string; event: string }, i: number) => (
                <div key={i} className={`relative sm:flex items-start ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"} sm:mb-8`}>
                  {/* Content */}
                  <div className={`sm:w-[calc(50%-1.5rem)] ${i % 2 === 0 ? "sm:text-right sm:pr-6" : "sm:text-left sm:pl-6"}`}>
                    <div className="border border-border rounded-2xl bg-card p-4 shadow-sm">
                      <span className="inline-block rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold mb-2">{item.year}</span>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.event}</p>
                    </div>
                  </div>
                  {/* Dot */}
                  <div className="hidden sm:flex absolute left-1/2 -translate-x-1/2 top-4 w-3 h-3 rounded-full bg-primary border-2 border-background" />
                  {/* Spacer for the other side */}
                  <div className="hidden sm:block sm:w-[calc(50%-1.5rem)]" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}