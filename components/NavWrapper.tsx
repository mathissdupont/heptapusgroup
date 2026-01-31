"use client";

import { useMemo } from "react";
import { usePathname } from "next/navigation";
import GooeyNav from "@/components/GooeyNav";
import LocaleSwitcher from "@/components/LocaleSwitcher"; 

// Dışarıdan gelecek öğelerin tipi
type Item = { label: string; href: string };

interface NavWrapperProps {
  items: Item[]; // RootLayout'tan gelen tercüme edilmiş dizi
  particleCount?: number;
  particleDistances?: number[];
  particleR?: number;
  initialActiveIndex?: number;
  animationTime?: number;
  timeVariance?: number;
  colors?: number[];
}

export default function NavWrapper({
  items,
  particleCount = 15,
  particleDistances = [90, 10],
  particleR = 100,
  initialActiveIndex,
  animationTime = 600,
  timeVariance = 300,
  colors = [1, 2, 3, 1, 2, 3, 1, 4],
}: NavWrapperProps) {
  const pathname = usePathname() || "/";

  // Aktif tab indexini bul (Artık prop olarak gelen items'ı kullanıyoruz)
  const computedIndex = useMemo(() => {
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

  // Admin sayfalarında navbar hiç render etme
  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="relative h-[72px] flex items-center justify-between">
      {/* Sol: Gooey Nav */}
      <div className="flex-1">
        <GooeyNav
          key={pathname} // Dil değiştiğinde animasyonun sıfırlanması için
          items={items}
          initialActiveIndex={initialActiveIndex ?? computedIndex}
          particleCount={particleCount}
          particleDistances={particleDistances}
          particleR={particleR}
          animationTime={animationTime}
          timeVariance={timeVariance}
          colors={colors}
        />
      </div>

      {/* Sağ: Dil değiştirici */}
      <div className="ml-4">
        <LocaleSwitcher />
      </div>
    </div>
  );
}