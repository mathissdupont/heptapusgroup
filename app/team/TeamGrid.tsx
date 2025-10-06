// app/team/TeamGrid.tsx
"use client";
import React from "react";
import ProfileCard from "@/components/ProfileCard";

type Member = {
  name: string;
  title: string;
  handle: string;
  status: string;
  contactText: string;
  avatarUrl: string;
  iconUrl: string;
  grainUrl?: string;
  contactHref?: string;   // <-- SADECE BU KALSIN
};

export default function TeamGrid({ team }: { team: Member[] }) {
  return (
    <section className="mx-auto w-full max-w-[1120px] px-3 sm:px-6">
      <div className="grid gap-4 sm:gap-5 lg:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 place-items-center">
        {team.map((m) => (
          <div key={m.handle} className="w-full max-w-[330px] sm:max-w-[380px] mx-auto md:max-w-none">
            <ProfileCard
              name={m.name}
              title={m.title}
              handle={m.handle}
              status={m.status}
              contactText={m.contactText}
              avatarUrl={m.avatarUrl}
              showUserInfo
              enableTilt
              enableMobileTilt={false}
              grainUrl={m.grainUrl}
              iconUrl={m.iconUrl}
              contactHref={m.contactHref}   // <-- DOĞRU PROP
            />
          </div>
        ))}
      </div>
    </section>
  );
}
