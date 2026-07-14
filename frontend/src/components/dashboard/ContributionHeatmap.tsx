"use client";

import React, { useState, useMemo } from "react";
import type { HeatmapData } from "@/types";

interface ContributionHeatmapProps {
  data?: HeatmapData[];
}

const CELL_SIZE = 14;
const CELL_GAP = 3;
const WEEKS = 26;

function generateSyntheticData(): HeatmapData[] {
  const total = WEEKS * 7;
  return Array.from({ length: total }, () => {
    const r = Math.random();
    if (r < 0.35) return { sessions_success: 0, sessions_failed: 0, total_points: 0 };
    if (r < 0.55) return { sessions_success: 1, sessions_failed: Math.random() < 0.2 ? 1 : 0, total_points: Math.floor(Math.random() * 50) + 10 };
    if (r < 0.75) return { sessions_success: 2, sessions_failed: Math.random() < 0.15 ? 1 : 0, total_points: Math.floor(Math.random() * 80) + 40 };
    if (r < 0.9) return { sessions_success: 3, sessions_failed: Math.random() < 0.1 ? 1 : 0, total_points: Math.floor(Math.random() * 120) + 80 };
    return { sessions_success: 4 + Math.floor(Math.random() * 3), sessions_failed: Math.random() < 0.05 ? 1 : 0, total_points: Math.floor(Math.random() * 200) + 120 };
  });
}

function getCellColor(d: HeatmapData): string {
  if (d.sessions_failed > 0) return "#EF4444";
  if (d.sessions_success === 0) return "rgba(255,255,255,0.06)";
  if (d.sessions_success === 1) return "rgba(16,185,129,0.25)";
  if (d.sessions_success === 2) return "rgba(16,185,129,0.45)";
  if (d.sessions_success === 3) return "rgba(16,185,129,0.65)";
  return "rgba(16,185,129,0.85)";
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function getMonthLabel(index: number): string | null {
  const today = new Date();
  const dayOffset = (WEEKS * 7 - 1 - index);
  const d = new Date(today);
  d.setDate(d.getDate() - dayOffset);
  return d.getDate() <= 7 ? d.toLocaleDateString("id-ID", { month: "short" }) : null;
}

export default function ContributionHeatmap({ data }: ContributionHeatmapProps) {
  const [tooltip, setTooltip] = useState<{ x: number; y: number; date: string; data: HeatmapData } | null>(null);
  const heatmapData = useMemo(() => data || generateSyntheticData(), [data]);
  const today = useMemo(() => new Date(), []);

  const cells = useMemo(() => {
    return Array.from({ length: WEEKS * 7 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (WEEKS * 7 - 1 - i));
      return heatmapData[i] || { sessions_success: 0, sessions_failed: 0, total_points: 0 };
    });
  }, [heatmapData, today]);

  const svgWidth = WEEKS * (CELL_SIZE + CELL_GAP) + 40;
  const svgHeight = 7 * (CELL_SIZE + CELL_GAP) + 30;

  return (
    <div className="bg-glass border border-glass-border rounded-xl p-5 shadow-glass backdrop-blur-md">
      <h3 className="text-text-primary font-display font-semibold text-sm mb-4">Kontribusi Fokus</h3>

      <div className="relative">
        <svg width={svgWidth} height={svgHeight} className="overflow-visible">
          <g transform="translate(30, 20)">
            {WEEKDAYS.map((day, i) => (
              <text
                key={day}
                x={-8}
                y={i * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2 + 1}
                textAnchor="end"
                dominantBaseline="middle"
                className="fill-text-muted text-[9px] font-mono"
              >
                {i % 2 === 0 ? day : ""}
              </text>
            ))}

            {Array.from({ length: WEEKS }).map((_, w) => {
              const dayIndex = w * 7;
              if (dayIndex < cells.length) {
                const label = getMonthLabel(dayIndex);
                if (label) {
                  return (
                    <text
                      key={`month-${w}`}
                      x={w * (CELL_SIZE + CELL_GAP) + CELL_SIZE / 2}
                      y={-8}
                      textAnchor="middle"
                      className="fill-text-muted text-[9px] font-mono"
                    >
                      {label}
                    </text>
                  );
                }
              }
              return null;
            })}

            {cells.map((d, i) => {
              const w = Math.floor(i / 7);
              const day = i % 7;
              const x = w * (CELL_SIZE + CELL_GAP);
              const y = day * (CELL_SIZE + CELL_GAP);
              const cellDate = new Date(today);
              cellDate.setDate(cellDate.getDate() - (cells.length - 1 - i));

              return (
                <rect
                  key={i}
                  x={x}
                  y={y}
                  width={CELL_SIZE}
                  height={CELL_SIZE}
                  rx={3}
                  fill={getCellColor(d)}
                  className="cursor-pointer hover:brightness-125 transition-[filter] duration-200"
                  style={{ animation: `cell-appear 0.4s cubic-bezier(0.34,1.56,0.64,1) both`, animationDelay: `${i * 10}ms` }}
                  onMouseEnter={(e) => {
                    const rect = (e.target as SVGRectElement).getBoundingClientRect();
                    setTooltip({
                      x: rect.left + rect.width / 2,
                      y: rect.top - 8,
                      date: cellDate.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "short", year: "numeric" }),
                      data: d,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              );
            })}
          </g>
        </svg>

        {tooltip && (
          <div
            className="fixed z-50 bg-surface border border-glass-border rounded-lg px-3 py-2 shadow-glass pointer-events-none text-xs"
            style={{ left: tooltip.x, top: tooltip.y, transform: "translate(-50%, -100%)" }}
          >
            <p className="text-text-primary font-medium mb-1">{tooltip.date}</p>
            <p className="text-emerald-light">{tooltip.data.sessions_success} sesi sukses</p>
            {tooltip.data.sessions_failed > 0 && <p className="text-crimson-light">{tooltip.data.sessions_failed} gagal</p>}
            <p className="text-text-muted">{tooltip.data.total_points} poin</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-4 text-xs text-text-muted">
        <span>Kurang</span>
        {[
          "rgba(255,255,255,0.06)",
          "rgba(16,185,129,0.25)",
          "rgba(16,185,129,0.45)",
          "rgba(16,185,129,0.65)",
          "rgba(16,185,129,0.85)",
        ].map((color, i) => (
          <div key={i} className="w-3 h-3 rounded-sm" style={{ backgroundColor: color }} />
        ))}
        <span>Banyak</span>
        <span className="ml-2">🔴 Gagal</span>
      </div>
    </div>
  );
}
