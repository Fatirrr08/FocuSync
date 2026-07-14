"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { QRCodeSVG } from "qrcode.react";
import { useSessionStore } from "@/lib/state/sessionStore";
import { supabase } from "@/lib/supabase/client";
import { createSession, updateSessionStatus, startSession, updateSession } from "@/lib/supabase/sessions";
import { fetchAllowlist, logAllowlistViolation } from "@/lib/supabase/allowlist";
import { syncDistractionNotes } from "@/lib/supabase/distractions";
import { updateHeatmapLog } from "@/lib/supabase/heatmap";
import { useToast } from "@/components/ui/Toast";
import { RealtimeChannel } from "@supabase/supabase-js";
import { AllowlistItem } from "@/types";
import PDFViewer from "@/components/chamber/PDFViewer";
import ZenEditor from "@/components/chamber/ZenEditor";
import TaskChunker from "@/components/chamber/TaskChunker";
import StrikeEngine from "@/components/chamber/StrikeEngine";
import WarningOverlay from "@/components/chamber/WarningOverlay";
import DistractionInbox from "@/components/chamber/DistractionInbox";
import SoundscapePlayer from "@/components/chamber/SoundscapePlayer";

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

export default function ChamberPage() {
  const params = useParams();
  const router = useRouter();
  const { addToast } = useToast();
  const sessionId = params.sessionId as string;

  const status = useSessionStore((s) => s.status);
  const strikeCount = useSessionStore((s) => s.strikeCount);
  const zenMode = useSessionStore((s) => s.zenMode);
  const setStatus = useSessionStore((s) => s.setStatus);
  const toggleZenMode = useSessionStore((s) => s.toggleZenMode);
  const reset = useSessionStore((s) => s.reset);
  const addStrike = useSessionStore((s) => s.addStrike);

  const [fullscreen, setFullscreen] = useState(false);
  const [showEndOverlay, setShowEndOverlay] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const [now, setNow] = useState(Date.now());
  const [showWarning, setShowWarning] = useState(false);
  const [warningReason, setWarningReason] = useState("");
  const [activeTheme, setActiveTheme] = useState<'violet' | 'emerald' | 'amber'>('violet');

  // Self-report distraction state
  const [showSelfReport, setShowSelfReport] = useState(false);
  const [allowedItems, setAllowedItems] = useState<AllowlistItem[]>([]);
  const [selectedReport, setSelectedReport] = useState("");
  const [customReport, setCustomReport] = useState("");
  const distractionHappened = useRef(false);

  const channelRef = useRef<RealtimeChannel | null>(null);

  const triggerStrike = useCallback((reason: string) => {
    setWarningReason(reason);
    setShowWarning(true);
    addStrike();

    // Get the updated strike count from state
    const currentStrikes = useSessionStore.getState().strikeCount + 1;
    updateSession(sessionId, { strike_count: currentStrikes });

    // Send strike count broadcast update to Device Anchor
    channelRef.current?.send({
      type: "broadcast",
      event: "STRIKE_UPDATE",
      payload: { strikeCount: currentStrikes },
    });

    setTimeout(() => setShowWarning(false), 5000);
  }, [addStrike, sessionId]);

  // Tab switching and window blur listeners to enforce focus
  useEffect(() => {
    if (status !== "FOCUSING") return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        distractionHappened.current = true;
      } else if (document.visibilityState === "visible" && distractionHappened.current) {
        setShowSelfReport(true);
      }
    };

    const handleBlur = () => {
      // Delay check slightly to prevent false triggers during full-screen setup transitions
      setTimeout(() => {
        if (!document.hasFocus()) {
          distractionHappened.current = true;
        }
      }, 400);
    };

    const handleFocus = () => {
      setTimeout(() => {
        if (document.hasFocus() && distractionHappened.current) {
          setShowSelfReport(true);
        }
      }, 400);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [status]);

  // Handle self-report confirmation
  const handleConfirmReport = async () => {
    let reportName = selectedReport;
    let isViolation = false;
    let type: "website" | "app" = "website";

    if (selectedReport === "custom") {
      reportName = customReport.trim() || "Aplikasi/Website Lainnya";
      isViolation = true;
    } else if (selectedReport === "violation") {
      reportName = "Situs/Aplikasi Non-Esensial";
      isViolation = true;
    } else {
      // Check if item is allowed
      const selectedItem = allowedItems.find(i => i.name === selectedReport);
      if (selectedItem) {
        type = selectedItem.type;
        isViolation = !selectedItem.allowed;
      }
    }

    if (isViolation) {
      triggerStrike(`Membuka: ${reportName}`);
      await logAllowlistViolation(sessionId, reportName, type, true);
    }

    distractionHappened.current = false;
    setShowSelfReport(false);
    setSelectedReport("");
    setCustomReport("");
  };

  // Handle new session creation or load existing
  useEffect(() => {
    let active = true;

    const setupSession = async () => {
      if (sessionId === "new") {
        // Create new session in Supabase
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          addToast("error", "Silakan login terlebih dahulu.");
          router.replace("/login");
          return;
        }

        const newSession = await createSession(user.id);
        if (newSession && active) {
          useSessionStore.setState({
            sessionId: newSession.id,
            sessionToken: newSession.session_token,
            status: "PAIRING",
            strikeCount: 0,
            elapsed: 0,
          });
          router.replace(`/session/${newSession.id}`);
        } else {
          addToast("error", "Gagal membuat sesi baru.");
          router.back();
        }
      } else if (sessionId.startsWith("fs-sess-")) {
        // Simulated mock session setup. Keep status as PAIRING
        setMounted(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user && active) {
          const items = await fetchAllowlist(user.id);
          setAllowedItems(items.filter(i => i.allowed));
        }
        
        // Explicitly maintain mock state
        useSessionStore.setState({
          sessionId: sessionId,
          sessionToken: "token-" + sessionId,
          status: useSessionStore.getState().status === "IDLE" ? "PAIRING" : useSessionStore.getState().status,
        });
      } else {
        // Load existing session details
        setMounted(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (user && active) {
          const items = await fetchAllowlist(user.id);
          setAllowedItems(items.filter(i => i.allowed));
        }

        const { data: sessionData } = await supabase
          .from("sessions")
          .select("*")
          .eq("id", sessionId)
          .single();

        if (sessionData && active) {
          useSessionStore.setState({
            sessionId: sessionData.id,
            sessionToken: sessionData.session_token,
            status: sessionData.status,
            strikeCount: sessionData.strike_count || 0,
          });
        }
      }
    };

    setupSession();

    return () => {
      active = false;
      if (sessionId !== "new" && !sessionId.startsWith("fs-sess-")) {
        reset();
      }
    };
  }, [sessionId, setStatus, reset, router, addToast]);

  // Guard target route: Redirect back to dashboard if no active session is present
  useEffect(() => {
    if (mounted) {
      const activeSession = status !== "IDLE" && status !== "FAILED" && status !== "SUCCESS";
      if (!activeSession) {
        addToast("error", "Silakan mulai sesi baru terlebih dahulu untuk mengakses Study Chamber.");
        router.replace("/dashboard");
      }
    }
  }, [mounted, status, router, addToast]);

  // Set up Supabase Realtime Channel for pairing events
  useEffect(() => {
    if (!mounted || sessionId === "new") return;
    const sessionToken = useSessionStore.getState().sessionToken;
    if (!sessionToken) return;

    const channel = supabase.channel(`session-${sessionToken}`);
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "MOBILE_JOINED" }, () => {
        setStatus("READY");
        updateSessionStatus(sessionId, "READY");
        addToast("success", "Ponsel berhasil terhubung!");
      })
      .on("broadcast", { event: "ANCHORED" }, () => {
        // HP is correctly placed
      })
      .on("broadcast", { event: "PHONE_LIFTED" }, () => {
        if (useSessionStore.getState().status === "FOCUSING") {
          triggerStrike("Ponsel terangkat dari posisi semula!");
        }
      })
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          console.warn("Koneksi Supabase Realtime terputus. Memasuki grace period...");
          // Grace period: Pertahankan state lokal sementara tanpa mengganggu berjalannya sesi.
        }
      });

    return () => {
      channel.unsubscribe();
    };
  }, [mounted, sessionId, setStatus, triggerStrike, addToast]);

  // Focus timer
  useEffect(() => {
    if (status === "FOCUSING") {
      const initialStart = Date.now();
      setStartTime(initialStart);
      setNow(initialStart);
      
      const interval = setInterval(() => {
        const currentNow = Date.now();
        setNow(currentNow);
        
        // Sync duration to the Zustand store in real-time
        const elapsedSec = Math.floor((currentNow - initialStart) / 1000);
        useSessionStore.setState({ elapsed: elapsedSec });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [status]);

  // Visibility/blur strikes
  useEffect(() => {
    const onFsChange = () => {
      if (!document.fullscreenElement && status === "FOCUSING") {
        triggerStrike("Keluar dari mode layar penuh");
      }
    };
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, [status, triggerStrike]);

  useEffect(() => {
    if (strikeCount >= 3) {
      setStatus("FAILED");
      updateSessionStatus(sessionId, "FAILED");
      syncDistractionNotes(sessionId);
      
      // Update heatmap log
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          const totalPoints = useSessionStore.getState().chunks.filter(c => c.done).reduce((acc, c) => acc + c.points, 0);
          updateHeatmapLog(user.id, 0, 1, totalPoints);
        }
      });

      setShowEndOverlay(true);
      // Broadcast end to mobile
      channelRef.current?.send({
        type: "broadcast",
        event: "SESSION_ENDED",
        payload: { success: false }
      });
    }
  }, [strikeCount, setStatus, sessionId]);

  const handleEndSession = useCallback(async () => {
    const finalStatus = strikeCount >= 3 ? "FAILED" : "SUCCESS";
    setStatus(finalStatus);
    await updateSessionStatus(sessionId, finalStatus);
    await syncDistractionNotes(sessionId);
    
    // Update daily heatmap log
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const storeChunks = useSessionStore.getState().chunks;
      const totalPoints = storeChunks.filter(c => c.done).reduce((acc, c) => acc + c.points, 0);
      await updateHeatmapLog(
        user.id, 
        finalStatus === "SUCCESS" ? 1 : 0, 
        finalStatus === "FAILED" ? 1 : 0, 
        totalPoints
      );
    }

    setShowEndOverlay(true);

    channelRef.current?.send({
      type: "broadcast",
      event: "SESSION_ENDED",
      payload: { success: strikeCount < 3 }
    });
  }, [strikeCount, setStatus, sessionId]);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setFullscreen(false);
    }
  }, []);

  const dismissWarning = useCallback(() => {
    setShowWarning(false);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-deeper flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border border-violet bg-violet-pale/10 animate-ping" />
      </div>
    );
  }

  const elapsedSeconds = Math.floor((now - startTime) / 1000);
  const elapsedFormatted = formatTime(elapsedSeconds);

  // Render Pairing / Ready state
  if (status === "PAIRING" || status === "READY") {
    const pairingUrl = typeof window !== "undefined"
      ? `${window.location.origin}/anchor/${useSessionStore.getState().sessionToken}`
      : "";

    return (
      <div className="min-h-screen bg-deeper flex flex-col items-center justify-center p-6 relative overflow-hidden">
        <div className="scene-bg">
          <div className="orb w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(124,58,237,0.12)_0%,transparent_70%)] animate-breathe" />
          <div className="grid-overlay" />
        </div>

        <div className="w-full max-w-md bg-glass border border-glass-border rounded-2xl p-8 shadow-glass backdrop-blur-md flex flex-col items-center text-center animate-scale-in">
          <img src="/FocuSync.svg" alt="FocuSync" className="h-10 w-auto mb-6" />
          
          <h2 className="text-xl font-display font-bold text-text-primary mb-2">
            {status === "PAIRING" ? "Hubungkan Ponsel Anda" : "Ponsel Terhubung!"}
          </h2>
          
          <p className="text-text-secondary text-xs mb-6 max-w-xs leading-relaxed">
            {status === "PAIRING" 
              ? "Pindai kode QR di bawah dengan browser ponsel Anda untuk memasangkan perangkat." 
              : "Status sinkronisasi aktif. Posisikan ponsel Anda menghadap ke bawah lalu mulai sesi."}
          </p>

          {status === "PAIRING" ? (
            <div className="bg-white p-4 rounded-xl border border-glass-border shadow-md mb-6 relative group overflow-hidden">
              {pairingUrl && <QRCodeSVG value={pairingUrl} size={180} />}
            </div>
          ) : (
            <div className="w-40 h-40 rounded-full border border-emerald/30 bg-emerald-pale/10 flex items-center justify-center mb-6 relative animate-pulse-dot">
              <span className="text-5xl">📱</span>
              <span className="absolute inset-0 border border-emerald animate-ping rounded-full" />
            </div>
          )}

          <div className="w-full space-y-3">
            <button
              onClick={async () => {
                if (status === "READY") {
                  const success = await startSession(sessionId);
                  if (success) {
                    setStatus("FOCUSING");
                    channelRef.current?.send({
                      type: "broadcast",
                      event: "SESSION_FOCUSING",
                      payload: {}
                    });
                    toggleFullscreen();
                  }
                }
              }}
              disabled={status === "PAIRING"}
              className={`w-full px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-300 ${
                status === "READY"
                  ? "bg-gradient-to-r from-violet to-purple-700 text-white shadow-glow-v hover:shadow-[0_0_60px_rgba(124,58,237,0.5)] active:scale-[0.98]"
                  : "bg-glass border border-glass-border text-text-muted cursor-not-allowed"
              }`}
            >
              {status === "PAIRING" ? "Menunggu Ponsel Terhubung..." : "Mulai Sesi Fokus"}
            </button>
            
            <button
              onClick={() => router.back()}
              className="w-full px-5 py-3 rounded-xl bg-glass border border-glass-border text-text-secondary text-sm font-medium hover:bg-glass-hover hover:border-glass-border-h transition-all"
            >
              Batalkan Sesi
            </button>
          </div>
        </div>
      </div>
    );
  }

  const storeChunks = useSessionStore.getState().chunks;
  const doneChunksCount = storeChunks.filter(c => c.done).length;
  const totalChunksCount = storeChunks.length;
  const focusScore = Math.max(0, Math.min(100, Math.round(
    totalChunksCount === 0 
      ? (strikeCount >= 3 ? 0 : 100 - strikeCount * 15)
      : (doneChunksCount / totalChunksCount) * 100 - strikeCount * 15
  )));

  // Render active Focusing chamber layout
  return (
    <div className={`min-h-screen bg-deeper theme-${activeTheme} ${zenMode ? "zen-mode" : ""}`}>
      <header className="panel-header h-16 border-b border-glass-border bg-deeper/80 backdrop-blur-xl flex items-center justify-between px-4 sm:px-6 relative z-30">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-all">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5l-5 5l5 5" />
            </svg>
          </button>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-pale border border-emerald/20">
            <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
            <span className="text-emerald-light text-xs font-semibold uppercase tracking-wider">FOCUSING</span>
          </div>
          <span className="text-text-primary font-mono text-lg font-bold tabular-nums">{elapsedFormatted}</span>
        </div>

        <div className="flex items-center space-x-4">
          <StrikeEngine
            strikeCount={strikeCount}
            onDismiss={dismissWarning}
            reason={warningReason}
            showWarning={showWarning}
            onStrike={triggerStrike}
          />
          
          {/* Theme Toggler */}
          <div className="flex items-center gap-1.5 bg-glass border border-glass-border rounded-lg p-1">
            {(["violet", "emerald", "amber"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTheme(t)}
                className={`w-4 h-4 rounded-full transition-all duration-200 ${
                  t === "violet" ? "bg-violet" : t === "emerald" ? "bg-emerald" : "bg-amber"
                } ${activeTheme === t ? "ring-2 ring-white scale-110 shadow-lg" : "opacity-60 hover:opacity-100"}`}
                title={`Tema ${t}`}
              />
            ))}
          </div>

          <SoundscapePlayer />

          <button
            onClick={toggleZenMode}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
              zenMode ? "bg-violet-pale border border-violet/30 text-violet-light" : "bg-glass border border-glass-border text-text-secondary hover:bg-glass-hover"
            }`}
          >
            {zenMode ? "Exit Zen" : "Zen"}
          </button>
          <button
            onClick={toggleFullscreen}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-all"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              {fullscreen ? (
                <path d="M3 13h4v4M17 7h-4V3M13 13l4 4M7 7l-4-4" />
              ) : (
                <path d="M3 7h4V3M17 13h-4v4M7 17l-4-4M13 3l4 4" />
              )}
            </svg>
          </button>
          <button
            onClick={handleEndSession}
            className="px-4 py-2 rounded-lg bg-crimson-pale border border-crimson/30 text-crimson-light text-sm font-medium hover:bg-crimson/20 transition-all duration-200 active:scale-[0.97]"
          >
            End Session
          </button>
        </div>
      </header>

      <div className="chamber-layout p-4">
        <div id="pdf-panel" className="bg-glass border border-glass-border rounded-xl p-4 shadow-glass backdrop-blur-md overflow-y-auto">
          <PDFViewer />
        </div>
        <div className="flex flex-col gap-4 overflow-y-auto">
          <div className="bg-glass border border-glass-border rounded-xl p-4 shadow-glass backdrop-blur-md flex-1">
            <ZenEditor />
          </div>
          <div className="bg-glass border border-glass-border rounded-xl p-4 shadow-glass backdrop-blur-md">
            <TaskChunker />
          </div>
        </div>
      </div>

      <WarningOverlay
        show={showWarning}
        reason={warningReason}
        strikesLeft={3 - strikeCount}
        onDismiss={dismissWarning}
      />

      <DistractionInbox sessionId={sessionId} />

      {/* Self-report modal */}
      {showSelfReport && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/85 backdrop-blur-2xl animate-fade-in">
          <div className="w-full max-w-md bg-surface border border-glass-border rounded-2xl p-8 shadow-glass animate-scale-in text-center">
            <div className="w-16 h-16 rounded-full bg-amber-pale border border-amber/30 flex items-center justify-center mb-5 mx-auto animate-bounce">
              <span className="text-3xl">⚠️</span>
            </div>
            
            <h2 className="text-xl font-display font-bold text-text-primary mb-2">
              Aktivitas Di Luar FocuSync Terdeteksi
            </h2>
            <p className="text-text-secondary text-xs mb-6 leading-relaxed">
              Jendela belajar Anda kehilangan fokus. Sesuai komitmen fokus, silakan laporkan aktivitas yang baru saja Anda buka:
            </p>

            <div className="space-y-4 text-left mb-6">
              <label className="block text-text-secondary text-xs font-semibold uppercase tracking-wider">
                Aplikasi/Website yang Anda Akses:
              </label>
              
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {allowedItems.map((item) => (
                  <label
                    key={item.id}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                      selectedReport === item.name
                        ? "bg-violet-pale/20 border-violet text-violet-light font-medium"
                        : "bg-glass border-glass-border text-text-secondary hover:bg-glass-hover"
                    }`}
                  >
                    <input
                      type="radio"
                      name="report-item"
                      value={item.name}
                      checked={selectedReport === item.name}
                      onChange={() => setSelectedReport(item.name)}
                      className="accent-violet"
                    />
                    <span className="text-xs">
                      {item.type === "website" ? "🌐" : "💻"} {item.name} (Diizinkan)
                    </span>
                  </label>
                ))}

                <label
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedReport === "violation"
                      ? "bg-crimson-pale/20 border-crimson text-crimson-light font-medium"
                      : "bg-glass border-glass-border text-text-secondary hover:bg-glass-hover"
                  }`}
                >
                  <input
                    type="radio"
                    name="report-item"
                    value="violation"
                    checked={selectedReport === "violation"}
                    onChange={() => setSelectedReport("violation")}
                    className="accent-crimson"
                  />
                  <span className="text-xs">🚫 Situs/Aplikasi Non-Esensial (Pelanggaran)</span>
                </label>

                <label
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 ${
                    selectedReport === "custom"
                      ? "bg-crimson-pale/20 border-crimson text-crimson-light font-medium"
                      : "bg-glass border-glass-border text-text-secondary hover:bg-glass-hover"
                  }`}
                >
                  <input
                    type="radio"
                    name="report-item"
                    value="custom"
                    checked={selectedReport === "custom"}
                    onChange={() => setSelectedReport("custom")}
                    className="accent-crimson"
                  />
                  <span className="text-xs">✍️ Lainnya (Tulis Nama)</span>
                </label>
              </div>

              {selectedReport === "custom" && (
                <input
                  type="text"
                  placeholder="Nama aplikasi atau situs..."
                  value={customReport}
                  onChange={(e) => setCustomReport(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-surface border border-glass-border text-text-primary text-xs placeholder-text-muted outline-none focus:border-crimson/50 transition-all duration-200"
                />
              )}
            </div>

            <button
              onClick={handleConfirmReport}
              disabled={!selectedReport || (selectedReport === "custom" && !customReport.trim())}
              className={`w-full px-5 py-3 rounded-xl font-semibold text-xs transition-all duration-300 ${
                selectedReport
                  ? "bg-gradient-to-r from-violet to-purple-700 text-white shadow-glow-v hover:shadow-[0_0_40px_rgba(124,58,237,0.4)] active:scale-[0.98]"
                  : "bg-glass border border-glass-border text-text-muted cursor-not-allowed"
              }`}
            >
              Kirim Laporan
            </button>
          </div>
        </div>
      )}

      {showEndOverlay && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xl transition-all duration-500">
          <div className="w-full max-w-md transition-all duration-500 animate-scale-in">
            <div className="bg-surface border border-glass-border rounded-2xl p-8 shadow-glass backdrop-blur-xl">
              <div className="flex flex-col items-center text-center">
                {/* Circular Gauge Ring for Focus Score */}
                <div className="relative w-28 h-28 my-4 flex items-center justify-center animate-scale-in">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="rgba(255,255,255,0.06)"
                      strokeWidth="8"
                      fill="transparent"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke={focusScore >= 70 ? "#10B981" : focusScore >= 40 ? "#F59E0B" : "#EF4444"}
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={251.2}
                      strokeDashoffset={251.2 - (251.2 * focusScore) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-1000 ease-out"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-display font-extrabold text-text-primary">{focusScore}</span>
                    <span className="text-[8px] uppercase tracking-wider text-text-muted font-bold">Focus Score</span>
                  </div>
                </div>

                <h2 className={`text-2xl font-display font-bold mb-2 ${strikeCount >= 3 ? "text-crimson-light" : "text-emerald-light"}`}>
                  {strikeCount >= 3 ? "Sesi Gagal" : "Sesi Berhasil!"}
                </h2>
                <p className="text-text-secondary text-sm mb-2">
                  {strikeCount >= 3 ? "Terlalu banyak pelanggaran. Coba lagi next time!" : "Selamat! Kamu berhasil menyelesaikan sesi fokus."}
                </p>
                <p className="text-text-muted text-xs mb-6">
                  Durasi: {elapsedFormatted} · {strikeCount} strike{strikeCount !== 1 ? "s" : ""}
                </p>
                <div className="flex flex-col gap-3 w-full">
                  <Link
                    href={`/distraction-review?sessionId=${sessionId}`}
                    className="w-full px-6 py-3 rounded-xl bg-glass border border-glass-border text-text-primary text-sm font-medium hover:bg-glass-hover transition-all text-center"
                  >
                    Lihat Distraction Notes
                  </Link>
                  <Link
                    href="/dashboard"
                    className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-violet to-purple-700 text-white font-semibold text-sm shadow-glow-v hover:shadow-[0_0_60px_rgba(124,58,237,0.5)] transition-all text-center"
                  >
                    Kembali ke Dashboard
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
