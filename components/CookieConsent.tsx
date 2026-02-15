"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface CookieConsentProps {
  message: string;
  accept: string;
  decline: string;
  learnMore: string;
}

export default function CookieConsent({ message, accept, decline, learnMore }: CookieConsentProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setShow(true);
  }, []);

  const handle = (choice: "accepted" | "declined") => {
    localStorage.setItem("cookie-consent", choice);
    setShow(false);
  };

  if (!show) return null;

  return (
    <div className="fixed bottom-0 inset-x-0 z-[60] p-4 md:p-6">
      <div className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/95 backdrop-blur-md p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-card-foreground leading-relaxed">
          {message}{" "}
          <Link href="/privacy" className="underline hover:text-primary transition-colors">
            {learnMore}
          </Link>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={() => handle("declined")}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary transition-colors"
          >
            {decline}
          </button>
          <button
            onClick={() => handle("accepted")}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
          >
            {accept}
          </button>
        </div>
      </div>
    </div>
  );
}
