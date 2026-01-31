import type { Metadata } from "next";
import { cookies, headers } from "next/headers";
import DecryptedText from "@/components/DecryptedText";

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

const theme = {
  border: "rgba(255,255,255,.10)",
  muted: "#9fb0c3",
  text: "#e6edf3",
};

export default async function AboutPage() {
  const lang = await getLang();
  const t = dictionaries[lang].about;

  return (
    <section
      style={{
        maxWidth: 1120,
        width: "92%",
        margin: "0 auto",
        padding: "72px 0 96px",
        position: "relative",
      }}
    >
      {/* === LOGO + BAŞLIK === */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <img
          src="/icons/heptapus_logo_white.png"
          alt="Heptapus Logo"
          style={{
            width: 220,
            height: "auto",
            margin: "0 auto 10px",
            filter: "drop-shadow(0 6px 22px rgba(123,92,255,.28))",
            userSelect: "none",
            pointerEvents: "none",
          }}
        />
        <h1
          style={{
            margin: "8px 0 6px",
            color: theme.text,
            letterSpacing: 0.3,
            textAlign: "center",
          }}
        >
          <DecryptedText
            text={t.title}
            animateOn="view"
            revealDirection="center"
            speed={80}
            characters="01#@$%&"
          />
        </h1>
        <p
          style={{
            color: theme.muted,
            margin: "4px auto 16px",
            maxWidth: 860,
            lineHeight: 1.6,
            textAlign: "center",
            fontSize: "1.02rem",
          }}
        >
          <DecryptedText
            text={t.subtitle}
            animateOn="view"
            revealDirection="center"
            speed={52}
          />
        </p>
      </div>

      <div
        style={{
          width: "min(900px, 92%)",
          height: 1,
          margin: "10px auto 20px",
          background:
            "linear-gradient(90deg, transparent, rgba(124, 96, 255, 0.35), rgba(0, 200, 255, 0.28), transparent)",
          filter: "drop-shadow(0 0 6px rgba(124, 96, 255, .35))",
        }}
      />

      {/* === METİNLER === */}
      <div style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}>
        {[t.p1, t.p2, t.p3, t.p4].map((para, idx) => (
          <p key={idx} style={{ color: theme.muted, lineHeight: 1.8, marginTop: idx === 0 ? 12 : 14 }}>
            <DecryptedText
              text={para}
              animateOn="view"
              revealDirection={idx % 2 === 0 ? "center" : "start"}
              speed={48 + idx * 2}
            />
          </p>
        ))}

        {/* Kart Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))",
            gap: 18,
            marginTop: 28,
          }}
        >
          {[
            { h: t.mission_h, p: t.mission_p },
            { h: t.vision_h, p: t.vision_p },
            { h: t.values_h, p: t.values_p },
          ].map((x) => (
            <div
              key={x.h}
              style={{
                border: `1px solid ${theme.border}`,
                borderRadius: 16,
                background: "linear-gradient(180deg, rgba(17,24,42,.78) 0%, rgba(17,24,42,.64) 100%)",
                padding: 18,
                boxShadow: "0 8px 40px rgba(0,0,0,.28)",
                backdropFilter: "blur(4px)",
              }}
            >
              <h3 style={{ marginTop: 2, marginBottom: 8, color: theme.text, textAlign: "center" }}>
                <DecryptedText text={x.h} animateOn="view" revealDirection="center" />
              </h3>
              <p style={{ color: theme.muted, margin: 0, textAlign: "center", lineHeight: 1.7 }}>
                <DecryptedText text={x.p} animateOn="view" revealDirection="end" speed={60} />
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}