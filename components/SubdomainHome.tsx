// components/SubdomainHome.tsx
"use client";

import Link from "next/link";

interface SubdomainHomeProps {
  subdomain: {
    name: string;
    title: string;
    description?: string;
    logoUrl?: string;
    themeColor?: string;
    settings?: any;
  };
}

export default function SubdomainHome({ subdomain }: SubdomainHomeProps) {
  const themeColor = subdomain.themeColor || "#3b82f6";
  
  // Safely parse settings with error handling
  let settings: any = {};
  try {
    settings = typeof subdomain.settings === 'string' 
      ? JSON.parse(subdomain.settings) 
      : subdomain.settings || {};
  } catch (error) {
    console.error('Failed to parse subdomain settings:', error);
    settings = {};
  }
  
  return (
    <div className="mx-auto max-w-[1200px] w-[95%] py-16">
      {/* Hero Section */}
      <section className="text-center py-20">
        {subdomain.logoUrl && (
          <div className="flex justify-center mb-8">
            <img 
              src={subdomain.logoUrl} 
              alt={subdomain.title}
              className="h-32 w-32 object-contain"
            />
          </div>
        )}
        
        <h1 
          className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
          style={{ color: themeColor }}
        >
          Welcome to {subdomain.title}
        </h1>
        
        {subdomain.description && (
          <p className="text-xl text-muted-foreground max-w-[600px] mx-auto mb-8">
            {subdomain.description}
          </p>
        )}
        
        <div className="flex gap-4 justify-center flex-wrap">
          <Link
            href="https://heptapusgroup.com/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all no-underline text-white hover:opacity-90"
            style={{ backgroundColor: themeColor }}
          >
            Get in Touch
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M5 12h14" />
              <path d="m12 5 7 7-7 7" />
            </svg>
          </Link>
          
          <Link
            href="https://heptapusgroup.com"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all no-underline border-2 hover:bg-accent"
            style={{ borderColor: themeColor, color: themeColor }}
          >
            About Heptapus Group
          </Link>
        </div>
      </section>

      {/* About Section */}
      <section className="mt-20 py-16 border-t border-border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="text-3xl font-bold mb-4">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed">
              {subdomain.title} is a specialized division of Heptapus Group, dedicated to delivering 
              excellence in {subdomain.description?.toLowerCase() || 'our field'}. We combine innovation 
              with expertise to provide cutting-edge solutions that drive success.
            </p>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold mb-4">Get Started</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Ready to learn more about our services? Contact us today to discuss how we can help 
              achieve your goals.
            </p>
            {settings.contactEmail && (
              <a 
                href={`mailto:${settings.contactEmail}`}
                className="inline-flex items-center gap-2 text-foreground hover:opacity-70 transition-opacity no-underline"
              >
                <svg 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
                {settings.contactEmail}
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mt-20 py-16">
        <h2 className="text-4xl font-bold text-center mb-12">Why Choose Us</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 border border-border rounded-lg hover:border-current transition-colors" style={{ borderColor: `${themeColor}40` }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${themeColor}20` }}>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ color: themeColor }}
              >
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Expert Team</h3>
            <p className="text-muted-foreground">
              Our experienced professionals bring deep industry knowledge and technical expertise.
            </p>
          </div>
          
          <div className="p-6 border border-border rounded-lg hover:border-current transition-colors" style={{ borderColor: `${themeColor}40` }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${themeColor}20` }}>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ color: themeColor }}
              >
                <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
                <path d="M5 3v4M19 17v4M3 5h4M17 19h4" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Innovation First</h3>
            <p className="text-muted-foreground">
              We leverage cutting-edge technologies and methodologies to deliver superior results.
            </p>
          </div>
          
          <div className="p-6 border border-border rounded-lg hover:border-current transition-colors" style={{ borderColor: `${themeColor}40` }}>
            <div className="w-12 h-12 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: `${themeColor}20` }}>
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                style={{ color: themeColor }}
              >
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Client Focused</h3>
            <p className="text-muted-foreground">
              Your success is our priority. We work closely with you to achieve your objectives.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
