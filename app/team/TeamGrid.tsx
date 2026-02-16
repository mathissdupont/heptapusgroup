// app/team/TeamGrid.tsx
"use client";
import React from "react";
import ProfileCard from "@/components/ProfileCard";

// Tip ismini genelleyelim (Member -> GridItem)
type GridItem = {
  name: string;
  title: string;
  handle: string;
  status: string;
  contactText: string;
  avatarUrl: string;
  iconUrl: string;
  grainUrl?: string;
  contactHref?: string;
};

// Prop ismini de 'team' yerine 'items' yapalım ki daha genel olsun
export default function TeamGrid({ items }: { items: GridItem[] }) {
  return (
    <section className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
      <div className="grid gap-6 sm:gap-8 lg:gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
        {items.map((item) => (
          <div key={item.handle} className="w-full max-w-[360px] sm:max-w-none transition-transform hover:-translate-y-1 duration-300">
            <ProfileCard
              name={item.name}
              title={item.title}
              handle={item.handle}
              status={item.status}
              contactText={item.contactText}
              avatarUrl={item.avatarUrl}
              showUserInfo
              enableTilt
              enableMobileTilt={false}
              grainUrl={item.grainUrl}
              iconUrl={item.iconUrl}
              contactHref={item.contactHref}
            />
          </div>
        ))}
      </div>
    </section>
  );
}