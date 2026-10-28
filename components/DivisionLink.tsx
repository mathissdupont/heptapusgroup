"use client";
import Link from "next/link";
import { createContext, useContext, type ComponentProps, type ReactNode } from "react";

const Prefix = createContext("");
export function DivisionLocaleProvider({ prefix, children }: { prefix: string; children: ReactNode }) {
  return <Prefix.Provider value={prefix}>{children}</Prefix.Provider>;
}
export default function DivisionLink({ href, ...props }: ComponentProps<typeof Link>) {
  const prefix = useContext(Prefix);
  const localized = typeof href === "string" && href.startsWith("/") && !href.startsWith("//") && !/^\/(tr|en|de)(\/|$)/.test(href);
  return <Link {...props} href={prefix && localized ? `${prefix}${href === "/" ? "" : href}` : href} />;
}
