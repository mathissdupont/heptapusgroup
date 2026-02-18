// components/SubdomainHome.tsx
"use client";

import Link from "next/link";

interface Feature {
  title: string;
  desc: string;
}

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

// Feature icon components for visual variety
const featureIcons = [
  // Layers
  (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M12 2L2 7l10 5 10-5-10-5z" />
      <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  // Star
  (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  // Shield
  (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  // Zap
  (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  ),
  // Globe
  (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  // Users
  (color: string) => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
];

export default function SubdomainHome({ subdomain }: SubdomainHomeProps) {
  const themeColor = subdomain.themeColor || "#3b82f6";

  // Safely parse settings
  let settings: any = {};
  try {
    settings = typeof subdomain.settings === "string"
      ? JSON.parse(subdomain.settings)
      : subdomain.settings || {};
  } catch {
    settings = {};
  }

  const features: Feature[] = settings.features || [];
  const tagline = settings.tagline || "";
  const contactEmail = settings.contactEmail || "";
  const heroImage = settings.heroImage || "";

  return (
    <div className="mx-auto max-w-[1200px] w-[95%] py-16">
      {/* Hero Section */}
      <section className="text-center py-20 relative">
        {heroImage && (
          <div className="absolute inset-0 -z-10 opacity-10 rounded-3xl overflow-hidden">
            <img src={heroImage} alt="" className="w-full h-full object-cover" />
          </div>
        )}

        {subdomain.logoUrl && (
          <div className="flex justify-center mb-8">
            <div
              className="h-24 w-24 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: `${themeColor}15` }}
            >
              <img
                src={subdomain.logoUrl}
                alt={subdomain.title}
                className="h-16 w-16 object-contain"
              />
            </div>
          </div>
        )}

        {tagline && (
          <div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium mb-6"
            style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: themeColor }} />
            {tagline}
          </div>
        )}

        <h1
          className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
          style={{ color: themeColor }}
        >
          {subdomain.title}
        </h1>

        {subdomain.description && (
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto mb-10">
            {subdomain.description}
          </p>
        )}

        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all no-underline text-white hover:opacity-90 shadow-lg"
            style={{ backgroundColor: themeColor }}
          >
            Get in Touch
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>

          <Link
            href="/about"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all no-underline border-2 hover:bg-accent"
            style={{ borderColor: themeColor, color: themeColor }}
          >
            Learn More
          </Link>

          <Link
            href="/services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all no-underline text-muted-foreground hover:text-foreground border border-border hover:border-foreground/20"
          >
            Our Services
          </Link>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mt-16 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Division of", value: "Heptapus Group" },
            { label: "Contact", value: contactEmail || `${subdomain.name}@heptapusgroup.com` },
            { label: "Services", value: `${features.length}+ Areas` },
            { label: "Status", value: "Active" },
          ].map((stat, i) => (
            <div key={i} className="text-center p-4 rounded-lg border border-border bg-card/50">
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</div>
              <div className="font-semibold text-sm">{stat.value}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features / Services Section */}
      {features.length > 0 && (
        <section className="mt-20 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-3">Our Expertise</h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Specialized services and solutions from {subdomain.title}
            </p>
          </div>

          <div className={`grid gap-6 ${features.length <= 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
            {features.map((feature, index) => {
              const IconFn = featureIcons[index % featureIcons.length];
              return (
                <div
                  key={index}
                  className="group p-6 border border-border rounded-xl hover:shadow-lg transition-all duration-300 bg-card/50 hover:bg-card"
                  style={{ borderColor: `${themeColor}20` }}
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${themeColor}15` }}
                  >
                    {IconFn(themeColor)}
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-medium no-underline hover:opacity-70 transition-opacity"
              style={{ color: themeColor }}
            >
              View all services
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14" />
                <path d="m12 5 7 7-7 7" />
              </svg>
            </Link>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="mt-20 py-16 text-center">
        <div
          className="rounded-2xl p-12"
          style={{ backgroundColor: `${themeColor}08`, border: `1px solid ${themeColor}20` }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-8">
            Contact {subdomain.title} today to discuss how we can help achieve your goals
            with our specialized expertise.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all no-underline text-white hover:opacity-90 shadow-lg"
              style={{ backgroundColor: themeColor }}
            >
              Contact Us
            </Link>
            {contactEmail && (
              <a
                href={`mailto:${contactEmail}`}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all no-underline border border-border hover:bg-accent"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                {contactEmail}
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
