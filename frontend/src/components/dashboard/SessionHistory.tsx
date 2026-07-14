"use client";

import React from "react";
import Link from "next/link";
import type { SessionHistoryItem } from "@/types";

interface SessionHistoryProps {
  sessions?: SessionHistoryItem[];
}

function generateDummySessions(): SessionHistoryItem[] {
  const now = new Date();
  const statuses: Array<"success" | "failed"> = ["success", "success", "success", "failed", "success", "success", "failed", "success", "success", "success"];
  const names = [
    "Belajar Matematika Diskrit",
    "Mengerjakan Tugas Alpro",
    "Baca Jurnal AI",
    "Scrolling Twitter",
    "Ngerjain Skripsi Bab 3",
    "Bootcamp React JS",
    "Youtube (Gak sengaja)",
    "Latihan Soal TOEFL",
    "Belajar Database",
    "Review Code PR",
  ];
  return Array.from({ length: 10 }, (_, i) => {
    const d = new Date(now);
    d.setHours(d.getHours() - i * 3 - Math.floor(Math.random() * 2));
    return {
      id: String(i + 1),
      name: names[i],
      duration: Math.floor(Math.random() * 90) + 15,
      chunks: Math.floor(Math.random() * 4) + 1,
      points: Math.floor(Math.random() * 150) + 20,
      status: statuses[i],
      strikes: statuses[i] === "failed" ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 2),
      time: d.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
    };
  });
}

export default function SessionHistory({ sessions }: SessionHistoryProps) {
  const items = sessions || generateDummySessions();

  return (
    <div className="bg-glass border border-glass-border rounded-xl p-5 shadow-glass backdrop-blur-md">
      <h3 className="text-text-primary font-display font-semibold text-sm mb-4">Riwayat Sesi</h3>

      <div className="space-y-2">
        {items.map((session) => (
          <Link
            key={session.id}
            href="/distraction-review"
            className="flex items-center gap-3 bg-glass border border-glass-border rounded-lg px-4 py-3 hover:bg-glass-hover hover:border-glass-border-h transition-all duration-200 animate-fade-up cursor-pointer"
          >
            <span className="text-lg shrink-0">{session.status === "success" ? "✅" : "❌"}</span>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-text-primary text-sm font-medium truncate">{session.name}</span>
                {session.status === "failed" && (
                  <span className="text-crimson-light text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-crimson-pale border border-crimson/30">
                    Gagal
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-text-muted text-xs mt-0.5">
                <span>{session.duration}m</span>
                <span>{session.chunks} chunk{session.chunks > 1 ? "s" : ""}</span>
                {session.strikes > 0 && <span className="text-amber">{session.strikes} strike{session.strikes > 1 ? "s" : ""}</span>}
              </div>
            </div>

            <div className="text-right shrink-0">
              <div className="text-violet-light text-sm font-bold font-display">+{session.points}</div>
              <div className="text-text-muted text-[10px]">{session.time}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
