"use client";


import { useProjects, type Project } from "@/hooks/useProjects";
import { useEffect, useState, useMemo, useRef } from "react";
import MetallicPaint, { parseLogoImage } from "@/components/MetallicPaint";
import ElectricBorder from "@/components/ElectricBorder";

// ---- HERO MEDIA (video | YouTube | fallback MetallicPaint) ----


function HeroMedia({
  imageData,
  videoSrc,              // ör: "/media/hero.mp4"
  poster,                // ör: "/media/hero_poster.jpg"
  youtubeId,             // ör: "dQw4w9WgXcQ"
}: {
  imageData: ImageData | null;
  videoSrc?: string;
  poster?: string;
  youtubeId?: string;
}) {
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0); // 0..1
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // YOUTUBE
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

  // MP4
  if (videoSrc) {
    // ilerleme
    const onTime = () => {
      const v = videoRef.current;
      if (!v || !v.duration) return;
      setDuration(v.duration);
      setProgress(v.currentTime / v.duration);
    };

    // çubuk tıklama
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
    }, []);

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

        {/* Alt scrim */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/55 to-transparent" />

        {/* Alt kontrol barı */}
        <div className="absolute left-2 right-2 bottom-2 flex items-center gap-2">
          {/* Progress bar (ortada, geniş) */}
          <div
            onClick={onSeek}
            className="group flex-1 h-2 rounded-full bg-white/20 hover:bg-white/25 cursor-pointer overflow-hidden"
          >
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-400 to-violet-400 transition-[width]"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>

          {/* Butonlar (sağda) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const v = videoRef.current;
                if (!v) return;
                v.paused ? v.play() : v.pause();
              }}
              className="rounded-xl border border-white/15 bg-black/40 backdrop-blur px-3 py-1.5 text-xs text-white hover:bg-black/55"
            >
              {playing ? "Duraklat" : "Oynat"}
            </button>
            <button
              onClick={() => setMuted(m => !m)}
              className="rounded-xl border border-white/15 bg-black/40 backdrop-blur px-3 py-1.5 text-xs text-white hover:bg-black/55"
            >
              {muted ? "Sesi Aç" : "Sessiz"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // FALLBACK: MetallicPaint
  return (
    <div className="metal-wrap">
      {imageData ? (
        <MetallicPaint
          imageData={imageData}
          params={{ edge: 2, patternBlur: 0.005, patternScale: 2, refraction: 0.015, speed: 0.3, liquid: 0.07 }}
        />
      ) : (
        <div style={{ width: "100%", height: "100%", background: "#0a0f1a" }} />
      )}
    </div>
  );
}



// Mask görseli: siyah dolgulu (tercihen SVG). PNG de çalışırsa bırakabilirsin.
const MASK_URL = "/icons/heptapus_logo_white.png";

const theme = {
  border: "rgba(255,255,255,.10)",
  text: "#e6edf3",
  muted: "#9fb0c3",
  brandFrom: "#6ee7ff",
  brandTo: "#a78bfa",
};
const container = { maxWidth: 1120, width: "92%", margin: "0 auto" };

export default function HomePage() {
  const [imageData, setImageData] = useState<ImageData | null>(null);
  const { projects, isLoading, error } = useProjects();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(MASK_URL);
        const blob = await res.blob();
        const file = new File([blob], "mask", { type: blob.type || "image/svg+xml" });
        const parsed = await parseLogoImage(file);
        if (!cancelled) setImageData(parsed?.imageData ?? null);
      } catch (err) {
        console.error("Mask yüklenemedi:", err);
        if (!cancelled) setImageData(null);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const gradientText = useMemo(
    () => ({
      background: `linear-gradient(90deg,${theme.brandFrom},${theme.brandTo})`,
      WebkitBackgroundClip: "text",
      backgroundClip: "text",
      color: "transparent",
    }),
    []
  );

  return (
    <>
      {/* HEADER */}
      <header style={{ ...container, padding: "16px 0" }}>
        <div
          className="hdr"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 14,
          }}
        >
          <a href="/" className="logo">
            <img
              src="icons/heptapus_logo_white.png"
              alt="Heptapus"
              width={56}
              height={56}
              style={{ verticalAlign: "middle" }}
            />
            <span>Heptapus Group</span>
          </a>
          <nav className="nav">
            <a href="/contact" className="cta">Teklif Al</a>
          </nav>
        </div>
        <style jsx>{`
          .logo{ display:inline-flex; align-items:center; gap:10px; font-weight:800; color:${theme.text}; text-decoration:none; letter-spacing:.02em; }
          .nav{ display:inline-flex; gap:10px; align-items:center; }
          .nav a{ color:${theme.text}; text-decoration:none; padding:8px 12px; border-radius:999px; border:1px solid ${theme.border}; background:rgba(255,255,255,.03); font-weight:600; font-size:14px; }
          .nav a.cta{ color:#0b1220; border:none; background:linear-gradient(135deg, ${theme.brandFrom}, ${theme.brandTo}); font-weight:800; }
          @media (max-width: 720px){ .nav a{ padding:8px 10px; font-size:13px; } }
        `}</style>
      </header>

      {/* HERO */}
      <section style={{ ...container, padding: "48px 0 40px" }}>
        <div className="hero-grid">
          <div>
            <span className="pill">Mühendislik ve Teknoloji Şirketleri Grubu</span>
            <h1 className="h1">
            The Tech We <span style={gradientText}>Create</span>
            </h1>
            <p className="lead">
            Bizim için teknoloji ve mühendislik, yalnızca bir üretim aracı değil; sürekli gelişim, yenilik ve değer yaratma yolculuğudur. Her projeyi disiplinli bir mühendislik yaklaşımıyla ele alıyor, fikirleri sağlam temeller üzerine inşa ederek hayata geçiriyoruz. Amacımız, estetik ile işlevi, yenilik ile güvenilirliği buluşturarak geleceğe yön verecek ürünler ortaya koymak.
            </p>
            <div className="meta">
              {["7+ üye", "10+ proje", "TR • EN"].map((t) => (
                <span key={t} className="chip">{t}</span>
              ))}
            </div>
          </div>

          {/* Sağ kart: MetallicPaint */}
<div className="demo-card">
  <HeroMedia
    imageData={imageData}
    // Aşağıdaki seçeneklerden biri:
    videoSrc="/media/hero.mp4"
    poster="/uploads/hero_poster.png"
    // youtubeId="dQw4w9WgXcQ"
  />
  <div className="techs">
    {["Birlik", "Güç", "Performans", "Kalite"].map((t) => (
      <span key={t} className="chip">{t}</span>
    ))}
  </div>
</div>

        </div>

        <style jsx>{`
          .pill{ display:inline-block; font-size:13px; padding:6px 12px; border-radius:999px; border:1px solid ${theme.border}; background:rgba(255,255,255,.06); color:${theme.muted}; margin-bottom:12px; }
          .h1{ font-size:42px; font-weight:900; line-height:1.15; margin:0 0 10px; color:${theme.text}; }
          .lead{ color:${theme.muted}; margin:8px 0 0; max-width:60ch; }
          .actions{ display:flex; gap:12px; flex-wrap:wrap; margin-top:22px; }
          .btn-grad{ display:inline-flex; align-items:center; font-weight:800; border-radius:999px; padding:10px 16px; color:#0b1220; background:linear-gradient(135deg, ${theme.brandFrom}, ${theme.brandTo}); text-decoration:none; }
          .btn-ghost{ display:inline-flex; align-items:center; font-weight:700; border-radius:999px; padding:10px 16px; border:1px solid ${theme.border}; background:rgba(255,255,255,.04); color:${theme.text}; text-decoration:none; }
          .meta{ display:flex; gap:12px; flex-wrap:wrap; margin-top:14px; color:${theme.muted}; }
          .chip{ display:inline-block; border:1px solid ${theme.border}; border-radius:999px; padding:4px 8px; font-size:13px; }

          .hero-grid{ display:grid; grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr); gap:24px; align-items:center; }
          .demo-card{ border:1px solid ${theme.border}; border-radius:16px; background:rgba(6,27,81,.78); padding:16px; box-shadow:0 15px 40px rgba(0,0,0,.35); overflow:hidden; }

          .metal-wrap{
            width:min(100%, 860px);
            aspect-ratio:16/9;
            margin-inline:auto;
            border-radius:12px;
            overflow:hidden;
            border:1px solid ${theme.border};
            background:radial-gradient(120% 100% at 50% 0%, #0b1020 0%, #060a12 70%);
            box-shadow:0 12px 38px rgba(0,0,0,.35);
          }
          :global(canvas){ width:100% !important; height:100% !important; display:block; }

          .techs{ margin-top:12px; display:flex; gap:8px; flex-wrap:wrap; color:${theme.muted}; font-size:13px; }
          @media (max-width:1024px){ .h1{ font-size:36px; } }
          @media (max-width:900px){ .hero-grid{ grid-template-columns:1fr; } .demo-card{ order:-1; } }
          @media (max-width:560px){
            .h1{ font-size:30px; line-height:1.18; }
            .lead{ font-size:14px; }
            .metal-wrap{ aspect-ratio:16/10; border-radius:10px; }
          }
        `}</style>
      </section>

     
    {/* Öne Çıkanlar (API’den) */}
    <section style={{ ...container, padding: "32px 0 56px" }}>
      <h2 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px", color: theme.text }}>
        Öne Çıkanlar
      </h2>

      {error && <p style={{ color: "#fca5a5" }}>Projeler yüklenemedi.</p>}

      {isLoading ? (
        <div className="grid-cards">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <p style={{ color: theme.muted }}>Henüz proje yok.</p>
      ) : (
        <div className="grid-cards">
          {projects.map((p: Project) => (
            <ElectricBorder
              key={p.id}
              color="#7df9ff"
              speed={1}
              chaos={0.5}
              thickness={2}
              style={{ borderRadius: 16 }}
              desktopOnly
            >
              <article className="eb-card">
                {p.imageUrl ? (
                  <img
                    src={p.imageUrl}
                    alt={p.title}
                    className="thumb-img"
                    loading="lazy"
                  />
                ) : (
                  <div className="thumb" />
                )}

                <h3 style={{ fontWeight: 700, margin: 0, color: theme.text }}>{p.title}</h3>
                <p style={{ color: theme.muted, fontSize: 14, marginTop: 6 }}>{p.summary}</p>

                <div className="tags">
                  <span className="chip">{p.status}</span>
                  {Array.isArray(p.tags) &&
                    p.tags.slice(0, 3).map((t: string) => (
                      <span key={t} className="chip">{t}</span>
                    ))}
                </div>

                <a href={`/projects/${p.slug}`} className="cta">İncele</a>
              </article>
            </ElectricBorder>
          ))}
        </div>
      )}

      {/* TEK style bloğu (nested yok) */}
      <style jsx>{`
        .grid-cards {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
        }
        .skeleton {
          height: 220px;
          border-radius: 16px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.05),
            rgba(255, 255, 255, 0.08),
            rgba(255, 255, 255, 0.05)
          );
          animation: pulse 1.4s infinite;
        }
        @keyframes pulse {
          0% { filter: brightness(0.9); }
          50% { filter: brightness(1.05); }
          100% { filter: brightness(0.9); }
        }

        .eb-card {
          background: rgba(17, 24, 42, 0.72);
          border-radius: 16px;
          padding: 16px;
          box-shadow: 0 15px 40px rgba(0, 0, 0, 0.25);
          position: relative;
          overflow: hidden;
        }
        .thumb {
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          background: linear-gradient(
              to right,
              rgba(110, 231, 255, 0.08),
              rgba(167, 139, 250, 0.08)
            ),
            #0a0f1a;
          margin-bottom: 12px;
          border: 1px solid ${theme.border};
        }
        .thumb-img {
          width: 100%;
          height: auto;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 12px;
          border: 1px solid ${theme.border};
          display: block;
        }
        .tags {
          display: flex;
          gap: 8px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .chip {
          display: inline-block;
          border: 1px solid ${theme.border};
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 12px;
          color: ${theme.muted};
          text-transform: uppercase;
          letter-spacing: .02em;
        }
        .cta {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          margin-top: 12px;
          padding: 10px 14px;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          color: #0b1220;
          background: linear-gradient(135deg, ${theme.brandFrom}, ${theme.brandTo});
        }
        @media (max-width: 560px) {
          .eb-card { padding: 14px; }
          .thumb, .thumb-img { border-radius: 10px; }
        }
      `}</style>
    </section>



    </>
  );
}
