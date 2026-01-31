"use client";

import { usePathname } from "next/navigation";
import NavWrapper from "@/components/NavWrapper";

export default function NavbarClient({ items }: { items: any[] }) {
  const pathname = usePathname();
  
  // Mevcut URL'e göre hangi indexin aktif olduğunu buluyoruz
  const activeIndex = items.findIndex(item => 
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  );

  return (
    <NavWrapper
      items={items}
      particleCount={15}
      particleDistances={[90, 10]}
      particleR={100}
      initialActiveIndex={activeIndex !== -1 ? activeIndex : 0} // Dinamik hale geldi!
      animationTime={600}
      timeVariance={300}
      colors={[1, 2, 3, 1, 2, 3, 1, 4]}
    />
  );
}