"use client";

import { useProjects, type Project } from "@/hooks/useProjects";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";

import ImageWithFallback from "@/components/ImageWithFallback";
import PartnerCarousel from "@/components/PartnerCarousel";
import StatsCounter from "@/components/StatsCounter";
import WhyChooseUs from "@/components/WhyChooseUs";
import ServicesOverview from "@/components/ServicesOverview";
import CtaBanner from "@/components/CtaBanner";

import { getTranslatedField } from "@/lib/i18n";

// Sözlükler
import tr from "@/dictionaries/tr.json";
import en from "@/dictionaries/en.json";
import de from "@/dictionaries/de.json";
import { type Locale, isValidLocale } from "@/lib/get-dictionary";

type Dictionary = typeof tr;
const dictionaries: Record<Locale, Dictionary> = { tr, en, de };

function HeroMedia({
  videoSrc, poster, youtubeId, t
}: {
  videoSrc?: string;
  poster?: string;
  youtubeId?: string;
  t: Dictionary["home"];
}) {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const onTime = () => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    setDuration(v.duration);
    setProgress(v.currentTime / v.duration);
  };

  const onSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    if (!v || !duration) return;
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const ratio = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    v.currentTime = ratio * duration;
    setProgress(ratio);
  };

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
    };
  }, [videoSrc]);

  if (youtubeId) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border shadow-lg">
        <iframe
          className="w-full h-full block"
          style={{ aspectRatio: "16 / 9", border: 0 }}
          src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&controls=1&rel=0&playsinline=1&modestbranding=1&loop=1&playlist=${youtubeId}`}
          allow="autoplay; encrypted-media; picture-in-picture"
          allowFullScreen
          loading="lazy"
          title="Tanıtım Videosu"
        />
      </div>
    );
  }

  if (videoSrc) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg">
        <video
          ref={videoRef}
          src={videoSrc}
          poster={poster}
          className="w-full h-full object-cover block"
          style={{ aspectRatio: "16 / 9" }}
          autoPlay
          muted={muted}
          loop
          playsInline
          onTimeUpdate={onTime}
          onLoadedMetadata={onTime}
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />
        <div className="absolute left-4 right-4 bottom-4 flex items-center gap-3">
          <div onClick={onSeek} className="group flex-1 h-1 rounded-full bg-white/20 hover:bg-white/30 cursor-pointer overflow-hidden transition-all">
            <div className="h-full rounded-full bg-foreground" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => {
              const v = videoRef.current;
              if (v) v.paused ? v.play() : v.pause();
            }} className="rounded-md border border-white/10 bg-black/60 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-wider text-white hover:bg-black/80">
              {playing ? t.video.pause : t.video.play}
            </button>
            <button onClick={() => setMuted(m => !m)} className="rounded-md border border-white/10 bg-black/60 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-wider text-white hover:bg-black/80">
              {muted ? t.video.unmute : t.video.mute}
            </button>
          </div>
        </div>
      </div>
    );
  }

  /* Static logo fallback */
  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card shadow-lg flex items-center justify-center" style={{ aspectRatio: "16 / 9" }}>
      <Image
        src="/icons/heptapus_logo_white.png"
        alt="Heptapus Group"
        width={180}
        height={180}
        className="opacity-80 dark:invert-0 invert select-none"
      />
    </div>
  );
}

const container = { maxWidth: 1120, width: "92%", margin: "0 auto" };

export default function HomePage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [lang, setLang] = useState<Locale>("tr");
  const [statValues, setStatValues] = useState<{ companies?: number; projects?: number; team?: number; years?: number }>({});

  const { projects, isLoading, error } = useProjects();
  const dict = dictionaries[lang];
  const t = dict.home;

  useEffect(() => {
    const savedLang = typeof document !== "undefined" ? document.cookie.split('; ').find(row => row.startsWith('lang='))?.split('=')[1] : null;
    if (savedLang && isValidLocale(savedLang)) setLang(savedLang);

    let cancelled = false;

    (async () => {
      try {
        const res = await fetch("/api/public-settings", { cache: "no-store" });
        if (res.ok) {
          const data = await res.json();
          const find = (k: string) => data.items?.find((item: any) => item.key === k)?.value;
          const videoSetting = find('heroVideoUrl');
          if (!cancelled && videoSetting) setVideoUrl(videoSetting);

          const sv: typeof statValues = {};
          const sc = find('stat_companies'); if (sc) sv.companies = Number(sc);
          const sp = find('stat_projects');  if (sp) sv.projects = Number(sp);
          const st = find('stat_team');      if (st) sv.team = Number(st);
          const sy = find('stat_years');     if (sy) sv.years = Number(sy);
          if (!cancelled && Object.keys(sv).length) setStatValues(sv);
        }
      } catch (e) { console.error(e); }
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <main style={{ ...container }}>
      {/* HERO SECTION */}
      <section className="grid gap-10 py-16 md:grid-cols-2 md:gap-16 items-center">
        <div>
          <span className="inline-block px-4 py-1.5 rounded-full bg-muted border border-border text-muted-foreground text-xs font-bold uppercase tracking-wider mb-6">
            {t.hero_pill}
          </span>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6 text-foreground">
            {t.hero_title_part1}{" "}
            <span className="text-foreground">
              {t.hero_title_grad}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
            {t.hero_lead}
          </p>
          <div className="flex flex-wrap gap-2">
            {t.stats.map((stat: string) => (
              <span key={stat} className="px-4 py-2 rounded-lg bg-secondary border border-border text-sm font-semibold text-foreground">
                {stat}
              </span>
            ))}
          </div>
        </div>
        <div>
          <HeroMedia videoSrc={videoUrl || "/media/hero.mp4"} poster="/uploads/hero_poster.png" t={t} />
          <div className="flex flex-wrap gap-2 mt-4">
            {t.tech_chips.map((chip: string) => (
              <span key={chip} className="px-3 py-1.5 rounded-lg bg-muted border border-border text-muted-foreground text-xs font-semibold">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNER CAROUSEL */}
      <PartnerCarousel title={dict.partners_title} />

      {/* STATS COUNTER */}
      <StatsCounter t={dict.stats} values={statValues} />

      {/* WHY CHOOSE US */}
      <WhyChooseUs t={dict.why_us} />

      {/* OUR COMPANIES */}
      <ServicesOverview t={dict.services} />

      {/* CTA BANNER */}
      <CtaBanner
        title={t.cta_title}
        description={t.cta_description}
        buttonText={t.cta_button}
      />

      {/* PROJECTS SECTION */}
      <section className="py-16">
        <h2 className="text-3xl font-extrabold mb-8 text-foreground">{t.section_title}</h2>

        {error && <p className="text-destructive">{t.error}</p>}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[16/12] rounded-xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="text-muted-foreground text-center py-10 border border-dashed border-border rounded-xl">
            {t.no_projects}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p: Project) => (
              <article key={p.id} className="bg-card border border-border rounded-xl overflow-hidden h-full flex flex-col shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                <div className="relative w-full aspect-[16/10] bg-muted">
                  {p.imageUrl ? (
                    <ImageWithFallback src={p.imageUrl} alt={getTranslatedField(p, "title", lang)} fill className="object-cover" unoptimized fallbackText={getTranslatedField(p, "title", lang)} />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="text-lg font-bold text-card-foreground mb-2">{getTranslatedField(p, "title", lang)}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{getTranslatedField(p, "summary", lang)}</p>
                  <Link href={`/projects/${p.slug}`} className="text-sm font-bold text-foreground hover:underline">
                    {t.examine} →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* BOTTOM CTA */}
      <CtaBanner
        title={dict.contact.form.title}
        description={dict.contact.form.description}
        buttonText={dict.nav.contact}
        buttonHref="/contact"
      />
    </main>
  );
}
