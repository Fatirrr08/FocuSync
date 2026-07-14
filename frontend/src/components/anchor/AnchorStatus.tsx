"use client";

import React from "react";
import type { AnchorStatus as AnchorStatusType } from "@/types";
import GyroVisualizer from "./GyroVisualizer";

interface AnchorStatusProps {
  status: AnchorStatusType;
  onManualAnchor: () => void;
  beta?: number;
  gamma?: number;
  alpha?: number;
  isFaceDown?: boolean;
  orientationSupported?: boolean;
  lightSupported?: boolean;
  lux?: number;
  isStable?: boolean;
}

interface StatusConfig {
  icon: string;
  title: string;
  description: string;
  badge: string;
  badgeVariant: string;
  iconAnimation: string;
  iconBg: string;
}

const statusConfigs: Record<AnchorStatusType, StatusConfig> = {
  PAIRING: {
    icon: "📱",
    title: "Menunggu Pemasangan",
    description: "Letakkan HP di tempat yang sudah ditentukan dan biarkan sensor bekerja",
    badge: "PAIRING",
    badgeVariant: "amber",
    iconAnimation: "animate-pulse",
    iconBg: "bg-amber-pale border-amber/30",
  },
  ANCHORED: {
    icon: "✅",
    title: "HP Terpasang dengan Aman",
    description: "Posisi HP sudah benar. Kamu bisa mulai sesi fokus.",
    badge: "ANCHORED",
    badgeVariant: "emerald",
    iconAnimation: "animate-breathe",
    iconBg: "bg-emerald-pale border-emerald/30",
  },
  LIFTED: {
    icon: "⚠️",
    title: "HP Terangkat!",
    description: "HP terdeteksi terangkat dari posisi semula. Segera kembalikan!",
    badge: "LIFTED",
    badgeVariant: "crimson",
    iconAnimation: "animate-strike-shake",
    iconBg: "bg-crimson-pale border-crimson/30",
  },
  FOCUSING: {
    icon: "🧘",
    title: "Sesi Fokus Berjalan",
    description: "HP terkunci dengan aman. Fokus pada tugasmu!",
    badge: "FOCUSING",
    badgeVariant: "emerald",
    iconAnimation: "animate-breathe",
    iconBg: "bg-emerald-pale border-emerald/30",
  },
  ENDED: {
    icon: "🏁",
    title: "Sesi Selesai",
    description: "Sesi fokus telah berakhir. HP sudah bisa diambil.",
    badge: "ENDED",
    badgeVariant: "violet",
    iconAnimation: "",
    iconBg: "bg-violet-pale border-violet/30",
  },
};

const badgeVariants: Record<string, string> = {
  amber: "bg-amber-pale text-amber border-amber/30",
  emerald: "bg-emerald-pale text-emerald-light border-emerald/30",
  crimson: "bg-crimson-pale text-crimson-light border-crimson/30",
  violet: "bg-violet-pale text-violet-light border-violet/30",
};

const statusCardStyles: Record<AnchorStatusType, string> = {
  PAIRING: "border-amber/40 shadow-[0_0_40px_rgba(245,158,11,0.2)] bg-amber-pale/5",
  ANCHORED: "border-emerald/40 shadow-[0_0_50px_rgba(16,185,129,0.3)] bg-emerald-pale/5",
  LIFTED: "border-crimson/60 shadow-[0_0_60px_rgba(239,68,68,0.45)] bg-crimson-pale/10 animate-strike-shake",
  FOCUSING: "border-violet/40 shadow-[0_0_50px_rgba(124,58,237,0.3)] bg-violet-pale/5",
  ENDED: "border-violet/20 shadow-glass bg-violet-pale/5",
};

export default function AnchorStatus({
  status,
  onManualAnchor,
  beta,
  gamma,
  alpha,
  isFaceDown,
  orientationSupported,
  lightSupported,
  lux,
  isStable,
}: AnchorStatusProps) {
  const config = statusConfigs[status];

  return (
    <div className={`bg-glass border rounded-2xl p-8 backdrop-blur-xl transition-all duration-500 ${statusCardStyles[status]}`}>
      <div className="flex flex-col items-center text-center mb-6">
        {orientationSupported && beta !== undefined && gamma !== undefined ? (
          <div className="mb-6 w-full flex justify-center">
            <GyroVisualizer
              beta={beta}
              gamma={gamma}
              isFaceDown={!!isFaceDown}
              isStable={isStable ?? true}
              status={status}
            />
          </div>
        ) : (
          <div
            className={`w-20 h-20 rounded-full border-2 flex items-center justify-center mb-4 shadow-lg ${config.iconBg} ${config.iconAnimation}`}
          >
            <span className="text-3xl">{config.icon}</span>
          </div>
        )}

        <h2 className="text-text-primary text-2xl font-display font-extrabold mb-2 tracking-tight">{config.title}</h2>
        <p className="text-text-secondary text-sm mb-5 max-w-sm leading-relaxed">{config.description}</p>

        <span
          className={`inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold uppercase tracking-wider border rounded-full ${badgeVariants[config.badgeVariant]}`}
        >
          {config.badge === "LIFTED" && (
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping bg-crimson" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-crimson" />
            </span>
          )}
          {config.badge}
        </span>
      </div>

      {(status === "ANCHORED" || status === "LIFTED") && (
        <button
          onClick={onManualAnchor}
          className="w-full px-5 py-3 rounded-xl bg-glass border border-glass-border text-text-primary text-sm font-medium hover:bg-glass-hover hover:border-glass-border-h transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span>✋</span>
          Konfirmasi Manual (HP Sudah Ditaruh)
        </button>
      )}

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div className={`rounded-lg p-3 border ${orientationSupported ? "bg-emerald-pale border-emerald/20" : "bg-crimson-pale border-crimson/20"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${orientationSupported ? "bg-emerald" : "bg-crimson"}`} />
            <span className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">Orientasi</span>
          </div>
          <p className={`text-xs font-mono ${orientationSupported ? "text-emerald-light" : "text-crimson-light"}`}>
            {orientationSupported ? `${alpha?.toFixed(1) ?? "-"}° ${beta?.toFixed(1) ?? "-"}° ${gamma?.toFixed(1) ?? "-"}°` : "Tidak tersedia"}
          </p>
          {isFaceDown !== undefined && (
            <p className="text-text-muted text-[10px] mt-0.5">{isFaceDown ? "Menghadap ke bawah" : "Menghadap ke atas"}</p>
          )}
        </div>

        <div className={`rounded-lg p-3 border ${lightSupported ? "bg-emerald-pale border-emerald/20" : "bg-crimson-pale border-crimson/20"}`}>
          <div className="flex items-center gap-1.5 mb-1">
            <span className={`w-1.5 h-1.5 rounded-full ${lightSupported ? "bg-emerald" : "bg-crimson"}`} />
            <span className="text-text-muted text-[10px] uppercase tracking-wider font-semibold">Cahaya</span>
          </div>
          <p className={`text-xs font-mono ${lightSupported ? "text-emerald-light" : "text-crimson-light"}`}>
            {lightSupported ? `${lux?.toFixed(0) ?? "-"} lux` : "Tidak tersedia"}
          </p>
        </div>
      </div>
    </div>
  );
}
