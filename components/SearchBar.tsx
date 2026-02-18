"use client";

import { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import Link from "next/link";

interface SearchResult {
  type: "project" | "blog" | "faq";
  title: string;
  url: string;
  desc?: string | null;
}

const DEFAULT_TYPE_LABELS: Record<string, string> = {
  project: "Project",
  blog: "Blog",
  faq: "FAQ",
};

interface SearchBarProps {
  t?: {
    placeholder?: string;
    searching?: string;
    no_results?: string;
    types?: Record<string, string>;
  };
}

export default function SearchBar({ t }: SearchBarProps = {}) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (query.length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    timeoutRef.current = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then((r) => r.json())
        .then((d) => setResults(d.results ?? []))
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [query]);

  const close = () => {
    setIsOpen(false);
    setQuery("");
    setResults([]);
  };

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2.5 text-foreground hover:text-foreground/60 transition-colors"
        aria-label="Search"
      >
        <Search className="h-5 w-5" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={close} />

          {/* Modal */}
          <div className="relative w-full max-w-lg mx-4 rounded-xl border border-border bg-background shadow-2xl overflow-hidden">
            <div className="flex items-center gap-3 border-b border-border px-4">
              <Search className="h-5 w-5 text-muted-foreground flex-shrink-0" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t?.placeholder || "Search projects, blog, FAQ..."}
                className="flex-1 py-4 text-sm bg-transparent outline-none placeholder:text-muted-foreground"
              />
              <button onClick={close} className="p-1 rounded hover:bg-secondary transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">{t?.searching || "Searching..."}</div>
              )}
              {!loading && query.length >= 2 && results.length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                  {(t?.no_results || "No results found for \"{q}\"").replace("{q}", query)}
                </div>
              )}
              {!loading && results.length > 0 && (
                <ul className="py-2">
                  {results.map((r, i) => (
                    <li key={i}>
                      <Link
                        href={r.url}
                        onClick={close}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-secondary transition-colors"
                      >
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground mt-0.5 flex-shrink-0 w-12">
                          {(t?.types || DEFAULT_TYPE_LABELS)[r.type] || r.type}
                        </span>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{r.title}</div>
                          {r.desc && (
                            <div className="text-xs text-muted-foreground truncate mt-0.5">{r.desc}</div>
                          )}
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
