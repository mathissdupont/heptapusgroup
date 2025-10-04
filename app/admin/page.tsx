// app/admin/page.tsx
import AdminGuard from "@/components/AdminGuard";
import { prisma } from "@/lib/db";

export default async function AdminHome() {
  const [userCount, projectCount, uploadCount] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.upload.count(),  //
  ]);

  return (
    <AdminGuard>
      <div>
        <h1 className="text-2xl font-bold mb-6">Hoş geldin 👋</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <div className="text-slate-400 text-sm">Kullanıcılar</div>
            <div className="text-2xl font-bold">{userCount}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <div className="text-slate-400 text-sm">Projeler</div>
            <div className="text-2xl font-bold">{projectCount}</div>
          </div>
          <div className="rounded-lg border border-white/10 bg-white/5 p-5">
            <div className="text-slate-400 text-sm">Yüklemeler</div>
            <div className="text-2xl font-bold">{uploadCount}</div>
          </div>
        </div>
      </div>
    </AdminGuard>
  );
}
