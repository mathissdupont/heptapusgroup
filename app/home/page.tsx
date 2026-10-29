"use client";

import { useProjects, type Project } from "@/hooks/useProjects";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import ExternalMedia from "@/components/ExternalMedia";
import { isExternalMediaUrl, youtubeVideoId } from "@/lib/media-url";
import BrandLogo from "@/components/BrandLogo";

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
import { ArrowRight, ArrowUpRight } from "lucide-react";

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
  const [failed, setFailed] = useState(false);
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
    setFailed(false);
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

  const youtube = youtubeId || (videoSrc ? youtubeVideoId(videoSrc) : null);
  if (youtube || (videoSrc && isExternalMediaUrl(videoSrc))) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border shadow-lg">
        <ExternalMedia youtubeId={youtube || undefined} videoUrl={youtube ? undefined : videoSrc} />
      </div>
    );
  }

  if (videoSrc && !failed) {
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
          onError={() => setFailed(true)}
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
    <div className="group-brand-frame relative overflow-hidden flex items-center justify-center" style={{ aspectRatio: "16 / 9" }}>
      <BrandLogo variant="primary" tone="light" />
      <span className="group-brand-caption">Viribus unitis, semper fidelis.</span>
    </div>
  );
}

const container = { maxWidth: 1120, width: "92%", margin: "0 auto" };

export default function HomePage() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [lang, setLang] = useState<Locale>("tr");

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

        }
      } catch (e) { console.error(e); }
    })();

    return () => { cancelled = true; };
  }, []);

  return (
    <main className="group-home" style={{ ...container }}>
      {/* HERO SECTION */}
      <section className="group-hero grid gap-10 py-16 md:grid-cols-2 md:gap-16 items-center">
        <div>
          <span className="division-eyebrow inline-block mb-6">
            {t.hero_pill}
          </span>
          <h1 className="group-hero-title text-4xl md:text-5xl font-semibold leading-tight mb-6 text-foreground">
            {t.hero_title_part1}{" "}
            <span className="text-foreground">
              {t.hero_title_grad}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8 max-w-xl">
            {t.hero_lead}
          </p>
          <div className="group-hero-disciplines flex flex-wrap gap-x-5 gap-y-2">
            {t.stats.map((stat: string) => (
              <span key={stat} className="text-xs font-medium text-muted-foreground">
                {stat}
              </span>
            ))}
          </div>
          <div className="division-actions mt-8"><Link href="/projects" className="group-primary-button">{dict.nav.projects}<ArrowUpRight size={18} /></Link><Link href="/contact" className="division-text-link">{dict.nav.contact}<ArrowRight size={17} /></Link></div>
        </div>
        <div>
          <HeroMedia videoSrc={videoUrl || "/media/hero.mp4"} poster="/uploads/hero_poster.png" t={t} />
          <div className="flex flex-wrap gap-2 mt-4">
            {t.tech_chips.map((chip: string) => (
              <span key={chip} className="py-1 text-muted-foreground text-[11px] font-medium tracking-wide mr-3">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PARTNER CAROUSEL */}
      <PartnerCarousel title={dict.partners_title} />

      {/* STATS COUNTER */}
      <StatsCounter lang={lang} />

      {/* WHY CHOOSE US */}
      <WhyChooseUs t={dict.why_us} />

      {/* SERVICES */}
      <ServicesOverview t={dict.services} />

      {/* PROJECTS SECTION */}
      <section className="group-projects py-16">
        <div className="group-section-heading mb-10"><h2 className="text-3xl font-semibold text-foreground">{t.section_title}</h2><Link href="/projects" className="division-text-link">{dict.nav.projects}<ArrowUpRight size={18} /></Link></div>

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
            {projects.slice(0, 6).map((p: Project) => (
              <article key={p.id} className="group-project-card overflow-hidden h-full flex flex-col">
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
