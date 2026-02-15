"use client";

import { useProjects, type Project } from "@/hooks/useProjects";
import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import MetallicPaint, { parseLogoImage } from "@/components/MetallicPaint";
import ElectricBorder from "@/components/ElectricBorder";

// Sözlükler
import tr from "@/dictionaries/tr.json";
import en from "@/dictionaries/en.json";

type Dictionary = typeof tr;
const dictionaries: Record<"tr" | "en", Dictionary> = { tr, en };

function HeroMedia({
  imageData, videoSrc, poster, youtubeId, t
}: {
  imageData: ImageData | null;
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
      <div className="relative overflow-hidden rounded-2xl border border-border">
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

  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
      {videoSrc ? (
        <>
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
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
          <div className="absolute left-4 right-4 bottom-4 flex items-center gap-3">
            <div onClick={onSeek} className="group flex-1 h-1.5 rounded-full bg-white/20 hover:bg-white/30 cursor-pointer overflow-hidden transition-all">
              <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400" style={{ width: `${Math.round(progress * 100)}%` }} />
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => {
                const v = videoRef.current;
                if (v) v.paused ? v.play() : v.pause();
              }} className="rounded-lg border border-white/10 bg-black/60 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-wider text-white hover:bg-black/80">
                {playing ? t.video.pause : t.video.play}
              </button>
              <button onClick={() => setMuted(m => !m)} className="rounded-lg border border-white/10 bg-black/60 backdrop-blur px-3 py-1 text-[10px] uppercase tracking-wider text-white hover:bg-black/80">
                {muted ? t.video.unmute : t.video.mute}
              </button>
            </div>
          </div>
        </>
      ) : (
        imageData && <MetallicPaint imageData={imageData} params={{ edge: 2, patternBlur: 0.005, patternScale: 2, refraction: 0.015, speed: 0.3, liquid: 0.07 }} />
      )}
    </div>
  );
}

const MASK_URL = "/icons/heptapus_logo_white.png";
const container = { maxWidth: 1120, width: "92%", margin: "0 auto" };

export default function HomePage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [lang, setLang] = useState<"tr" | "en">("tr");

  const { projects, isLoading, error } = useProjects();
  const t = dictionaries[lang].home;

  useEffect(() => {
    const savedLang = typeof document !== "undefined" ? document.cookie.split('; ').find(row => row.startsWith('lang='))?.split('=')[1] : null;
    if (savedLang === "en" || savedLang === "tr") setLang(savedLang as "en" | "tr");

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(MASK_URL);
        const parsed = await parseLogoImage(new File([await res.blob()], "mask"));
        if (!cancelled) setImageData(parsed?.imageData ?? null);
      } catch { if (!cancelled) setImageData(null); }
    })();

    (async () => {
      try {
        const res = await fetch("/api/public-settings");
        if (res.ok) {
          const data = await res.json();
          const videoSetting = data.items?.find((item: any) => item.key === 'heroVideoUrl');
          if (!cancelled && videoSetting?.value) setVideoUrl(videoSetting.value);
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
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider mb-6">
            {t.hero_pill}
          </span>
          <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6 text-foreground">
            {t.hero_title_part1}{" "}
            <span className="bg-gradient-to-r from-sky-500 to-violet-500 bg-clip-text text-transparent">
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
          <HeroMedia imageData={imageData} videoSrc={videoUrl || "/media/hero.mp4"} poster="/uploads/hero_poster.png" t={t} />
          <div className="flex flex-wrap gap-2 mt-4">
            {t.tech_chips.map((chip: string) => (
              <span key={chip} className="px-3 py-1.5 rounded-lg bg-primary/5 border border-primary/10 text-primary text-xs font-semibold">
                {chip}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* PROJECTS SECTION */}
      <section className="py-16">
        <h2 className="text-3xl font-extrabold mb-8 text-foreground">{t.section_title}</h2>

        {error && <p className="text-destructive">{t.error}</p>}

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[16/12] rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : projects.length === 0 ? (
          <p className="text-muted-foreground text-center py-10 border border-dashed border-border rounded-2xl">
            {t.no_projects}
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p: Project) => (
              <ElectricBorder key={p.id} color="#7df9ff" speed={1} chaos={0.5} thickness={2} style={{ borderRadius: 16 }} desktopOnly>
                <article className="bg-card border border-border rounded-2xl overflow-hidden h-full flex flex-col">
                  <div className="relative w-full aspect-[16/10] bg-muted">
                    {p.imageUrl ? (
                      <Image src={p.imageUrl} alt={p.title} fill className="object-cover" unoptimized />
                    ) : (
                      <div className="w-full h-full bg-muted" />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-card-foreground mb-2">{p.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">{p.summary}</p>
                    <Link href={`/projects/${p.slug}`} className="text-sm font-bold text-primary hover:underline">
                      {t.examine} →
                    </Link>
                  </div>
                </article>
              </ElectricBorder>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
