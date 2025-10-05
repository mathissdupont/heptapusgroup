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
  grainUrl: string;
};

export default function TeamGrid({ team }: { team: Member[] }) {
  return (
    <section className="mx-auto w-full max-w-[1120px] px-4 sm:px-6">
      <div
        className="
          grid
          gap-6 sm:gap-8 xl:gap-10
          grid-cols-1 sm:grid-cols-2 xl:grid-cols-3
          place-items-stretch
        "
      >
        {team.map((m) => (
          <div key={m.handle} className="w-full max-w-[380px] mx-auto md:max-w-none">
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
            />
          </div>
        ))}
      </div>
    </section>
  );
}
