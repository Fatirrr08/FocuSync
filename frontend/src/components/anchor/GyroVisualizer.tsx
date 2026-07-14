"use client";

import React, { useMemo } from "react";
import type { AnchorStatus } from "@/types";

interface GyroVisualizerProps {
  beta: number;
  gamma: number;
  isFaceDown: boolean;
  isStable: boolean;
  status: AnchorStatus;
}

export default function GyroVisualizer({
  beta,
  gamma,
  isFaceDown,
  isStable,
  status,
}: GyroVisualizerProps) {
  // Determine if it is fully locked
  const isLocked = isFaceDown && isStable && status === "ANCHORED";
  const isWarning = status === "LIFTED" || !isFaceDown;

  // Calculate translation coordinates with boundaries
  const { x, y } = useMemo(() => {
    // Normalise beta based on face down state (which is around 0 or 180)
    const normalizedBeta = Math.abs(beta) > 90 ? (beta > 0 ? beta - 180 : beta + 180) : beta;
    
    // Scale factor to map degrees to pixels on our 160px container
    const scale = 2.2;
    const computedX = Math.max(-70, Math.min(70, gamma * scale));
    const computedY = Math.max(-70, Math.min(70, normalizedBeta * scale));
    
    return { x: computedX, y: computedY };
  }, [beta, gamma]);

  return (
    <div
      data-testid="gyro-radar"
      className={`relative w-full max-w-[280px] mx-auto aspect-square rounded-2xl bg-deeper border flex flex-col items-center justify-center p-4 overflow-hidden transition-all duration-500 shadow-glass ${
        isWarning
          ? "border-crimson/30 shadow-[0_0_30px_rgba(239,68,68,0.2)] animate-strike-shake"
          : isLocked
          ? "border-emerald/30 shadow-[0_0_30px_rgba(16,185,129,0.25)]"
          : "border-glass-border"
      }`}
    >
      {/* Cybernetic grid overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none opacity-40" />

      {/* Futuristic scanning line */}
      <div
        className={`absolute inset-x-0 h-[1.5px] pointer-events-none opacity-30 ${
          isWarning ? "bg-crimson animate-scan" : "bg-violet animate-scan"
        }`}
        style={{ animationDuration: "3s" }}
      />

      {/* Target concentric dials */}
      <div className="relative w-40 h-40 rounded-full border border-glass-border flex items-center justify-center">
        {/* Outer rotating ring */}
        <div
          className={`absolute inset-0 rounded-full border border-dashed animate-spin ${
            isWarning ? "border-crimson/20" : "border-violet/20"
          }`}
          style={{ animationDuration: "12s" }}
        />

        {/* Medium target ring */}
        <div className="absolute w-28 h-28 rounded-full border border-glass-border/40" />

        {/* Dynamic laser coordinate crosshairs */}
        <div className={`absolute w-full h-[0.5px] ${isWarning ? "bg-crimson/20" : "bg-glass-border/50"}`} />
        <div className={`absolute h-full w-[0.5px] ${isWarning ? "bg-crimson/20" : "bg-glass-border/50"}`} />

        {/* Central target core */}
        <div
          className={`w-10 h-10 rounded-full border-2 flex items-center justify-center relative z-10 transition-all duration-500 ${
            isWarning
              ? "border-crimson bg-crimson-pale/30"
              : isLocked
              ? "border-emerald bg-emerald-pale/30 scale-105 shadow-[0_0_15px_rgba(16,185,129,0.5)]"
              : "border-violet/40 bg-violet-pale/10"
          }`}
        >
          {/* Target Center Point */}
          <div
            className={`w-2.5 h-2.5 rounded-full transition-colors duration-500 ${
              isWarning ? "bg-crimson" : isLocked ? "bg-emerald" : "bg-violet-light"
            }`}
          />

          {/* Sonar Concentric Ripple Rings (emerald locked state) */}
          {isLocked && (
            <div data-testid="stable-glow" className="absolute inset-0 pointer-events-none">
              <span className="absolute inset-0 rounded-full border border-emerald animate-ping opacity-60" />
              <span
                className="absolute -inset-4 rounded-full border border-emerald/50 animate-ping opacity-35"
                style={{ animationDelay: "0.5s" }}
              />
            </div>
          )}
        </div>

        {/* Motion tracker orb */}
        <div
          data-testid="gyro-tracker"
          className="absolute z-20 transition-all duration-100 ease-out"
          style={{
            transform: `translate(${x}px, ${y}px)`,
          }}
        >
          {/* Main glowing dot */}
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center relative shadow-lg ${
              isWarning
                ? "bg-crimson-light shadow-[0_0_15px_rgba(239,68,68,0.8)]"
                : isLocked
                ? "bg-emerald-light shadow-[0_0_15px_rgba(16,185,129,0.8)]"
                : "bg-violet-light shadow-[0_0_15px_rgba(124,58,237,0.8)]"
            }`}
          >
            {/* Inner ring */}
            <div className="w-2.5 h-2.5 rounded-full bg-deeper opacity-70" />
            
            {/* Glowing trail effect */}
            <span
              className={`absolute -inset-2 rounded-full animate-ping opacity-25 ${
                isWarning ? "bg-crimson" : isLocked ? "bg-emerald" : "bg-violet"
              }`}
              style={{ animationDuration: "1.2s" }}
            />
          </div>
        </div>
      </div>

      {/* Cybernetic Telemetry/Telemetry Overlay */}
      <div className="w-full mt-4 border-t border-glass-border/30 pt-3 text-center z-10">
        <div className="flex items-center justify-between text-[9px] font-mono text-text-muted mb-1 px-1">
          <span>X: {gamma.toFixed(1)}°</span>
          <span>Y: {beta.toFixed(1)}°</span>
        </div>

        <div className="flex justify-center items-center gap-1.5 py-1 px-2 rounded bg-glass border border-glass-border">
          {isWarning ? (
            <div data-testid="warning-alert" className="flex items-center gap-1">
              <span className="text-[10px] animate-pulse">⚠️</span>
              <span className="text-[10px] font-display font-semibold text-crimson-light uppercase tracking-wider">
                STATUS: PERINGATAN
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className={`text-[10px] ${isLocked ? "text-emerald-light" : "text-violet-light"}`}>
                {isLocked ? "🛡️" : "📡"}
              </span>
              <span
                className={`text-[10px] font-display font-semibold uppercase tracking-wider ${
                  isLocked ? "text-emerald-light" : "text-text-secondary"
                }`}
              >
                {isLocked ? "STATUS: TERKUNCI" : "STATUS: MENYESUAIKAN"}
              </span>
            </div>
          )}
        </div>

        <div className="text-[9px] font-mono text-text-muted mt-2 uppercase tracking-widest">
          KESTABILAN SENSOR: {isStable ? "100%" : "MENGKALIBRASI..."}
        </div>
      </div>
    </div>
  );
}
