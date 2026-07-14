"use client";

import React, { useEffect, useState } from "react";

interface StrikeEngineProps {
  strikeCount: number;
  onDismiss: () => void;
  reason: string;
  showWarning: boolean;
  onStrike?: (reason: string) => void;
}

export default function StrikeEngine({
  strikeCount,
  onDismiss,
  reason,
  showWarning,
  onStrike,
}: StrikeEngineProps) {
  const [shake, setShake] = useState(false);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (strikeCount > 0) {
      setShake(true);
      setFlash(true);
      onStrike?.('Phone lifted or fullscreen exited');
      const shakeTimer = setTimeout(() => setShake(false), 600);
      const flashTimer = setTimeout(() => setFlash(false), 1000);
      return () => {
        clearTimeout(shakeTimer);
        clearTimeout(flashTimer);
      };
    }
  }, [strikeCount, onStrike]);

  return (
    <div className="flex flex-col items-center gap-4">
      <div className={`flex items-center gap-3 ${shake ? "animate-strike-shake" : ""}`}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded-full border-2 transition-all duration-300 ${
              i < strikeCount
                ? "bg-crimson border-crimson shadow-[0_0_12px_rgba(239,68,68,0.6)]"
                : "bg-glass border-glass-border"
            }`}
          />
        ))}
        <span className="text-text-secondary text-sm font-medium ml-2">
          {strikeCount}/3 Strikes
        </span>
      </div>

      {showWarning && (
        <div
          className={`w-full bg-surface border border-crimson/30 rounded-xl p-5 backdrop-blur-md transition-all duration-300 ${
            flash
              ? "shadow-[0_0_30px_rgba(239,68,68,0.3),inset_0_0_30px_rgba(239,68,68,0.08)]"
              : ""
          } ${shake ? "animate-strike-shake" : ""} animate-scale-in`}
        >
          <div className="flex items-start gap-3">
            <div className="shrink-0 mt-0.5">
              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#EF4444"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div className="flex-1">
              <h4 className="text-crimson-light font-semibold text-base mb-1">
                Violation Detected
              </h4>
              <p className="text-text-secondary text-sm mb-1">{reason}</p>
              <p className="text-text-muted text-xs">
                {3 - strikeCount} strike{3 - strikeCount !== 1 ? "s" : ""} remaining before session fails
              </p>
            </div>
          </div>
          <button
            onClick={onDismiss}
            className="mt-4 w-full px-4 py-2.5 rounded-xl bg-crimson-pale border border-crimson/30 text-crimson-light font-medium text-sm hover:bg-crimson/20 transition-all duration-200 active:scale-[0.97]"
          >
            Kembali Fokus
          </button>
        </div>
      )}
    </div>
  );
}
