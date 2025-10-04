"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/useMe";

export default function AdminGuard({ allow = ["ADMIN","EDITOR"], children }:{
  allow?: ("ADMIN"|"EDITOR"|"VIEWER")[], children: React.ReactNode
}) {
  const { me, isLoading } = useMe();
  const router = useRouter();

  useEffect(()=>{
    if (!isLoading) {
      if (!me) router.replace("/login");
      else if (!allow.includes(me.role)) router.replace("/");
    }
  }, [me, isLoading, router, allow]);

  if (isLoading || !me) return <div className="text-slate-400">Yükleniyor…</div>;
  if (!allow.includes(me.role)) return null;
  return <>{children}</>;
}
