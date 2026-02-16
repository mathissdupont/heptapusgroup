// components/SubdomainLayout.tsx
"use client";

import Link from "next/link";
import { ReactNode } from "react";

interface SubdomainLayoutProps {
  children: ReactNode;
  subdomain: {
    name: string;
    title: string;
    description?: string;
    logoUrl?: string;
    themeColor?: string;
  };
}

export default function SubdomainLayout({ children, subdomain }: SubdomainLayoutProps) {
  const themeColor = subdomain.themeColor || "#3b82f6";
  
  return (
    <div className="min-h-screen flex flex-col">
      {/* Subdomain Header */}
      <header 
        className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md"
        style={{ borderBottomColor: `${themeColor}20` }}
      >
        <div className="mx-auto w-[92%] max-w-[1120px] py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 no-underline group">
              {subdomain.logoUrl && (
                <img 
                  src={subdomain.logoUrl} 
                  alt={subdomain.title}
                  className="h-10 w-10 object-contain"
                />
              )}
              <div>
                <h1 className="text-2xl font-bold text-foreground m-0 group-hover:opacity-80 transition-opacity">
                  {subdomain.title}
                </h1>
                {subdomain.description && (
                  <p className="text-sm text-muted-foreground m-0">{subdomain.description}</p>
                )}
              </div>
            </Link>
            
            <Link 
              href="https://heptapusgroup.com" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors no-underline flex items-center gap-2"
            >
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Back to Heptapus Group
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 relative z-10">
        {children}
      </main>

      {/* Subdomain Footer */}
      <footer className="relative z-0 mt-12 border-t border-border bg-card/50">
        <div className="mx-auto w-[92%] max-w-[1120px] py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
            <div>© {new Date().getFullYear()} {subdomain.title} - A Division of Heptapus Group</div>
            <Link 
              href="https://heptapusgroup.com" 
              className="text-muted-foreground hover:text-foreground transition-colors no-underline"
            >
              heptapusgroup.com
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
