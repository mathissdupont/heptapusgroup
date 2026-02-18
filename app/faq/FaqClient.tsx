"use client";

import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { getTranslatedField } from "@/lib/i18n";
import type { Locale } from "@/lib/get-dictionary";

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  translations?: any;
}

interface FaqClientProps {
  t: {
    title: string;
    subtitle: string;
    no_items: string;
  };
  lang: Locale;
}

export default function FaqClient({ t, lang }: FaqClientProps) {
  const [items, setItems] = useState<FaqItem[]>([]);
  const [open, setOpen] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/faq")
      .then((r) => r.json())
      .then((d) => setItems(d.items ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Group by category
  const categories = items.reduce<Record<string, FaqItem[]>>((acc, item) => {
    const cat = item.category || "General";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(item);
    return acc;
  }, {});

  return (
    <main className="mx-auto max-w-3xl px-4 py-20">
      <div className="text-center mb-14">
        <h1 className="text-4xl font-bold text-foreground mb-3">{t.title}</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">{t.subtitle}</p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <p className="text-center text-muted-foreground py-10">{t.no_items}</p>
      ) : (
        <div className="space-y-10">
          {Object.entries(categories).map(([category, catItems]) => (
            <div key={category}>
              {Object.keys(categories).length > 1 && (
                <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">
                  {category}
                </h2>
              )}
              <div className="space-y-3">
                {catItems.map((item) => {
                  const question = getTranslatedField(item, "question", lang);
                  const answer = getTranslatedField(item, "answer", lang);
                  return (
                    <div
                      key={item.id}
                      id={item.id}
                      className="rounded-xl border border-border bg-card overflow-hidden"
                    >
                      <button
                        onClick={() => setOpen(open === item.id ? null : item.id)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-secondary/50 transition-colors"
                      >
                        <span className="font-medium text-foreground pr-4">{question}</span>
                        <ChevronDown
                          className={`h-5 w-5 text-muted-foreground flex-shrink-0 transition-transform duration-200 ${
                            open === item.id ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {open === item.id && (
                        <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border pt-3">
                          {answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
