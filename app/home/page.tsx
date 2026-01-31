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
      <div className="metal-wrap relative overflow-hidden rounded-2xl border border-white/10">
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
    <div className="metal-wrap relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900">
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
const theme = { border: "rgba(255,255,255,.10)", text: "#e6edf3", muted: "#9fb0c3", brandFrom: "#6ee7ff", brandTo: "#a78bfa" };
const container = { maxWidth: 1120, width: "92%", margin: "0 auto" };

export default function HomePage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [lang, setLang] = useState<"tr" | "en">("tr");
  
  const { projects, isLoading, error } = useProjects();
  const t = dictionaries[lang].home;
  const navT = dictionaries[lang].nav;

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

  const gradientText = useMemo(() => ({ 
    background: `linear-gradient(90deg,${theme.brandFrom},${theme.brandTo})`, 
    WebkitBackgroundClip: "text", 
    backgroundClip: "text", 
    color: "transparent" 
  }), []);

  return (
    <>

      <main style={{ ...container }}>
        {/* HERO SECTION */}
        <section className="hero-grid">
          <div className="hero-content">
            <span className="pill">{t.hero_pill}</span>
            <h1 className="h1">{t.hero_title_part1} <span style={gradientText}>{t.hero_title_grad}</span></h1>
            <p className="lead">{t.hero_lead}</p>
            <div className="meta">
              {t.stats.map((stat: string) => (<span key={stat} className="chip">{stat}</span>))}
            </div>
          </div>
          <div className="demo-card">
            <HeroMedia imageData={imageData} videoSrc={videoUrl || "/media/hero.mp4"} poster="/uploads/hero_poster.png" t={t} />
            <div className="techs">
              {t.tech_chips.map((chip: string) => (<span key={chip} className="chip secondary">{chip}</span>))}
            </div>
          </div>
        </section>

        {/* PROJECTS SECTION */}
        <section style={{ padding: "80px 0" }}>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 32, color: theme.text }}>{t.section_title}</h2>
          
          {error && <p style={{ color: "#fca5a5" }}>{t.error}</p>}
          
          {isLoading ? (
            <div className="grid-cards">
              {[1, 2, 3].map(i => <div key={i} className="skeleton" />)}
            </div>
          ) : projects.length === 0 ? (
            <p style={{ color: theme.muted, textAlign: 'center', padding: '40px', border: '1px dashed #333', borderRadius: '16px' }}>{t.no_projects}</p>
          ) : (
            <div className="grid-cards">
              {projects.map((p: Project) => (
                <ElectricBorder key={p.id} color="#7df9ff" speed={1} chaos={0.5} thickness={2} style={{ borderRadius: 20 }} desktopOnly>
                  <article className="project-card">
                    <div className="img-wrap">
                      {p.imageUrl ? (
                        <Image src={p.imageUrl} alt={p.title} fill className="object-cover" unoptimized />
                      ) : (
                        <div className="placeholder" />
                      )}
                    </div>
                    <div className="content">
                      <h3>{p.title}</h3>
                      <p>{p.summary}</p>
                      <Link href={`/projects/${p.slug}`} className="view-link">{t.examine} →</Link>
                    </div>
                  </article>
                </ElectricBorder>
              ))}
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        .logo { display: flex; align-items: center; gap: 12px; font-weight: 800; color: ${theme.text}; text-decoration: none; transition: opacity 0.2s; }
        .logo:hover { opacity: 0.8; }
        .cta-btn { color: #0b1220; background: linear-gradient(135deg, ${theme.brandFrom}, ${theme.brandTo}); font-weight: 800; padding: 10px 24px; border-radius: 99px; text-decoration: none; font-size: 14px; box-shadow: 0 4px 15px rgba(110, 231, 255, 0.2); }
        
        .hero-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 60px; padding: 60px 0; align-items: center; }
        @media (max-width: 968px) { .hero-grid { grid-template-columns: 1fr; gap: 40px; text-align: center; } }

        .pill { display: inline-block; padding: 6px 16px; border-radius: 99px; background: rgba(255,255,255,0.05); border: 1px border white/10; color: ${theme.brandFrom}; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 24px; }
        .h1 { font-size: clamp(32px, 5vw, 56px); font-weight: 900; line-height: 1.1; margin-bottom: 24px; color: ${theme.text}; }
        .lead { font-size: 18px; color: ${theme.muted}; line-height: 1.6; margin-bottom: 32px; max-width: 540px; }
        @media (max-width: 968px) { .lead { margin: 0 auto 32px; } }

        .meta, .techs { display: flex; flex-wrap: wrap; gap: 10px; }
        @media (max-width: 968px) { .meta, .techs { justify-content: center; } }
        .chip { padding: 8px 16px; border-radius: 12px; background: rgba(255,255,255,0.03); border: 1px border white/5; color: ${theme.text}; font-size: 13px; font-weight: 600; }
        .chip.secondary { background: rgba(110, 231, 255, 0.05); color: ${theme.brandFrom}; border-color: rgba(110, 231, 255, 0.1); }

        .demo-card { position: relative; }
        .demo-card .techs { margin-top: 20px; }

        .grid-cards { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 32px; }
        .project-card { background: #0a0f1a; height: 100%; display: flex; flex-direction: column; overflow: hidden; border-radius: 20px; }
        .img-wrap { position: relative; width: 100%; aspect-ratio: 16/10; background: #161b22; }
        .project-card .content { padding: 24px; flex: 1; display: flex; flex-direction: column; }
        .project-card h3 { font-size: 20px; font-weight: 800; margin-bottom: 12px; color: ${theme.text}; }
        .project-card p { font-size: 14px; color: ${theme.muted}; line-height: 1.5; margin-bottom: 20px; flex: 1; }
        .view-link { font-weight: 700; color: ${theme.brandFrom}; text-decoration: none; font-size: 14px; }
        
        .skeleton { width: 100%; aspect-ratio: 16/12; background: #161b22; border-radius: 20px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </>
  );
}