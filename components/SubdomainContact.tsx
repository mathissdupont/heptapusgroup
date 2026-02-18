// components/SubdomainContact.tsx
"use client";

import { useState, useCallback, FormEvent } from "react";
import Link from "next/link";
import Turnstile from "@/components/Turnstile";

interface SubdomainContactProps {
  subdomain: {
    name: string;
    title: string;
    description?: string | null;
    logoUrl?: string | null;
    themeColor?: string | null;
    settings?: any;
  };
}

export default function SubdomainContact({ subdomain }: SubdomainContactProps) {
  const themeColor = subdomain.themeColor || "#3b82f6";

  let settings: any = {};
  try {
    settings = typeof subdomain.settings === "string"
      ? JSON.parse(subdomain.settings)
      : subdomain.settings || {};
  } catch {
    settings = {};
  }

  const contactEmail = settings.contactEmail || `${subdomain.name}@heptapusgroup.com`;
  const socialLinks = settings.socialLinks || {};

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const onTurnstileVerify = useCallback((token: string) => setTurnstileToken(token), []);
  const onTurnstileExpire = useCallback(() => setTurnstileToken(null), []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    setSuccess(false);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          subject: `[${subdomain.title}] ${formData.subject}`,
          turnstileToken,
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");

      setSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mx-auto max-w-[1200px] w-[95%] py-16">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8">
        <Link href="/" className="hover:text-foreground transition-colors no-underline">Home</Link>
        <span>/</span>
        <span className="text-foreground">Contact</span>
      </nav>

      {/* Header */}
      <section className="mb-12">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4" style={{ color: themeColor }}>
          Get in Touch
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px]">
          Have a question or want to work with {subdomain.title}? We&apos;d love to hear from you.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Contact Form */}
        <div className="lg:col-span-2">
          {success ? (
            <div
              className="p-8 rounded-xl text-center"
              style={{ backgroundColor: `${themeColor}08`, border: `1px solid ${themeColor}20` }}
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: `${themeColor}15` }}
              >
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: themeColor }}>
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold mb-2">Message Sent!</h2>
              <p className="text-muted-foreground mb-6">
                Thank you for reaching out to {subdomain.title}. We&apos;ll get back to you as soon as possible.
              </p>
              <button
                onClick={() => setSuccess(false)}
                className="px-6 py-2 rounded-lg font-medium text-white hover:opacity-90 transition-opacity"
                style={{ backgroundColor: themeColor }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 transition-shadow"
                    style={{ "--tw-ring-color": `${themeColor}40` } as any}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 transition-shadow"
                    style={{ "--tw-ring-color": `${themeColor}40` } as any}
                    placeholder="you@example.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Subject *</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 transition-shadow"
                  style={{ "--tw-ring-color": `${themeColor}40` } as any}
                  placeholder="What's this about?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message *</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-3 border border-border rounded-lg bg-background focus:outline-none focus:ring-2 transition-shadow resize-none"
                  style={{ "--tw-ring-color": `${themeColor}40` } as any}
                  placeholder="Tell us about your project or question..."
                  rows={6}
                  required
                />
              </div>

              <Turnstile
                onVerify={onTurnstileVerify}
                onExpire={onTurnstileExpire}
              />

              <button
                type="submit"
                disabled={sending || !turnstileToken}
                className="inline-flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                style={{ backgroundColor: themeColor }}
              >
                {sending ? (
                  <>
                    <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </>
                )}
              </button>
            </form>
          )}
        </div>

        {/* Contact Info Sidebar */}
        <div className="space-y-6">
          {/* Email Card */}
          <div className="p-6 rounded-xl border border-border bg-card/50">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: `${themeColor}15` }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: themeColor }}>
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Email</h3>
            <a
              href={`mailto:${contactEmail}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline"
            >
              {contactEmail}
            </a>
          </div>

          {/* Main Site Card */}
          <div className="p-6 rounded-xl border border-border bg-card/50">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center mb-3"
              style={{ backgroundColor: `${themeColor}15` }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: themeColor }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
            </div>
            <h3 className="font-semibold mb-1">Main Website</h3>
            <Link
              href="https://heptapusgroup.com"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline"
            >
              heptapusgroup.com
            </Link>
          </div>

          {/* Social Links */}
          {Object.values(socialLinks).some(Boolean) && (
            <div className="p-6 rounded-xl border border-border bg-card/50">
              <h3 className="font-semibold mb-3">Follow Us</h3>
              <div className="flex gap-3">
                {socialLinks.github && (
                  <a href={socialLinks.github} target="_blank" rel="noreferrer"
                     className="w-10 h-10 rounded-lg flex items-center justify-center border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.linkedin && (
                  <a href={socialLinks.linkedin} target="_blank" rel="noreferrer"
                     className="w-10 h-10 rounded-lg flex items-center justify-center border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.twitter && (
                  <a href={socialLinks.twitter} target="_blank" rel="noreferrer"
                     className="w-10 h-10 rounded-lg flex items-center justify-center border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </a>
                )}
                {socialLinks.instagram && (
                  <a href={socialLinks.instagram} target="_blank" rel="noreferrer"
                     className="w-10 h-10 rounded-lg flex items-center justify-center border border-border hover:bg-accent transition-colors text-muted-foreground hover:text-foreground">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                    </svg>
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Division Info */}
          <div
            className="p-6 rounded-xl"
            style={{ backgroundColor: `${themeColor}08`, border: `1px solid ${themeColor}20` }}
          >
            <h3 className="font-semibold mb-2" style={{ color: themeColor }}>{subdomain.title}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {subdomain.description || `A specialized division of Heptapus Group`}
            </p>
            <Link
              href="/"
              className="text-sm font-medium no-underline hover:opacity-70 transition-opacity"
              style={{ color: themeColor }}
            >
              Back to {subdomain.title} Home &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
