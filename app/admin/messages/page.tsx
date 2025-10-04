"use client";

import useSWR from "swr";
import { jfetch } from "@/lib/fetcher";
import AdminGuard from "@/components/AdminGuard";

type Message = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export default function MessagesPage() {
  return (
    <AdminGuard allow={["ADMIN"]}>
      <MessagesInner />
    </AdminGuard>
  );
}

function MessagesInner() {
  const { data, mutate } = useSWR<{ items: Message[] }>(
    "/api/admin/messages",
    jfetch
  );

  async function markAsRead(id: string, read: boolean) {
    await jfetch("/api/admin/messages", {
      method: "PUT",
      body: JSON.stringify({ id, read }),
    });
    mutate();
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold">Gelen Mesajlar</h1>

      <div className="rounded border border-white/10 divide-y divide-white/10 bg-slate-900/40">
        {data?.items?.length ? (
          data.items.map((m) => (
            <div
              key={m.id}
              className="p-4 hover:bg-white/5 transition flex flex-col gap-2"
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-semibold">{m.subject}</div>
                  <div className="text-sm text-slate-400">
                    {m.name} • {m.email}
                  </div>
                </div>
                <button
                  onClick={() => markAsRead(m.id, !m.read)}
                  className={`px-3 py-1 rounded text-xs ${
                    m.read
                      ? "bg-emerald-600 text-white"
                      : "bg-sky-600 text-white"
                  }`}
                >
                  {m.read ? "Okundu" : "Okunmadı"}
                </button>
              </div>

              <div className="text-slate-300 text-sm whitespace-pre-line">
                {m.message}
              </div>

              <div className="text-xs opacity-60">
                {new Date(m.createdAt).toLocaleString("tr-TR")}
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-slate-400">Hiç mesaj yok.</div>
        )}
      </div>
    </div>
  );
}
