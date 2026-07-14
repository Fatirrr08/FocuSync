"use client";

import React, { useEffect, useRef, useState } from "react";
import type { SessionStats } from "@/types";

interface StatCardConfig {
  label: string;
  icon: string;
  color: string;
  gradient: string;
  subtitle: string;
  getValue: (stats: SessionStats) => number;
}

const cards: StatCardConfig[] = [
  { label: "Total Poin", icon: "⭐", color: "violet", gradient: "from-violet/20 to-violet/5", subtitle: "Akumulasi poin fokus", getValue: (s) => s.totalPoints },
  { label: "Sesi Sukses", icon: "✅", color: "emerald", gradient: "from-emerald/20 to-emerald/5", subtitle: "Sesi berhasil diselesaikan", getValue: (s) => s.totalSessions },
  { label: "Streak Harian", icon: "🔥", color: "amber", gradient: "from-amber/20 to-amber/5", subtitle: "Hari beruntun fokus", getValue: (s) => s.streak },
  { label: "Total Fokus", icon: "⏱️", color: "violet", gradient: "from-violet/20 to-violet/5", subtitle: "Menit fokus terkumpul", getValue: (s) => s.totalFocusMinutes },
];

const countUpColors: Record<string, string> = {
  violet: "text-violet-light",
  emerald: "text-emerald-light",
  amber: "text-amber",
};

function CountUp({ target, color }: { target: number; color: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<number>(0);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const duration = 1200;
    const start = performance.now();

    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      ref.current = Math.floor(eased * target);
      setCount(ref.current);
      if (progress < 1) animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [target]);

  return <span className={`text-3xl font-display font-bold ${countUpColors[color] || "text-violet-light"}`}>{count.toLocaleString()}</span>;
}

const dotColors: Record<string, string> = {
  violet: "bg-violet",
  emerald: "bg-emerald",
  amber: "bg-amber",
};

interface StatsGridProps {
  stats: SessionStats;
}

export default function StatsGrid({ stats }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <div
          key={card.label}
          className="bg-glass border border-glass-border rounded-xl p-5 shadow-glass backdrop-blur-md hover:border-glass-border-h hover:-translate-y-0.5 transition-all duration-300 animate-fade-up"
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className={`absolute inset-0 rounded-xl bg-gradient-to-b ${card.gradient} opacity-50 pointer-events-none`} />
          <div className="relative">
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className={`w-2 h-2 rounded-full ${dotColors[card.color] || "bg-violet"}`} />
            </div>
            <div className="mb-1">
              <CountUp target={card.getValue(stats)} color={card.color} />
            </div>
            <div className="text-text-primary text-sm font-medium mb-0.5">{card.label}</div>
            <div className="text-text-muted text-xs">{card.subtitle}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
