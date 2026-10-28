"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMe } from "@/lib/useMe";

export default function AdminGuard({ allow = ["ADMIN","EDITOR"], children }:{
  allow?: ("ADMIN"|"EDITOR"|"VIEWER")[], children: React.ReactNode
}) {
  const { me, isLoading, error, mutate } = useMe();
  const router = useRouter();

  useEffect(()=>{
    if (!isLoading && !error) {
      if (!me) router.replace("/login");
      else if (!allow.includes(me.role)) router.replace("/");
    }
  }, [me, isLoading, error, router, allow]);

  if (error) return <div role="alert" className="rounded-lg border border-red-500/30 bg-red-500/10 p-5 text-sm text-red-300"><p>{error instanceof Error ? error.message : "Oturum kontrol edilemedi."}</p><button onClick={() => mutate()} className="underline mt-3">Tekrar dene</button></div>;

  if (isLoading || !me) return <div className="text-slate-400">Yükleniyor…</div>;
  if (!allow.includes(me.role)) return null;
  return <>{children}</>;
}
