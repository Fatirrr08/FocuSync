"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useSessionStore } from "@/lib/state/sessionStore";
import { fetchSessionTasks, createSessionTask, completeSessionTask } from "@/lib/supabase/tasks";

export default function TaskChunker() {
  const chunks = useSessionStore((s) => s.chunks);
  const completeChunk = useSessionStore((s) => s.completeChunk);
  const activeIndex = useSessionStore((s) => s.currentChunkIndex);
  const sessionId = useSessionStore((s) => s.sessionId);
  const setChunks = useSessionStore((s) => s.setChunks);
  const setCurrentChunk = useSessionStore((s) => s.setCurrentChunk);

  const [confirmIndex, setConfirmIndex] = useState<number | null>(null);
  const [flyingPts, setFlyingPts] = useState<{ id: number; x: number; y: number }[]>([]);
  
  // Timer States
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const activeChunk = chunks[activeIndex];

  // Seed / Load tasks from Supabase
  useEffect(() => {
    let active = true;
    const loadTasks = async () => {
      if (!sessionId || sessionId.startsWith("demo-session-")) return;

      const dbTasks = await fetchSessionTasks(sessionId);
      if (!active) return;

      if (dbTasks && dbTasks.length > 0) {
        const mapped = dbTasks.map((t: { id: string; title: string; planned_duration_minutes: number; is_done: boolean; points_awarded: number | null }) => ({
          id: t.id,
          name: t.title,
          duration: t.planned_duration_minutes,
          done: t.is_done,
          points: t.points_awarded || 10,
        }));
        setChunks(mapped);

        const firstUndone = mapped.findIndex(t => !t.done);
        if (firstUndone !== -1) {
          setCurrentChunk(firstUndone);
        }
      } else {
        const defaultSeeds = [
          { name: 'Baca materi bab 5', duration: 15, points: 10 },
          { name: 'Kerjakan latihan', duration: 15, points: 10 },
          { name: 'Buat ringkasan', duration: 15, points: 10 },
          { name: 'Review jawaban', duration: 10, points: 10 },
        ];

        const createdTasks = [];
        for (const s of defaultSeeds) {
          const t = await createSessionTask(sessionId, s.name, s.duration);
          if (t) {
            createdTasks.push({
              id: t.id,
              name: t.title,
              duration: t.planned_duration_minutes,
              done: t.is_done,
              points: t.points_awarded || s.points,
            });
          }
        }

        if (active && createdTasks.length > 0) {
          setChunks(createdTasks);
          setCurrentChunk(0);
        }
      }
    };
    loadTasks();
    return () => {
      active = false;
    };
  }, [sessionId, setChunks, setCurrentChunk]);

  // Set timeLeft on active task change
  useEffect(() => {
    if (activeChunk && !activeChunk.done) {
      setTimeLeft(activeChunk.duration * 60);
      setIsRunning(false);
    } else {
      setTimeLeft(0);
      setIsRunning(false);
    }
  }, [activeChunk]);

  const handleAutoComplete = useCallback(
    async (index: number) => {
      const chunk = chunks[index];
      if (!chunk || chunk.done) return;

      // Flying points animation at approximate screen center
      const id = Date.now();
      setFlyingPts((prev) => [...prev, { id, x: typeof window !== 'undefined' ? window.innerWidth / 2 : 500, y: typeof window !== 'undefined' ? window.innerHeight / 2 : 300 }]);
      setTimeout(() => setFlyingPts((prev) => prev.filter((p) => p.id !== id)), 1500);

      // Save to Supabase DB
      if (typeof chunk.id === "string") {
        await completeSessionTask(chunk.id, chunk.duration, chunk.points);
      }

      // Complete in Zustand store
      completeChunk(index);

      // Auto-advance to next undone task
      const nextUndone = chunks.findIndex((c, i) => i > index && !c.done);
      if (nextUndone !== -1) {
        setCurrentChunk(nextUndone);
      } else {
        setCurrentChunk(-1);
      }
    },
    [chunks, completeChunk, setCurrentChunk]
  );

  // Timer countdown hook
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          handleAutoComplete(activeIndex);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, activeIndex, handleAutoComplete]);

  const handleComplete = useCallback(
    async (index: number, e: React.MouseEvent) => {
      const chunk = chunks[index];
      if (chunk.done) return;

      if (confirmIndex === index) {
        const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
        const id = Date.now();
        setFlyingPts((prev) => [...prev, { id, x: rect.left + rect.width / 2, y: rect.top }]);
        setTimeout(() => setFlyingPts((prev) => prev.filter((p) => p.id !== id)), 1500);

        const elapsedSec = (chunk.duration * 60) - timeLeft;
        const actualMin = Math.max(1, Math.ceil(elapsedSec / 60));

        if (typeof chunk.id === "string") {
          await completeSessionTask(chunk.id, actualMin, chunk.points);
        }

        completeChunk(index);

        const nextUndone = chunks.findIndex((c, i) => i > index && !c.done);
        if (nextUndone !== -1) {
          setCurrentChunk(nextUndone);
        } else {
          setCurrentChunk(-1);
        }

        setConfirmIndex(null);
        setIsRunning(false);
      } else {
        setConfirmIndex(index);
      }
    },
    [chunks, confirmIndex, completeChunk, timeLeft, setCurrentChunk]
  );

  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-text-primary font-display font-bold text-base mb-1">Task Chunks</h3>
      {chunks.map((chunk, i) => {
        const isActive = i === activeIndex && !chunk.done;
        const isConfirming = confirmIndex === i && !chunk.done;

        return (
          <div
            key={chunk.id}
            onClick={(e) => handleComplete(i, e)}
            className={`
              relative flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer
              ${
                chunk.done
                  ? "bg-glass border-emerald/20 opacity-60"
                  : isActive
                    ? "bg-glass border-violet/40 shadow-[0_0_20px_rgba(124,58,237,0.25)]"
                    : "bg-glass border-glass-border hover:border-glass-border-h"
              }
            `}
          >
            <div
              className={`
                shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300
                ${
                  chunk.done
                    ? "bg-emerald border-emerald"
                    : isActive
                      ? "border-violet"
                      : "border-text-muted"
                }
              `}
            >
              {chunk.done && (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 8l3 3l5-5" />
                </svg>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={`text-sm font-medium truncate ${
                  chunk.done ? "text-text-muted line-through" : "text-text-primary"
                }`}
              >
                {chunk.name}
              </p>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="text-xs text-text-muted">{chunk.duration} min</span>
                {isActive && (
                  <span className="text-xs font-mono font-bold text-violet-light tracking-wide tabular-nums">
                    {formatTime(timeLeft)}
                  </span>
                )}
              </div>
            </div>

            {isActive && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsRunning((prev) => !prev);
                }}
                className="p-1.5 rounded-lg bg-glass border border-glass-border text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-all"
              >
                {isRunning ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" />
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            )}

            {chunk.done && (
              <span className="text-emerald text-xs font-semibold shrink-0">+{chunk.points} pts</span>
            )}

            {isConfirming && (
              <span className="text-xs text-text-muted shrink-0 animate-pulse bg-surface px-2 py-1 rounded-md border border-glass-border">Confirm?</span>
            )}
          </div>
        );
      })}

      {flyingPts.map((pt) => (
        <span
          key={pt.id}
          className="fixed pointer-events-none text-emerald font-bold text-sm z-50 animate-pts-fly"
          style={{ left: pt.x, top: pt.y, transform: "translateX(-50%)" }}
        >
          +10 pts
        </span>
      ))}
    </div>
  );
}
