// app/admin/page.tsx
import AdminGuard from "@/components/AdminGuard";
import { prisma } from "@/lib/db";
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

  // loadavg -> yüzde (core sayısına normalize)
  const cores = os.cpus().length || 1;
  const load1 = os.loadavg?.()[0] ?? 0;
  const serverLoadPct = Math.max(0, Math.min(100, Math.round((load1 / cores) * 100)));

  const trendPct =
    uploadsPrevWeek === 0
      ? (uploadsThisWeek > 0 ? 100 : 0)
      : Math.round(((uploadsThisWeek - uploadsPrevWeek) / uploadsPrevWeek) * 100);


  const stats = [
    {
      label: "Toplam Kullanıcı",
      value: userCount,
      icon: UsersIcon,
      color: "text-indigo-400",
      bg: "bg-indigo-400/10",
      border: "group-hover:border-indigo-500/50",
    },
    {
      label: "Aktif Projeler",
      value: projectCount,
      icon: FolderIcon,
      color: "text-sky-400",
      bg: "bg-sky-400/10",
      border: "group-hover:border-sky-500/50",
    },
    {
      label: "Yüklenen Dosyalar",
      value: uploadCount,
      icon: CloudArrowUpIcon,
      color: "text-emerald-400",
      bg: "bg-emerald-400/10",
      border: "group-hover:border-emerald-500/50",
    },
  ];

  return (
    <AdminGuard>
      <div className="space-y-8 animate-in fade-in duration-500">
        
        {/* Karşılama Bölümü */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Hoş geldin, Şef 👋
            </h1>
            <p className="text-slate-400 mt-1">
              Bugün sistem genelinde her şey yolunda görünüyor.
            </p>
          </div>
          <div className="flex gap-3">
             <Link href="/admin/projects/new" className="flex items-center gap-2 bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium transition shadow-lg shadow-sky-500/20">
                <PlusIcon className="w-5 h-5" />
                <span>Yeni Proje</span>
             </Link>
          </div>
        </div>

        {/* İstatistik Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div 
                key={index} 
                className={`group relative overflow-hidden rounded-2xl bg-slate-900/50 border border-white/5 p-6 transition-all duration-300 hover:shadow-2xl hover:shadow-black/50 ${stat.border}`}
              >
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                  <Icon className="w-24 h-24" />
                </div>
                
                <div className="relative z-10 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-400">{stat.label}</p>
                    <h3 className="text-3xl font-extrabold text-white mt-1">{stat.value}</h3>
                  </div>
                </div>
                
                {/* Alt bilgi (Opsiyonel Trend) */}
                <div className="mt-4 flex items-center gap-2 text-xs font-medium text-slate-500">
                  <ArrowTrendingUpIcon className="w-4 h-4 text-emerald-500" />
                  <span className={`${trendPct >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                    {trendPct >= 0 ? "+" : ""}{trendPct}%
                  </span>
                  <span>geçen haftaya göre</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Alt Bölümler Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Hızlı İşlemler */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 col-span-1 lg:col-span-2">
            <h3 className="text-lg font-semibold text-white mb-4">Hızlı Erişim</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
               {[
                 { label: "Medya Yükle", href: "/admin/uploads", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
                 { label: "Kullanıcı Ekle", href: "/admin/users", color: "bg-pink-500/10 text-pink-400 border-pink-500/20" },
                 { label: "Logları İncele", href: "/admin/settings", color: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
                 { label: "Mesaj Oku", href: "/admin/messages", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
               ].map((action, i) => (
                 <Link 
                   key={i} 
                   href={action.href}
                   className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border ${action.color} hover:bg-opacity-20 transition cursor-pointer`}
                 >
                   <span className="font-medium text-sm">{action.label}</span>
                 </Link>
               ))}
            </div>
          </div>

          {/* Sistem Durumu / Özet */}
          <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Sistem Durumu</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Sunucu Yükü</span>
                <span className="text-emerald-400 font-bold">%{serverLoadPct}</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${serverLoadPct}%` }}></div>
              </div>

              <div className="flex justify-between items-center text-sm mt-4">
                <span className="text-slate-400">Veritabanı</span>
                <span className={`${dbOk ? "text-sky-400" : "text-rose-400"} font-bold`}>
                  {dbOk ? `Stabil (${dbMs}ms)` : "Hata"}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                <div className="bg-sky-500 h-2 rounded-full" style={{ width: "95%" }}></div>
              </div>
              
              <div className="pt-4 mt-2 border-t border-white/5 text-xs text-slate-500">
                Son güncelleme: Şimdi
              </div>
            </div>
          </div>

        </div>

      </div>
    </AdminGuard>
  );
}