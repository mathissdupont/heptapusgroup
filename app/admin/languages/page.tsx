"use client";

import { useState } from "react";
import AdminGuard from "@/components/AdminGuard";
import { SUPPORTED_LOCALES, LOCALE_LABELS, LOCALE_FLAGS } from "@/lib/get-dictionary";

/**
 * Admin Languages Page
 * Shows the supported locales, their status, and provides info about the translation system.
 * Default language (TR) stores content in main DB fields; other languages use the `translations` JSON field.
 */

const LOCALE_INFO: Record<string, { name: string; region: string; code: string }> = {
  tr: { name: "Türkçe", region: "Türkiye", code: "tr-TR" },
  en: { name: "English", region: "International", code: "en-US" },
  de: { name: "Deutsch", region: "Deutschland / Österreich / Schweiz", code: "de-DE" },
};

const TRANSLATABLE_MODELS = [
  { model: "Project", fields: ["title", "summary", "content"], admin: "/admin/projects" },
  { model: "BlogPost", fields: ["title", "excerpt", "content"], admin: "/admin/blog" },
  { model: "FaqItem", fields: ["question", "answer"], admin: "/admin/faq" },
  { model: "JobPosting", fields: ["title", "description", "requirements"], admin: "/admin/careers" },
  { model: "Testimonial", fields: ["content", "author"], admin: null },
  { model: "Announcement", fields: ["content"], admin: "/admin/announcements" },
];

export default function AdminLanguagesPage() {
  const [defaultLang] = useState("tr");

  return (
    <AdminGuard>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Dil Yönetimi</h1>
          <p className="text-sm text-slate-400 mt-1">
            Sitede desteklenen diller ve çeviri yapısının genel görünümü.
          </p>
        </div>

        {/* Supported Languages */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Desteklenen Diller</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {SUPPORTED_LOCALES.map((loc) => {
              const info = LOCALE_INFO[loc];
              const isDefault = loc === defaultLang;
              return (
                <div
                  key={loc}
                  className={`rounded-xl border p-5 transition-colors ${
                    isDefault
                      ? "border-sky-500/40 bg-sky-500/5"
                      : "border-white/10 bg-slate-800/50"
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl">{LOCALE_FLAGS[loc]}</span>
                    <div>
                      <div className="font-semibold text-white flex items-center gap-2">
                        {LOCALE_LABELS[loc]}
                        {isDefault && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-sky-500/20 text-sky-400 px-2 py-0.5 rounded">
                            Varsayılan
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400">{info?.name} — {info?.region}</div>
                    </div>
                  </div>
                  <div className="text-xs text-slate-500">
                    <span className="font-mono bg-slate-900 px-1.5 py-0.5 rounded">{info?.code}</span>
                    <span className="ml-2">
                      {isDefault ? "Ana alanlar (main DB fields)" : "translations JSON alanı"}
                    </span>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                    <span className="text-xs text-emerald-400">Aktif</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Translatable Content Models */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Çevrilebilir İçerik Modelleri</h2>
          <p className="text-sm text-slate-400">
            Aşağıdaki modellerdeki alanlar her dil için ayrı olarak düzenlenebilir. 
            Admin formlarında dil sekmelerini (🇹🇷 TR / 🇬🇧 EN / 🇩🇪 DE) kullanarak çeviri ekleyebilirsiniz.
          </p>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-800/80 text-slate-400">
                <tr>
                  <th className="px-4 py-3">Model</th>
                  <th className="px-4 py-3">Çevrilebilir Alanlar</th>
                  <th className="px-4 py-3">Admin Sayfası</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {TRANSLATABLE_MODELS.map((m) => (
                  <tr key={m.model} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-white font-medium font-mono text-xs">{m.model}</td>
                    <td className="px-4 py-3 text-slate-300">
                      <div className="flex flex-wrap gap-1.5">
                        {m.fields.map((f) => (
                          <span key={f} className="bg-slate-700 text-slate-300 px-2 py-0.5 rounded text-xs font-mono">{f}</span>
                        ))}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {m.admin ? (
                        <a href={m.admin} className="text-sky-400 hover:text-sky-300 text-xs underline">{m.admin}</a>
                      ) : (
                        <span className="text-slate-500 text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Nasıl Çalışır?</h2>
          <div className="rounded-xl border border-white/10 bg-slate-800/50 p-6">
            <div className="space-y-3 text-sm text-slate-300">
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">1</span>
                <p><strong className="text-white">Varsayılan dil (Türkçe)</strong> içeriği veritabanındaki ana alanlarda saklanır (title, content, vb.).</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">2</span>
                <p><strong className="text-white">Diğer diller</strong> (EN, DE) <code className="bg-slate-900 px-1.5 py-0.5 rounded text-xs">translations</code> JSON alanında saklanır.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">3</span>
                <p>Admin formlarında <strong className="text-white">dil sekmeleri</strong> arasında geçiş yaparak her dildeki içeriği ayrı ayrı yazabilirsiniz.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">4</span>
                <p>Kullanıcı tarayıcısının dil ayarına veya dil seçiciye göre (sağ üst köşedeki bayrak menüsü) otomatik olarak doğru dil gösterilir.</p>
              </div>
              <div className="flex gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-sky-500/20 text-sky-400 flex items-center justify-center text-xs font-bold">5</span>
                <p>Çevirisi bulunmayan içerikler otomatik olarak <strong className="text-white">Türkçe&apos;ye</strong> (varsayılan dil) geri düşer.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Static UI Translations */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-white">Statik Arayüz Çevirileri</h2>
          <div className="rounded-xl border border-white/10 bg-slate-800/50 p-6">
            <p className="text-sm text-slate-300">
              Menü başlıkları, buton metinleri, form etiketleri gibi statik arayüz metinleri 
              <code className="bg-slate-900 px-1.5 py-0.5 rounded text-xs mx-1">dictionaries/</code>
              klasöründeki JSON dosyalarında tutulur:
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {SUPPORTED_LOCALES.map((loc) => (
                <span key={loc} className="inline-flex items-center gap-1.5 bg-slate-700 px-3 py-1 rounded text-xs text-slate-300">
                  <span>{LOCALE_FLAGS[loc]}</span>
                  <code className="font-mono">dictionaries/{loc}.json</code>
                </span>
              ))}
            </div>
          </div>
        </section>
      </div>
    </AdminGuard>
  );
}
