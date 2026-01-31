"use client";

import { useProjects, type Project } from "@/hooks/useProjects";
import ElectricBorder from "@/components/ElectricBorder";
import Link from "next/link"; // <a> yerine Link kullanıyoruz

const theme = {
  border: "rgba(255,255,255,.10)",
  text: "#e6edf3",
  muted: "#9fb0c3",
  brandFrom: "#6ee7ff",
  brandTo: "#a78bfa",
};

// Props tip tanımı
interface ProjectsClientProps {
  t: {
    title: string;
    description: string;
    error: string;
    no_projects: string;
    examine: string;
  };
  lang?: string;
}
export default function ProjectsClient({ t }: ProjectsClientProps) {
  const { projects, isLoading, error } = useProjects();

  return (
    <section style={{ maxWidth: 1120, width: "92%", margin: "0 auto", padding: "56px 0" }}>
      <h1 style={{ marginTop: 0, color: theme.text, textAlign: "center" }}>{t.title}</h1>
      <p style={{ color: theme.muted, maxWidth: 820, paddingBottom: 24, textAlign: "center", margin: "0 auto" }}>
        {t.description}
      </p>

      {error && <p style={{ color: "#fca5a5" }}>{t.error}</p>}

      {isLoading ? (
        <div className="grid-cards">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <p style={{ color: theme.muted, textAlign: "center" }}>{t.no_projects}</p>
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
                  <img src={p.imageUrl} alt={p.title} className="thumb-img" loading="lazy" />
                ) : (
                  <div className="thumb" />
                )}

                <h3 className="title">{p.title}</h3>
                <p className="desc">{p.summary}</p>

                <div className="tags">
                  <span className="chip">{p.status}</span>
                  {Array.isArray(p.tags) &&
                    p.tags.slice(0, 4).map((tag: string) => (
                      <span key={tag} className="chip">
                        {tag}
                      </span>
                    ))}
                </div>

                <Link href={`/projects/${p.slug}`} className="cta">
                  {t.examine}
                </Link>
              </article>
            </ElectricBorder>
          ))}
        </div>
      )}

      <style jsx>{`
        .grid-cards {
          display: grid;
          gap: 16px;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          align-items: stretch;
        }
        .skeleton {
          height: 260px;
          border-radius: 16px;
          background: linear-gradient(90deg, rgba(255,255,255,.05), rgba(255,255,255,.08), rgba(255,255,255,.05));
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
          display: flex;
          flex-direction: column;
          height: 100%;
        }
        .thumb {
          aspect-ratio: 16 / 9;
          border-radius: 12px;
          background: linear-gradient(to right, rgba(110,231,255,.08), rgba(167,139,250,.08)), #0a0f1a;
          margin-bottom: 12px;
          border: 1px solid ${theme.border};
        }
        .thumb-img {
          width: 100%;
          aspect-ratio: 16 / 9;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 12px;
          border: 1px solid ${theme.border};
        }
        .title { margin: 0; color: ${theme.text}; font-weight: 700; }
        .desc  { color: ${theme.muted}; font-size: 14px; margin: 6px 0 8px; }
        .tags  { display: flex; gap: 8px; flex-wrap: wrap; margin-top: auto; }
        .chip  {
          border: 1px solid ${theme.border};
          border-radius: 999px;
          padding: 4px 8px;
          font-size: 12px;
          color: ${theme.muted};
          text-transform: uppercase;
        }
        .cta {
          display: inline-flex; align-items: center; justify-content: center;
          width: 100%; margin-top: 12px; padding: 10px 14px;
          border-radius: 12px; text-decoration: none; font-weight: 700;
          color: #0b1220; background: linear-gradient(135deg, ${theme.brandFrom}, ${theme.brandTo});
        }
      `}</style>
    </section>
  );
}