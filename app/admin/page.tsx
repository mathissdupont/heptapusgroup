import { prisma } from "@/lib/db";
import Link from "next/link";
import { requireElevated } from "@/lib/admin";
import { redirect } from "next/navigation";
import { AUDIT_ACTIONS } from "@/lib/audit";
import { systemHealth } from "@/lib/health";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const user = await requireElevated();
  if (!user) redirect("/login");
  const isAdmin = user.role === "ADMIN";
  const [activeProjects, drafts, media, subscribers, applications, unreadMessages, recent, health] = await Promise.all([
    prisma.project.count({ where: { status: "LIVE" } }).catch(() => null),
    prisma.project.count({ where: { status: "DRAFT" } }).catch(() => null),
    prisma.media.count().catch(() => null),
    prisma.subscriber.count({ where: { isActive: true } }).catch(() => null),
    prisma.jobApplication.count().catch(() => null),
    isAdmin ? prisma.contactMessage.count({ where: { read: false } }).catch(() => null) : Promise.resolve(null),
    isAdmin ? prisma.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8 }).catch(() => null) : Promise.resolve(null),
    isAdmin ? systemHealth() : Promise.resolve(null),
  ]);
  const stats = [
    { label: "Yayındaki projeler", value: activeProjects, href: "/admin/projects" },
    { label: "Taslak projeler", value: drafts, href: "/admin/projects" },
    { label: "Medya dosyaları", value: media, href: "/admin/gallery" },
    { label: "Aktif aboneler", value: subscribers, href: "/admin/subscribers" },
    { label: "İş başvuruları", value: applications, href: "/admin/careers" },
    ...(isAdmin ? [{ label: "Okunmamış mesajlar", value: unreadMessages, href: "/admin/messages" }] : []),
  ];
  const unavailable = stats.some((stat) => stat.value === null);
  return <div className="space-y-7">
    <div className="flex flex-wrap items-center justify-between gap-4">
      <div><h1 className="text-3xl font-bold text-white">Dashboard</h1><p className="mt-2 text-slate-400">Hoş geldin, {user.name || user.email}.</p></div>
      <Link href="/admin/projects" className="rounded-xl bg-sky-600 px-4 py-3 text-white">Projeleri yönet</Link>
    </div>
    {unavailable && <p role="alert" className="rounded-lg bg-amber-500/10 p-4 text-sm text-amber-300">Bazı veriler okunamadı. Veritabanı bağlantısını ve migration durumunu kontrol edin.</p>}
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => <Link key={stat.label} href={stat.href} className="rounded-2xl border border-white/10 bg-slate-900/50 p-6 hover:border-sky-500/50">
        <p className="text-sm text-slate-400">{stat.label}</p><p className="mt-2 text-3xl font-bold text-white">{stat.value ?? "—"}</p>
      </Link>)}
    </div>
    {isAdmin && <div className="grid gap-6 lg:grid-cols-2">
      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <div className="mb-4 flex flex-wrap justify-between gap-2"><h2 className="text-lg font-semibold text-white">Son hesap işlemleri</h2><Link href="/admin/audit" className="text-sm text-sky-300">Tüm geçmiş</Link></div>
        {recent === null ? <p className="text-sm text-amber-300">İşlem geçmişi okunamadı.</p> : recent.length ? <ul className="divide-y divide-white/10">
          {recent.map((entry) => <li key={entry.id} className="py-3 text-sm"><p className="text-white">{AUDIT_ACTIONS[entry.action as keyof typeof AUDIT_ACTIONS] || entry.action}</p><p className="break-all text-slate-400">{entry.actorEmail || "Giriş denemesi"} · {entry.createdAt.toLocaleString("tr-TR", { timeZone: "Europe/Istanbul" })}</p></li>)}
        </ul> : <p className="text-sm text-slate-400">Henüz işlem kaydı yok.</p>}
      </section>
      <section className="rounded-2xl border border-white/10 bg-slate-900/50 p-5">
        <h2 className="mb-4 text-lg font-semibold text-white">Sistem durumu</h2>
        {health && <dl className="space-y-4 text-sm text-slate-300">
          <div className="flex justify-between gap-3"><dt>Veritabanı</dt><dd className={health.database.ok ? "text-emerald-300" : "text-red-300"}>{health.database.ok ? `${health.database.ms} ms` : "Bağlantı hatası"}</dd></div>
          <div className="flex justify-between gap-3"><dt>Uygulama şeması</dt><dd className={health.schemaOk ? "text-emerald-300" : "text-red-300"}>{health.schemaOk ? "Güncel" : "Migration kontrolü gerekli"}</dd></div>
          <div className="flex justify-between gap-3"><dt>Dosya depolama</dt><dd className={health.storage.writable ? "text-emerald-300" : "text-red-300"}>{health.storage.writable ? "Yazılabilir" : "İzin / dizin hatası"}</dd></div>
          <div className="flex justify-between gap-3"><dt>Boş disk alanı</dt><dd>{health.storage.freeBytes === null ? "Ölçülemedi" : `${(health.storage.freeBytes / 1024 ** 3).toFixed(1)} GB`}</dd></div>
          <div className="flex justify-between gap-3"><dt>Uygulama çalışma süresi</dt><dd>{Math.floor(health.uptimeSeconds / 60)} dk</dd></div>
        </dl>}
      </section>
    </div>}
  </div>;
}
