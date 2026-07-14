"use client";

import React, { useEffect, useState } from "react";

interface WarningOverlayProps {
  show: boolean;
  reason: string;
  strikesLeft: number;
  onDismiss: () => void;
}

export default function WarningOverlay({
  show,
  reason,
  strikesLeft,
  onDismiss,
}: WarningOverlayProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (show) {
      requestAnimationFrame(() => setVisible(true));
    } else {
      setVisible(false);
    }
  }, [show]);

  if (!show && !visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[60] flex items-center justify-center p-4 transition-all duration-500 ${
        visible
          ? "bg-black/70 backdrop-blur-xl opacity-100"
          : "bg-transparent backdrop-blur-none opacity-0 pointer-events-none"
      }`}
    >
      <div
        className={`relative w-full max-w-md transition-all duration-500 ${
          visible ? "scale-100 translate-y-0 opacity-100" : "scale-90 translate-y-8 opacity-0"
        }`}
      >
        <div className="absolute -inset-1 bg-crimson/20 rounded-2xl blur-2xl animate-pulse" />

        <div className="relative bg-surface border border-crimson/30 rounded-2xl p-8 shadow-[0_0_60px_rgba(239,68,68,0.2)] animate-scale-in">
          <div className="flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-crimson-pale border-2 border-crimson/30 flex items-center justify-center mb-5">
              <svg
                width="32"
                height="32"
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

            <h2 className="text-crimson-light text-xl font-display font-bold mb-2">
              Fokus Terganggu!
            </h2>

            <p className="text-text-secondary text-sm mb-1">
              {reason}
            </p>

            <div className="flex items-center gap-2 mt-4 mb-6">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
                    i < 3 - strikesLeft
                      ? "bg-crimson border-crimson shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                      : "bg-glass border-glass-border"
                  }`}
                />
              ))}
              <span className="text-text-muted text-xs ml-1">
                {strikesLeft} strike{strikesLeft !== 1 ? "s" : ""} left
              </span>
            </div>

            <button
              onClick={onDismiss}
              className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-crimson to-crimson/50 text-white font-semibold text-sm shadow-[0_0_30px_rgba(239,68,68,0.3)] hover:shadow-[0_0_50px_rgba(239,68,68,0.5)] transition-all duration-300 active:scale-[0.97]"
            >
              Kembali Fokus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
