"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import AnchorStatus from "@/components/anchor/AnchorStatus";
import { supabase } from "@/lib/supabase/client";
import { RealtimeChannel } from "@supabase/supabase-js";
import type { AnchorStatus as AnchorStatusType } from "@/types";

export default function AnchorPage() {
  const params = useParams();
  const sessionToken = params.sessionToken as string;

  const [status, setStatus] = useState<AnchorStatusType>("PAIRING");
  const [strikeCount, setStrikeCount] = useState(0);
  const [beta, setBeta] = useState(0);
  const [gamma, setGamma] = useState(0);
  const [alpha, setAlpha] = useState(0);
  const [isFaceDown, setIsFaceDown] = useState(false);
  const [orientationSupported, setOrientationSupported] = useState(false);
  const [lux, setLux] = useState(0);
  const [lightSupported, setLightSupported] = useState(false);
  const [permissionBanner, setPermissionBanner] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [isStable, setIsStable] = useState(true);
  const lastBetaRef = useRef<number | null>(null);

  const channelRef = useRef<RealtimeChannel | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Request sensor permissions on mount
  useEffect(() => {
    if (!mounted) return;

    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      const DeviceOrientationEventConstructor = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
      const requestPermission = DeviceOrientationEventConstructor.requestPermission;
      if (requestPermission) {
        requestPermission()
          .then((state: string) => {
            if (state === "granted") setPermissionBanner(false);
          })
          .catch(() => {});
      } else {
        setPermissionBanner(false);
      }
    } else {
      setPermissionBanner(false);
    }
  }, [mounted]);

  // Subscribe to Supabase Realtime channel
  useEffect(() => {
    if (!mounted || !sessionToken) return;

    const channel = supabase.channel(`session-${sessionToken}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "SESSION_FOCUSING" }, () => {
        setStatus("FOCUSING");
        setStrikeCount(0);
      })
      .on("broadcast", { event: "STRIKE_UPDATE" }, (payload: { payload?: { strikeCount?: number } }) => {
        const strikes = payload.payload?.strikeCount ?? 0;
        setStrikeCount(strikes);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          navigator.vibrate([200, 100, 200]);
        }
      })
      .on("broadcast", { event: "SESSION_ENDED" }, () => {
        setStatus("ENDED");
      })
      .subscribe(async (statusState) => {
        if (statusState === "SUBSCRIBED") {
          // Broadcast joining event to desktop Chamber
          await channel.send({
            type: "broadcast",
            event: "MOBILE_JOINED",
            payload: {},
          });
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [mounted, sessionToken]);

  // Read device orientation sensors
  useEffect(() => {
    if (!mounted || permissionBanner) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      const b = e.beta ?? 0;
      const g = e.gamma ?? 0;
      const a = e.alpha ?? 0;
      setBeta(b);
      setGamma(g);
      setAlpha(a);

      if (lastBetaRef.current !== null) {
        const delta = Math.abs(b - lastBetaRef.current);
        setIsStable(delta < 3);
      }
      lastBetaRef.current = b;

      const faceDown = b !== null && b > 160 && b < 200 && Math.abs(g) < 20;
      setIsFaceDown(faceDown);
      setOrientationSupported(true);

      if (faceDown) {
        if (status !== "ANCHORED") {
          setStatus("ANCHORED");
          channelRef.current?.send({
            type: "broadcast",
            event: "ANCHORED",
            payload: {},
          });
        }
      } else if (status === "ANCHORED") {
        setStatus("LIFTED");
        channelRef.current?.send({
          type: "broadcast",
          event: "PHONE_LIFTED",
          payload: {},
        });
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [mounted, permissionBanner, status]);

  // Read ambient light sensors
  useEffect(() => {
    if (!mounted || permissionBanner) return;

    const Ac = (window as unknown as Record<string, unknown>).AmbientLightSensor;
    if (typeof Ac === "function") {
      try {
        const sensor = new (Ac as new () => { illuminance: number; onreading: () => void; onerror: () => void; start: () => void; stop: () => void })();
        sensor.onreading = () => {
          setLux(sensor.illuminance);
          setLightSupported(true);
        };
        sensor.onerror = () => setLightSupported(false);
        sensor.start();
        return () => { sensor.stop(); };
      } catch {
        setLightSupported(false);
      }
    } else {
      setLightSupported(false);
    }
  }, [mounted, permissionBanner]);

  const handleManualAnchor = useCallback(() => {
    if (status === "ANCHORED") {
      setStatus("FOCUSING");
      channelRef.current?.send({
        type: "broadcast",
        event: "MOBILE_JOINED",
        payload: {},
      });
    } else {
      setStatus("ANCHORED");
      channelRef.current?.send({
        type: "broadcast",
        event: "ANCHORED",
        payload: {},
      });
    }
  }, [status]);

  if (!mounted) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm mx-auto space-y-6">
        <div className="text-center">
          <div className="inline-flex items-center gap-3 mb-4">
            <img src="/FocuSync.svg" alt="FocuSync" className="h-8 w-auto" />
            <span className="font-display font-bold text-lg text-text-primary">FocuSync</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-pale border border-violet/30 text-violet-light text-[10px] font-semibold uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-violet animate-pulse" />
            Device Anchor
          </div>
        </div>

        {permissionBanner && (
          <div className="bg-amber-pale border border-amber/30 rounded-xl p-4 text-center">
            <p className="text-amber text-sm font-medium mb-2">Izin Sensor Diperlukan</p>
            <p className="text-text-secondary text-xs mb-3">FocuSync memerlukan akses sensor orientasi untuk mengunci posisi HP.</p>
            <button
              onClick={() => {
                const DOConstructor = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> };
                if (typeof DeviceOrientationEvent !== "undefined" && DOConstructor.requestPermission) {
                  DOConstructor.requestPermission()
                    .then((state: string) => {
                      if (state === "granted") setPermissionBanner(false);
                    });
                } else {
                  setPermissionBanner(false);
                }
              }}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber to-orange-700 text-white text-sm font-semibold shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all duration-300 active:scale-[0.97]"
            >
              Berikan Izin
            </button>
          </div>
        )}

        <AnchorStatus
          status={status}
          onManualAnchor={handleManualAnchor}
          beta={beta}
          gamma={gamma}
          alpha={alpha}
          isFaceDown={isFaceDown}
          orientationSupported={orientationSupported}
          lightSupported={lightSupported}
          lux={lux}
          isStable={isStable}
        />

        {strikeCount > 0 && (status === "FOCUSING" || status === "LIFTED") && (
          <div className="bg-crimson-pale border border-crimson/30 rounded-xl p-4 text-center animate-strike-shake">
            <p className="text-crimson-light text-sm font-semibold">⚠️ Terdeteksi Pelanggaran Fokus!</p>
            <p className="text-text-secondary text-xs mt-1">Sisa kesempatan: {3 - strikeCount} strike lagi</p>
          </div>
        )}

        <div className="bg-glass border border-glass-border rounded-xl p-4 shadow-glass backdrop-blur-md">
          <h3 className="text-text-muted text-[10px] uppercase tracking-wider font-semibold mb-2">Session Token</h3>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-text-secondary text-xs font-mono bg-surface rounded-lg px-3 py-2 border border-glass-border truncate">
              {sessionToken}
            </code>
            <button
              onClick={() => navigator.clipboard.writeText(sessionToken)}
              className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-glass-hover transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
              </svg>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-text-muted text-xs">
          <span className={`w-2 h-2 rounded-full ${orientationSupported ? "bg-emerald" : "bg-crimson"}`} />
          <span>Orientation {orientationSupported ? "Supported" : "Unsupported"}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-glass-border" />
          <span className={`w-2 h-2 rounded-full ${lightSupported ? "bg-emerald" : "bg-crimson"}`} />
          <span>Ambient Light {lightSupported ? "Supported" : "Unsupported"}</span>
        </div>

        <div className="text-center">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-text-secondary text-sm hover:text-text-primary transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5l-5 5l5 5" />
            </svg>
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
