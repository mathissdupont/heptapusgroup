"use client";

import { useProjects, type Project } from "@/hooks/useProjects";
import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link"; // <a> yerine <Link> kullanmak için
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
  t: Dictionary["home"]; // any yerine tam tip tanımı
}) {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true); // setPlaying hatası için aşağıda kullandık
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

  // setPlaying hatasını çözmek için event listener (hook moved out of conditional)
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
      <div className="metal-wrap relative overflow-hidden">
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
      <div className="metal-wrap relative overflow-hidden">
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
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />
        <div className="absolute left-2 right-2 bottom-2 flex items-center gap-2">
          <div onClick={onSeek} className="group flex-1 h-2 rounded-full bg-white/20 hover:bg-white/25 cursor-pointer overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400" style={{ width: `${Math.round(progress * 100)}%` }} />
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { 
                const v = videoRef.current; 
                if (v) {
                  if (v.paused) {
                    v.play();
                  } else {
                    v.pause();
                  }
                } // 'v' is possibly null hatası çözüldü
              }} 
              className="rounded-xl border border-white/15 bg-black/40 backdrop-blur px-3 py-1.5 text-xs text-white"
            >
              {playing ? t.video.pause : t.video.play}
            </button>
            <button onClick={() => setMuted(m => !m)} className="rounded-xl border border-white/15 bg-black/40 backdrop-blur px-3 py-1.5 text-xs text-white">
              {muted ? t.video.unmute : t.video.mute}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="metal-wrap">
      {imageData ? <MetallicPaint imageData={imageData} params={{ edge: 2, patternBlur: 0.005, patternScale: 2, refraction: 0.015, speed: 0.3, liquid: 0.07 }} /> : <div style={{ width: "100%", height: "100%", background: "#0a0f1a" }} />}
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
    if (savedLang === "en" || savedLang === "tr") {
      setLang(savedLang as "en" | "tr");
    } else if (typeof navigator !== "undefined") {
      setLang(navigator.language.startsWith("tr") ? "tr" : "en");
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(MASK_URL);
        const parsed = await parseLogoImage(new File([await res.blob()], "mask"));
        if (!cancelled) setImageData(parsed?.imageData ?? null);
      } catch { if (!cancelled) setImageData(null); } // Unused 'err' hatası çözüldü
    })();

    (async () => {
      try {
        const res = await fetch("/api/public-settings");
        if (res.ok) {
          const data = await res.json();
          // Type any hatası çözümü: item tipini belirledik
          const videoSetting = data.items?.find((item: {key: string, value: string}) => item.key === 'heroVideoUrl');
          if (!cancelled && videoSetting?.value) setVideoUrl(videoSetting.value);
        }
      } catch (e) { console.error(e); }
    })();

    return () => { cancelled = true; };
  }, []);

  const gradientText = useMemo(() => ({ background: `linear-gradient(90deg,${theme.brandFrom},${theme.brandTo})`, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }), []);

  return (
    <>
      <header style={{ ...container, padding: "16px 0" }}>
        <div className="hdr" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          {/* <a> yerine <Link> kullanıldı */}
          <Link href="/" className="logo">
            <Image src="/icons/heptapus_logo_white.png" alt="Heptapus" width={56} height={56} style={{ verticalAlign: "middle" }} />
            <span>Heptapus Group</span>
          </Link>
          <nav className="nav">
            <Link href="/contact" className="cta">{navT.contact}</Link>
          </nav>
        </div>
        <style jsx>{` .logo{ display:inline-flex; align-items:center; gap:10px; font-weight:800; color:${theme.text}; text-decoration:none; } .nav .cta{ color:#0b1220; background:linear-gradient(135deg, ${theme.brandFrom}, ${theme.brandTo}); font-weight:800; padding:8px 12px; border-radius:999px; text-decoration:none; } `}</style>
      </header>

      {/* ... Hero ve Diğer Sectionlar aynı kalacak, sadece içindeki <a> etiketlerini <Link> yapman yeterli ... */}
      
      <section style={{ ...container, padding: "48px 0 40px" }}>
        <div className="hero-grid">
          <div>
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
              {t.tech_chips.map((chip: string) => (<span key={chip} className="chip">{chip}</span>))}
            </div>
          </div>
        </div>
      </section>

      <section style={{ ...container, padding: "32px 0 56px" }}>
        <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px", color: theme.text }}>{t.section_title}</h2>
        {error && <p style={{ color: "#fca5a5" }}>{t.error}</p>}
        {isLoading ? ( <div className="grid-cards">{Array.from({ length: 3 }).map((_, i) => (<div key={i} className="skeleton" />))}</div> ) : 
         projects.length === 0 ? ( <p style={{ color: theme.muted }}>{t.no_projects}</p> ) : (
          <div className="grid-cards">
            {projects.map((p: Project) => (
              <ElectricBorder key={p.id} color="#7df9ff" speed={1} chaos={0.5} thickness={2} style={{ borderRadius: 16 }} desktopOnly>
                <article className="eb-card">
                  {p.imageUrl ? <Image src={p.imageUrl} alt={p.title} width={400} height={240} className="thumb-img" unoptimized /> : <div className="thumb" />}
                  <h3 style={{ fontWeight: 700, color: theme.text }}>{p.title}</h3>
                  <p style={{ color: theme.muted, fontSize: 14 }}>{p.summary}</p>
                  <Link href={`/projects/${p.slug}`} className="cta">{t.examine}</Link>
                </article>
              </ElectricBorder>
            ))}
          </div>
        )}
      </section>
    </>
  );
}