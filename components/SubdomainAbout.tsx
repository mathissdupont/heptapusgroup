// components/SubdomainAbout.tsx
"use client";

import Link from "next/link";

interface SubdomainAboutProps {
  subdomain: {
    name: string;
    title: string;
    description?: string | null;
    logoUrl?: string | null;
    themeColor?: string | null;
    settings?: any;
  };
}

export default function SubdomainAbout({ subdomain }: SubdomainAboutProps) {
  const themeColor = subdomain.themeColor || "#3b82f6";

  let settings: any = {};
  try {
    settings = typeof subdomain.settings === "string"
      ? JSON.parse(subdomain.settings)
      : subdomain.settings || {};
  } catch {
    settings = {};
  }

  const aboutText = settings.aboutText || "";
  const features = settings.features || [];
  const contactEmail = settings.contactEmail || `${subdomain.name}@heptapusgroup.com`;

  return (
    <div className="mx-auto max-w-[1200px] w-[95%] py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors no-underline">Home</Link>
        <span>/</span>
        <span className="text-foreground">About</span>
      </nav>

      {/* Hero Section */}
      <section className="mb-16">
        <div className="flex items-center gap-4 mb-6">
          {subdomain.logoUrl && (
            <div
              className="h-16 w-16 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${themeColor}15` }}
            >
              <img
                src={subdomain.logoUrl}
                alt={subdomain.title}
                className="h-10 w-10 object-contain"
              />
            </div>
          )}
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight" style={{ color: themeColor }}>
              About {subdomain.title}
            </h1>
            {settings.tagline && (
              <p className="text-muted-foreground mt-1">{settings.tagline}</p>
            )}
          </div>
        </div>

        {subdomain.description && (
          <p className="text-xl text-muted-foreground max-w-[800px] leading-relaxed">
            {subdomain.description}
          </p>
        )}
      </section>

      {/* About Content */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
        <div>
          <h2 className="text-2xl font-bold mb-4">Who We Are</h2>
          {aboutText ? (
            <div className="text-muted-foreground leading-relaxed whitespace-pre-line">
              {aboutText}
            </div>
          ) : (
            <p className="text-muted-foreground leading-relaxed">
              {subdomain.title} is a specialized division of Heptapus Group, dedicated to delivering
              excellence in {subdomain.description?.toLowerCase() || "our field"}. We combine innovation
              with expertise to provide cutting-edge solutions that drive real-world results.
            </p>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-6">
            As part of the Heptapus Group family, we leverage shared resources, cross-division
            collaboration, and deep domain expertise to tackle the most challenging problems
            in our field.
          </p>

          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: `${themeColor}08`, border: `1px solid ${themeColor}20` }}
          >
            <h3 className="font-semibold mb-2" style={{ color: themeColor }}>Part of Heptapus Group</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Heptapus Group is a multidisciplinary technology company with 7 specialized divisions,
              each bringing unique expertise to deliver comprehensive solutions.
            </p>
            <Link
              href="https://heptapusgroup.com/about"
              className="text-sm font-medium no-underline hover:opacity-70 transition-opacity"
              style={{ color: themeColor }}
            >
              Learn more about Heptapus Group &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* Core Competencies */}
      {features.length > 0 && (
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Core Competencies</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((feature: any, index: number) => (
              <div
                key={index}
                className="p-5 rounded-lg border border-border bg-card/50 hover:bg-card transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center mb-3 text-sm font-bold"
                  style={{ backgroundColor: `${themeColor}15`, color: themeColor }}
                >
                  {String(index + 1).padStart(2, "0")}
                </div>
                <h3 className="font-semibold mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="text-center py-12">
        <h2 className="text-2xl font-bold mb-3">Interested in Working With Us?</h2>
        <p className="text-muted-foreground mb-6 max-w-lg mx-auto">
          Get in touch to learn how {subdomain.title} can help you achieve your goals.
        </p>
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all no-underline text-white hover:opacity-90"
            style={{ backgroundColor: themeColor }}
          >
            Contact Us
          </Link>
          <a
            href={`mailto:${contactEmail}`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all no-underline border border-border hover:bg-accent"
          >
            {contactEmail}
          </a>
        </div>
      </section>
    </div>
  );
}
