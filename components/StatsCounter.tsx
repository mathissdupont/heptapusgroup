"use client";

import { useEffect, useRef, useState } from "react";

interface Stat {
  label: string;
  value: number;
  suffix?: string;
}

const DEFAULT_STATS: Stat[] = [
  { label: "Sub-Companies", value: 7, suffix: "" },
  { label: "Projects Delivered", value: 50, suffix: "+" },
  { label: "Team Members", value: 30, suffix: "+" },
  { label: "Years of Innovation", value: 5, suffix: "+" },
];

interface StatsCounterProps {
  t?: { companies: string; projects: string; team: string; years: string };
  values?: { companies?: number; projects?: number; team?: number; years?: number };
}

function AnimatedNumber({ target, suffix }: { target: number; suffix: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const duration = 1500;
          const start = performance.now();
          const step = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.round(eased * target));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [target]);

  return (
    <span ref={ref} className="tabular-nums">
      {count}
      {suffix}
    </span>
  );
}

export default function StatsCounter({ t, values }: StatsCounterProps) {
  const stats: Stat[] = t
    ? [
        { label: t.companies, value: values?.companies ?? 7, suffix: "" },
        { label: t.projects, value: values?.projects ?? 50, suffix: "+" },
        { label: t.team, value: values?.team ?? 30, suffix: "+" },
        { label: t.years, value: values?.years ?? 5, suffix: "+" },
      ]
    : DEFAULT_STATS;

  return (
    <section className="py-20 border-y border-border bg-card/60">
      <div className="mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {stats.map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl md:text-5xl font-bold text-foreground mb-2">
                <AnimatedNumber target={stat.value} suffix={stat.suffix ?? ""} />
              </div>
              <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
