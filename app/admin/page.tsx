// app/admin/page.tsx
import AdminGuard from "@/components/AdminGuard";
import { prisma } from "@/lib/db";

export const dynamic = 'force-dynamic';
import { 
  UsersIcon, 
  FolderIcon, 
  CloudArrowUpIcon, 
  ArrowTrendingUpIcon,
  PlusIcon
} from "@heroicons/react/24/outline";
import Link from "next/link";
import os from "os";

export default async function AdminHome() {
  // --- Veri Çekme İşlemleri (Aynı) ---
  const now = new Date();
  const days = (n: number) => new Date(now.getTime() - n * 24 * 60 * 60 * 1000);
  const t0 = Date.now();
  
  const [userCount, projectCount, uploadCount, dbOk, uploadsThisWeek, uploadsPrevWeek] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.upload.count(),
    prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
    prisma.upload.count({ where: { createdAt: { gte: days(7) } } }).catch(() => 0),
    prisma.upload.count({ where: { createdAt: { gte: days(14), lt: days(7) } } }).catch(() => 0),
  ]);
  const dbMs = Date.now() - t0;

  const cores = os.cpus().length || 1;
  const load1 = os.loadavg?.()[0] ?? 0;
  const serverLoadPct = Math.max(0, Math.min(100, Math.round((load1 / cores) * 100)));

  const trendPct =
    uploadsPrevWeek === 0
      ? (uploadsThisWeek > 0 ? 100 : 0)
      : Math.round(((uploadsThisWeek - uploadsPrevWeek) / uploadsPrevWeek) * 100);

  const stats = [
    { label: "Toplam Kullanıcı", value: userCount, icon: UsersIcon, color: "text-indigo-400", bg: "bg-indigo-400/10", border: "group-hover:border-indigo-500/50" },
    { label: "Aktif Projeler", value: projectCount, icon: FolderIcon, color: "text-sky-400", bg: "bg-sky-400/10", border: "group-hover:border-sky-500/50" },
    { label: "Yüklenen Dosyalar", value: uploadCount, icon: CloudArrowUpIcon, color: "text-emerald-400", bg: "bg-emerald-400/10", border: "group-hover:border-emerald-500/50" },
  ];

  return (
    <AdminGuard>
      <div className="space-y-8">
        
        {/* --- Header Bölümü (Navbar yerine burası var artık) --- */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white tracking-tight">Dashboard</h1>
              <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-500 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Sistem Online
              </div>
            </div>
            <p className="text-slate-400">
              Hoş geldin Şef 👋, bugün her şey yolunda görünüyor.
            </p>
          </div>
          
          <div className="flex gap-3">
             <Link href="/admin/projects/new" className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2.5 rounded-xl font-medium transition shadow-lg shadow-sky-500/20 group">
                <PlusIcon className="w-5 h-5 transition-transform group-hover:rotate-90" />
                <span>Yeni Proje</span>
             </Link>
          </div>
        </div>

        {/* --- İstatistik Kartları --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className={`group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-white/5 p-6 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${stat.border}`}>
                <div className="absolute -top-6 -right-6 opacity-5 group-hover:opacity-10 transition-all duration-500 rotate-12 group-hover:rotate-0">
                  <Icon className="w-32 h-32" />
                </div>
                <div className="relative z-10 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} ring-1 ring-inset ring-white/10`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                    <h3 className="text-3xl font-extrabold text-white mt-1 tracking-tight">{stat.value}</h3>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* --- Alt Grid (Hızlı Erişim & Sistem) --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Hızlı İşlemler */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Hızlı Erişim</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {[
                 { label: "Medya Yükle", href: "/admin/uploads", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
                 { label: "Kullanıcı Ekle", href: "/admin/users", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
                 { label: "Loglar", href: "/admin/logs", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
                 { label: "Mesajlar", href: "/admin/messages", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
               ].map((action, i) => (
                 <Link key={i} href={action.href} className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition hover:bg-opacity-20 hover:scale-[1.02] ${action.color}`}>
                   <span className="font-medium text-sm">{action.label}</span>
                 </Link>
               ))}
            </div>
          </div>

          {/* Sistem Durumu */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 flex flex-col justify-between">
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Sistem Durumu</h3>
                <div className="space-y-5">
                  <div>
                      <div className="flex justify-between items-end mb-2">
                          <span className="text-sm text-slate-400">Sunucu Yükü</span>
                          <span className="text-emerald-400 font-bold font-mono">%{serverLoadPct}</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className="h-1.5 rounded-full bg-emerald-500" style={{ width: `${serverLoadPct}%` }}></div>
                      </div>
                  </div>
                  <div>
                      <div className="flex justify-between items-end mb-2">
                          <span className="text-sm text-slate-400">Veritabanı</span>
                          <span className={`${dbOk ? "text-sky-400" : "text-rose-400"} font-bold font-mono text-sm`}>
                              {dbOk ? `${dbMs}ms` : "Hata"}
                          </span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-1.5 rounded-full ${dbOk ? 'bg-sky-500' : 'bg-rose-500'}`} style={{ width: "100%" }}></div>
                      </div>
                  </div>
                </div>
            </div>
          </div>
        </div>

      </div>
    </AdminGuard>
  );
}