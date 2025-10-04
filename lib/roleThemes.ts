// lib/roleThemes.ts
export type RoleKey =
  | "frontend"
  | "backend"
  | "qa"
  | "security"
  | "mechanical"
  | "software";

export type RoleTheme = {
  pillars: [string, string, string, string, string, string];
  iconUrl: string;          // varsa /public/icons/... svg/png
  innerGradient: string;    // kart içi tint
  behindGradient: string;   // arka holo tint
};

// Renkleri istersen sonra değiştirirsin
export const ROLE_THEMES: Record<RoleKey, RoleTheme> = {
  frontend: {
    pillars: ["#6ee7ff", "#a78bfa", "#7dd3fc", "#60a5fa", "#818cf8", "#93c5fd"],
    iconUrl: "/icons/code.svg",
    innerGradient: "linear-gradient(145deg,#22304a 0%,#0f172a 100%)",
    behindGradient:
      "radial-gradient(35% 52% at 55% 20%, #1fd1ff55 0%, #0000 100%),conic-gradient(from 124deg at 50% 50%, #6ee7ff 0%, #a78bfa 40%, #a78bfa 60%, #6ee7ff 100%)",
  },
  backend: {
    pillars: ["#22d3ee","#38bdf8","#0ea5e9","#06b6d4","#0891b2","#7dd3fc"],
    iconUrl: "/icons/code.svg",
    innerGradient: "linear-gradient(145deg,#1b2a44 0%,#0b1324 100%)",
    behindGradient:
      "radial-gradient(35% 52% at 55% 20%, #00f0ff33 0%, #0000 100%),conic-gradient(from 124deg at 50% 50%, #22d3ee 0%, #38bdf8 40%, #38bdf8 60%, #22d3ee 100%)",
  },
  qa: {
    pillars: ["#f472b6","#fb7185","#fda4af","#f43f5e","#f97316","#f59e0b"],
    iconUrl: "/icons/code.svg",
    innerGradient: "linear-gradient(145deg,#3a2440 0%,#1a1728 100%)",
    behindGradient:
      "radial-gradient(35% 52% at 55% 20%, #ff7ab333 0%, #0000 100%),conic-gradient(from 124deg at 50% 50%, #f472b6 0%, #fb7185 40%, #fb7185 60%, #f472b6 100%)",
  },
  security: {
    pillars: ["#34d399","#4ade80","#22c55e","#10b981","#059669","#a7f3d0"],
    iconUrl: "/icons/code.svg",
    innerGradient: "linear-gradient(145deg,#103226 0%,#0a1f18 100%)",
    behindGradient:
      "radial-gradient(35% 52% at 55% 20%, #22c55e33 0%, #0000 100%),conic-gradient(from 124deg at 50% 50%, #34d399 0%, #4ade80 40%, #4ade80 60%, #34d399 100%)",
  },
  mechanical: {
    pillars: ["#f59e0b","#fb923c","#f97316","#fbbf24","#fca311","#fdba74"],
    iconUrl: "/icons/cog.svg",
    innerGradient: "linear-gradient(145deg,#2d2516 0%,#1a140a 100%)",
    behindGradient:
      "radial-gradient(35% 52% at 55% 20%, #ffb74a33 0%, #0000 100%),conic-gradient(from 124deg at 50% 50%, #f59e0b 0%, #fb923c 40%, #fb923c 60%, #f59e0b 100%)",
  },
  software: {
    pillars: ["#c084fc","#a78bfa","#818cf8","#60a5fa","#7dd3fc","#93c5fd"],
    iconUrl: "/icons/code.svg",
    innerGradient: "linear-gradient(145deg,#2b2540 0%,#161629 100%)",
    behindGradient:
      "radial-gradient(35% 52% at 55% 20%, #a78bfa33 0%, #0000 100%),conic-gradient(from 124deg at 50% 50%, #c084fc 0%, #60a5fa 40%, #60a5fa 60%, #c084fc 100%)",
  },
};
