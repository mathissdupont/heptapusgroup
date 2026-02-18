"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface Announcement {
  id: string;
  message: string;
  linkUrl?: string | null;
  linkText?: string | null;
  bgColor?: string | null;
}

const COLOR_MAP: Record<string, string> = {
  violet: "bg-violet-600 text-white",
  blue: "bg-blue-600 text-white",
  green: "bg-green-600 text-white",
  red: "bg-red-600 text-white",
  yellow: "bg-yellow-500 text-black",
};

export default function AnnouncementBar() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const dismissedId = sessionStorage.getItem("dismissed_announcement");
    fetch("/api/announcements")
      .then((r) => r.json())
      .then((d) => {
        if (d.item && d.item.id !== dismissedId) {
          setAnnouncement(d.item);
        }
      })
      .catch(() => {});
  }, []);

  if (!announcement || dismissed) return null;

  const colorClass = COLOR_MAP[announcement.bgColor || "violet"] || COLOR_MAP.violet;

  const dismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("dismissed_announcement", announcement.id);
  };

  return (
    <div className={`${colorClass} relative`}>
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-10 py-2.5 text-center text-sm font-medium">
        <span>{announcement.message}</span>
        {announcement.linkUrl && announcement.linkText && (
          <a
            href={announcement.linkUrl}
            className="underline underline-offset-2 font-bold hover:no-underline"
          >
            {announcement.linkText}
          </a>
        )}
      </div>
      <button
        onClick={dismiss}
        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-black/10 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
