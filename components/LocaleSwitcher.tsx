// components/LocaleSwitcher.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function LocaleSwitcher() {
  const pathname = usePathname();
  const otherLocale = pathname.startsWith("/en") ? "tr" : "en";

  // URL başındaki /en veya /tr'yi diğer dile çevir
  const newPath = pathname.replace(/^\/(en|tr)/, `/${otherLocale}`);

  return (
    <Link
      href={newPath}
      className="px-3 py-1 rounded border border-white/10 hover:bg-white/5 transition"
    >
      {otherLocale.toUpperCase()}
    </Link>
  );
}
