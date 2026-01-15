// app/admin/messages/page.tsx
"use client";

import useSWR from "swr";
import { useState } from "react";
import { jfetch } from "@/lib/fetcher";
import AdminGuard from "@/components/AdminGuard";
import { 
  EnvelopeIcon, 
  EnvelopeOpenIcon, 
  UserCircleIcon,
  CheckCircleIcon,
  ClockIcon,
  InboxIcon,
  ArrowUturnLeftIcon,
  FunnelIcon
} from "@heroicons/react/24/outline";

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

  const [filter, setFilter] = useState<"ALL" | "UNREAD" | "READ">("ALL");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function markAsRead(id: string, currentStatus: boolean, e: React.MouseEvent) {
    e.stopPropagation(); // Kartın açılmasını engelle
    // Optimistic Update (Anlık arayüz güncellemesi)
    mutate(
      (currentData) => {
        if (!currentData) return undefined;
        return {
          ...currentData,
          items: currentData.items.map((m) =>
            m.id === id ? { ...m, read: !currentStatus } : m
          ),
        };
      },
      false
    );

    await jfetch("/api/admin/messages", {
      method: "PUT",
      body: JSON.stringify({ id, read: !currentStatus }),
    });
    
    mutate(); // Gerçek veriyi doğrula
  }

  // Filtreleme Mantığı
  const items = data?.items || [];
  const filteredItems = items.filter((m) => {
    if (filter === "UNREAD") return !m.read;
    if (filter === "READ") return m.read;
    return true;
  });

  const unreadCount = items.filter((m) => !m.read).length;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* --- Header --- */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            Gelen Kutusu
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center px-2.5 py-1 text-sm font-bold leading-none text-white bg-sky-500 rounded-full shadow-lg shadow-sky-500/30">
                {unreadCount} yeni
              </span>
            )}
          </h1>
          <p className="text-slate-400 mt-1">
            Web sitesinden gelen iletişim formlarını buradan yönetebilirsin.
          </p>
        </div>

        {/* --- Tabs / Filters --- */}
        <div className="flex bg-slate-900/50 p-1 rounded-xl border border-white/10">
          {[
            { key: "ALL", label: "Tümü" },
            { key: "UNREAD", label: "Okunmamış" },
            { key: "READ", label: "Okunmuş" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === tab.key
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- Mesaj Listesi --- */}
      <div className="space-y-4">
        {!data ? (
          // Loading Skeleton
          [1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-slate-900/50 border border-white/5 animate-pulse" />
          ))
        ) : filteredItems.length > 0 ? (
          filteredItems.map((m) => {
            const isExpanded = expandedId === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setExpandedId(isExpanded ? null : m.id)}
                className={`group relative rounded-2xl border transition-all duration-300 cursor-pointer overflow-hidden
                  ${
                    m.read
                      ? "bg-slate-950/30 border-white/5 hover:border-white/10"
                      : "bg-slate-900 border-sky-500/20 shadow-lg shadow-sky-900/10 hover:border-sky-500/40"
                  }
                `}
              >
                {/* Sol Kenar Çizgisi (Okunmamışsa Mavi) */}
                {!m.read && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500" />
                )}

                <div className="p-5 flex flex-col md:flex-row gap-4 md:items-start">
                  
                  {/* Avatar / Icon */}
                  <div className="flex-shrink-0 mt-1">
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold
                        ${m.read ? 'bg-slate-800 text-slate-500' : 'bg-sky-500/20 text-sky-400'}
                     `}>
                        {m.name.charAt(0).toUpperCase()}
                     </div>
                  </div>

                  {/* İçerik Özeti */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className={`text-base font-semibold truncate ${m.read ? 'text-slate-400' : 'text-slate-100'}`}>
                        {m.subject}
                      </h3>
                      <span className="text-xs text-slate-500 flex items-center gap-1 flex-shrink-0">
                        <ClockIcon className="w-3.5 h-3.5" />
                        {new Date(m.createdAt).toLocaleDateString("tr-TR", { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' })}
                      </span>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-slate-500 mb-2">
                       <span className="font-medium text-slate-400">{m.name}</span>
                       <span className="hidden sm:inline">•</span>
                       <span className="font-mono text-xs opacity-75">{m.email}</span>
                    </div>

                    {/* Mesaj (Collapsed/Expanded) */}
                    <div className={`text-sm leading-relaxed transition-colors ${m.read ? 'text-slate-500' : 'text-slate-300'}`}>
                      {isExpanded ? (
                         <div className="animate-in fade-in slide-in-from-top-2 whitespace-pre-wrap mt-2 pt-4 border-t border-white/5">
                           {m.message}
                         </div>
                      ) : (
                         <p className="line-clamp-1 opacity-70">
                           {m.message}
                         </p>
                      )}
                    </div>
                  </div>

                  {/* Butonlar (Hover'da daha belirgin) */}
                  <div className="flex items-center gap-2 self-start md:self-center ml-auto md:opacity-50 md:group-hover:opacity-100 transition-opacity">
                    
                    {/* Okundu/Okunmadı Butonu */}
                    <button
                      onClick={(e) => markAsRead(m.id, m.read, e)}
                      title={m.read ? "Okunmadı olarak işaretle" : "Okundu olarak işaretle"}
                      className={`p-2 rounded-lg transition border ${
                        m.read 
                          ? "bg-slate-800 border-transparent text-slate-400 hover:text-white" 
                          : "bg-sky-500/10 border-sky-500/30 text-sky-400 hover:bg-sky-500 hover:text-white"
                      }`}
                    >
                      {m.read ? <EnvelopeOpenIcon className="w-5 h-5" /> : <EnvelopeIcon className="w-5 h-5" />}
                    </button>

                    {/* Yanıtla (Mailto) */}
                    <a
                      href={`mailto:${m.email}?subject=Re: ${m.subject}`}
                      onClick={(e) => e.stopPropagation()}
                      title="E-posta ile yanıtla"
                      className="p-2 rounded-lg bg-slate-800 border border-transparent text-slate-400 hover:text-white hover:bg-slate-700 transition"
                    >
                      <ArrowUturnLeftIcon className="w-5 h-5" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center py-24 text-slate-500 bg-slate-900/30 rounded-3xl border border-dashed border-white/5">
            <div className="p-4 bg-slate-800 rounded-full mb-4">
               <InboxIcon className="w-8 h-8 opacity-50" />
            </div>
            <p className="text-lg font-medium text-slate-300">Gelen kutusu boş</p>
            <p className="text-sm">Şu an gösterilecek mesaj bulunmuyor.</p>
          </div>
        )}
      </div>
    </div>
  );
}