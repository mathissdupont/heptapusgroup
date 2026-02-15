"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import ThemeToggle from "@/components/ThemeToggle";

type Item = { label: string; href: string };

interface NavWrapperProps {
  items: Item[];
  brand?: string;
  brandSub?: string;
}

export default function CorporateNav({ items, brand = "Heptapus", brandSub }: NavWrapperProps) {
  const pathname = usePathname() || "/";

  const activeIndex = useMemo(() => {
    let best = 0;
    let bestLen = -1;
    items.forEach((it, i) => {
      if (pathname === it.href || pathname.startsWith(it.href + "/")) {
        if (it.href.length > bestLen) {
          best = i;
          bestLen = it.href.length;
        }
      }
    });
    return best;
  }, [pathname, items]);

  // Admin sayfalarında navbar gösterme
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="flex h-16 items-center justify-between">
      {/* Sol: Logo + Brand */}
      <Link href="/" className="flex items-center gap-2.5 font-bold text-foreground no-underline hover:opacity-80 transition-opacity">
        <img
          src="/icons/heptapus_logo_white.png"
          alt=""
          width={32}
          height={32}
          className="shrink-0 dark:invert-0 invert"
        />
        <div className="flex flex-col leading-tight">
          <span className="text-lg tracking-tight">{brand}</span>
          {brandSub && <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">{brandSub}</span>}
        </div>
      </Link>

      {/* Orta: Nav Links */}
      <nav className="hidden md:flex items-center gap-1">
        {items.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${i === activeIndex
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }
            `}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      {/* Sağ: Dil + Tema */}
      <div className="flex items-center gap-2">
        <LocaleSwitcher />
        <ThemeToggle />
      </div>
    </div>
  );
}
