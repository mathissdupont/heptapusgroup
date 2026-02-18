"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-foreground">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      </div>

      <h2 className="text-2xl font-bold text-foreground mb-2">Bir şeyler yanlış gitti</h2>
      <p className="text-muted-foreground max-w-md mb-8">
        Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin veya ana sayfaya dönün.
      </p>

      <div className="flex items-center gap-3">
        <button
          onClick={reset}
          className="inline-flex items-center rounded-lg px-5 py-2.5 font-semibold bg-foreground text-background hover:opacity-90 transition-colors shadow-sm"
        >
          Tekrar Dene
        </button>
        <Link
          href="/"
          className="inline-flex items-center rounded-lg border border-border px-5 py-2.5 font-semibold text-foreground hover:bg-secondary transition-colors"
        >
          Ana Sayfa
        </Link>
      </div>
    </div>
  );
}
