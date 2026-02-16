// components/SubdomainHome.tsx
"use client";

import Link from "next/link";

interface SubdomainHomeProps {
  subdomain: {
    name: string;
    title: string;
    description?: string | null;
    logoUrl?: string | null;
    themeColor?: string | null;
    settings?: any;
  };
}

// Feature icon SVGs by index
const featureIcons = [
  // Layers
  <svg key="0" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  // Sparkles
  <svg key="1" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4M19 17v4M3 5h4M17 19h4"/></svg>,
  // Users
  <svg key="2" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
];

export default function SubdomainHome({ subdomain }: SubdomainHomeProps) {
  const themeColor = subdomain.themeColor || "#3b82f6";

  let settings: any = {};
  try {
    settings = typeof subdomain.settings === "string"
      ? JSON.parse(subdomain.settings)
      : subdomain.settings || {};
  } catch {
    settings = {};
  }

  const features: { title: string; desc: string }[] = settings.features || [];

  return (
    <div>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden">
        {/* Gradient bg */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            background: `radial-gradient(ellipse 80% 50% at 50% -20%, ${themeColor}, transparent)`,
          }}
        />
        <div className="relative mx-auto max-w-[1120px] w-[92%] py-24 md:py-36 text-center">
          {subdomain.logoUrl && (
            <div className="flex justify-center mb-8">
              <img
                src={subdomain.logoUrl}
                alt={subdomain.title}
                className="h-24 w-24 md:h-32 md:w-32 object-contain drop-shadow-lg"
              />
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
            <span style={{ color: themeColor }}>{subdomain.title}</span>
          </h1>

          {settings.tagline && (
            <p className="text-lg md:text-xl text-muted-foreground font-medium mb-2">
              {settings.tagline}
            </p>
          )}

          {subdomain.description && (
            <p className="text-base text-muted-foreground max-w-[640px] mx-auto mb-10 leading-relaxed">
              {subdomain.description}
            </p>
          )}

          <div className="flex gap-4 justify-center flex-wrap">
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold transition-all no-underline text-white hover:brightness-110 shadow-lg"
              style={{ backgroundColor: themeColor }}
            >
              Get in Touch
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
            <Link
              href="https://heptapusgroup.com"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold transition-all no-underline border-2 hover:bg-accent/50"
              style={{ borderColor: `${themeColor}60`, color: themeColor }}
            >
              Heptapus Group
            </Link>
          </div>
        </div>
      </section>

      {/* ── ABOUT ── */}
      <section id="about" className="mx-auto max-w-[1120px] w-[92%] py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-14 items-center">
          <div>
            <h2 className="text-3xl font-bold mb-5">
              About <span style={{ color: themeColor }}>{subdomain.title}</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              {subdomain.title} is a specialized division of{" "}
              <strong>Heptapus Group</strong>, dedicated to delivering excellence in{" "}
              {subdomain.description?.toLowerCase().replace(/—.*/, "").trim() || "our field"}.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              We combine deep technical expertise with innovative approaches to create solutions that
              drive measurable results for our clients. As part of the Heptapus ecosystem, we leverage
              cross-divisional collaboration to deliver end-to-end project success.
            </p>
          </div>

          {/* Stats / highlights */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { num: "7+", label: "Divisions" },
              { num: "50+", label: "Projects Delivered" },
              { num: "24/7", label: "Support" },
              { num: "100%", label: "Client Satisfaction" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-5 rounded-xl border text-center"
                style={{ borderColor: `${themeColor}25` }}
              >
                <div className="text-2xl font-bold mb-1" style={{ color: themeColor }}>
                  {stat.num}
                </div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES / FEATURES ── */}
      {features.length > 0 && (
        <section id="services" className="py-20 border-t border-border">
          <div className="mx-auto max-w-[1120px] w-[92%]">
            <h2 className="text-3xl font-bold text-center mb-3">Our Services</h2>
            <p className="text-center text-muted-foreground mb-12 max-w-[500px] mx-auto">
              Specialized capabilities within {subdomain.title}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {features.map((feat, i) => (
                <div
                  key={i}
                  className="group p-7 rounded-xl border transition-all hover:shadow-lg"
                  style={{ borderColor: `${themeColor}30` }}
                >
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                  >
                    {featureIcons[i % featureIcons.length]}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{feat.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{feat.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA / CONTACT ── */}
      <section id="contact" className="py-20 border-t border-border">
        <div className="mx-auto max-w-[700px] w-[92%] text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            Whether you have a specific project in mind or just want to explore how {subdomain.title} can
            help, we&#39;d love to hear from you.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {settings.contactEmail && (
              <a
                href={`mailto:${settings.contactEmail}`}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold transition-all no-underline text-white hover:brightness-110 shadow-lg"
                style={{ backgroundColor: themeColor }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                {settings.contactEmail}
              </a>
            )}
            <Link
              href="https://heptapusgroup.com/contact"
              className="inline-flex items-center gap-2 px-7 py-3 rounded-lg font-semibold transition-all no-underline border-2 hover:bg-accent/50"
              style={{ borderColor: `${themeColor}50`, color: themeColor }}
            >
              Contact Form ↗
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
