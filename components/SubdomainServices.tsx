// components/SubdomainServices.tsx
"use client";

import Link from "next/link";

interface Feature {
  title: string;
  desc: string;
}

interface SubdomainServicesProps {
  subdomain: {
    name: string;
    title: string;
    description?: string | null;
    logoUrl?: string | null;
    themeColor?: string | null;
    settings?: any;
  };
}

const serviceIcons = [
  // Code
  (color: string) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  // CPU
  (color: string) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
      <rect x="9" y="9" width="6" height="6" />
      <line x1="9" y1="1" x2="9" y2="4" /><line x1="15" y1="1" x2="15" y2="4" />
      <line x1="9" y1="20" x2="9" y2="23" /><line x1="15" y1="20" x2="15" y2="23" />
      <line x1="20" y1="9" x2="23" y2="9" /><line x1="20" y1="14" x2="23" y2="14" />
      <line x1="1" y1="9" x2="4" y2="9" /><line x1="1" y1="14" x2="4" y2="14" />
    </svg>
  ),
  // Settings
  (color: string) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  // Rocket
  (color: string) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  // Target
  (color: string) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  // Shield
  (color: string) => (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color }}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  ),
];

export default function SubdomainServices({ subdomain }: SubdomainServicesProps) {
  const themeColor = subdomain.themeColor || "#3b82f6";

  let settings: any = {};
  try {
    settings = typeof subdomain.settings === "string"
      ? JSON.parse(subdomain.settings)
      : subdomain.settings || {};
  } catch {
    settings = {};
  }

  const features: Feature[] = settings.features || [];
  const contactEmail = settings.contactEmail || `${subdomain.name}@heptapusgroup.com`;

  return (
    <div className="mx-auto max-w-[1200px] w-[95%] py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors no-underline">Home</Link>
        <span>/</span>
        <span className="text-foreground">Services</span>
      </nav>

      {/* Header */}
      <section className="mb-16 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ color: themeColor }}>
          Our Services
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
          Comprehensive solutions and expertise from {subdomain.title}
        </p>
      </section>

      {/* Services Grid */}
      {features.length > 0 ? (
        <section className="mb-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {features.map((feature, index) => {
              const IconFn = serviceIcons[index % serviceIcons.length];
              return (
                <div
                  key={index}
                  className="group p-8 rounded-xl border border-border hover:shadow-xl transition-all duration-300 bg-card/50 hover:bg-card relative overflow-hidden"
                >
                  {/* Background accent */}
                  <div
                    className="absolute top-0 right-0 w-32 h-32 rounded-full -translate-y-1/2 translate-x-1/2 opacity-[0.03]"
                    style={{ backgroundColor: themeColor }}
                  />

                  <div className="relative">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
                      style={{ backgroundColor: `${themeColor}12` }}
                    >
                      {IconFn(themeColor)}
                    </div>

                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className="text-xs font-mono px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <h3 className="text-xl font-bold">{feature.title}</h3>
                    </div>

                    <p className="text-muted-foreground leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="mb-20 text-center py-16 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground text-lg">
            Services information coming soon.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Contact us directly for more details about our offerings.
          </p>
        </section>
      )}

      {/* Process Section */}
      <section className="mb-20">
        <h2 className="text-3xl font-bold text-center mb-12">How We Work</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Discovery", desc: "Understanding your needs, goals, and current challenges" },
            { step: "02", title: "Planning", desc: "Developing a comprehensive strategy and roadmap" },
            { step: "03", title: "Execution", desc: "Implementing solutions with agile methodology" },
            { step: "04", title: "Delivery", desc: "Continuous support and optimization" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold"
                style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
              >
                {item.step}
              </div>
              <h3 className="font-semibold mb-2">{item.title}</h3>
              <p className="text-sm text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section
        className="rounded-2xl p-12 text-center"
        style={{ backgroundColor: `${themeColor}08`, border: `1px solid ${themeColor}20` }}
      >
        <h2 className="text-3xl font-bold mb-4">Need a Custom Solution?</h2>
        <p className="text-muted-foreground max-w-lg mx-auto mb-8">
          Every project is unique. Let&apos;s discuss your specific requirements and find the best approach.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all no-underline text-white hover:opacity-90"
            style={{ backgroundColor: themeColor }}
          >
            Start a Conversation
          </Link>
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold transition-all no-underline border border-border hover:bg-accent"
          >
            {contactEmail}
          </a>
        </div>
      </section>
    </div>
  );
}
