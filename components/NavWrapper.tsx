"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import GooeyNav from "@/components/GooeyNav";
import LocaleSwitcher from "@/components/LocaleSwitcher"; 

type Item = { label: string; href: string };

export default function NavWrapper() {
  const pathname = usePathname() || "/";

  // Admin sayfalarında navbar hiç render etme
  if (pathname.startsWith("/admin")) {
    return null;
  }

  const items: Item[] = useMemo(
    () => [
      { label: "Home", href: "/" },
      { label: "About", href: "/about" },
      { label: "Projects", href: "/projects" },
      { label: "Team", href: "/team" },
      { label: "Contact", href: "/contact" },
    ],
    []
  );

  // aktif tab indexini bul
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

  return (
    <div className="relative h-[72px] flex items-center justify-between">
      {/* Sol: Gooey Nav */}
      <GooeyNav
        key={pathname}
        items={items}
        initialActiveIndex={activeIndex}
        particleCount={15}
        particleDistances={[90, 10]}
        particleR={100}
        animationTime={600}
        timeVariance={300}
        colors={[1, 2, 3, 1, 2, 3, 1, 4]}
      />

      {/* Sağ: Dil değiştirici */}
      <div className="absolute right-4">
        <LocaleSwitcher />
      </div>
    </div>
  );
}
