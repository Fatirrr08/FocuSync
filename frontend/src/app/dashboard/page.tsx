'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Sidebar, { SidebarProvider, useSidebar } from '@/components/ui/Sidebar';
import StatsGrid from '@/components/dashboard/StatsGrid';
import ContributionHeatmap from '@/components/dashboard/ContributionHeatmap';
import SessionHistory from '@/components/dashboard/SessionHistory';
import TaskChunker from '@/components/chamber/TaskChunker';
import type { SessionStats, HeatmapData } from '@/types';
import { supabase } from '@/lib/supabase/client';
import { fetchHeatmapLogs } from '@/lib/supabase/heatmap';
import { useSessionStore } from '@/lib/state/sessionStore';
import { useToast } from '@/components/ui/Toast';

const dummyStatsFallback: SessionStats = {
  totalPoints: 0,
  totalSessions: 0,
  streak: 0,
  totalFocusMinutes: 0,
};

function AppLayout({ children }: { children: React.ReactNode }) {
  const { toggle } = useSidebar();

  return (
    <div className="min-h-screen">
      <Sidebar currentPage="Dashboard" />
      <div className="lg:ml-64">
        <header className="sticky top-0 z-30 h-16 border-b border-glass-border bg-deeper/80 backdrop-blur-xl flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="lg:hidden p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-glass-hover transition-all">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 5h14M3 10h14M3 15h10" /></svg>
            </button>
            <h1 className="text-text-primary font-display font-bold text-lg">Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-pale border border-emerald/20">
              <span className="w-2 h-2 rounded-full bg-emerald animate-pulse" />
              <span className="text-emerald-light text-xs font-semibold">Fokus Mode</span>
            </div>
          </div>
        </header>
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

function DashboardInner() {
  const router = useRouter();
  const { addToast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [heatmapData, setHeatmapData] = useState<HeatmapData[] | undefined>(undefined);
  const [stats, setStats] = useState<SessionStats>(dummyStatsFallback);

  // Session Store Hooks
  const sessionId = useSessionStore(state => state.sessionId);
  const status = useSessionStore(state => state.status);
  const setStatus = useSessionStore(state => state.setStatus);
  const setSessionId = useSessionStore(state => state.setSessionId);

  useEffect(() => {
    setMounted(true);
    let active = true;
    const loadHeatmapAndStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const logs = await fetchHeatmapLogs(user.id);
        if (!active) return;

        let totalPts = 0;
        let successSess = 0;
        let streakCount = 0;

        if (logs && logs.length > 0) {
          totalPts = logs.reduce((acc, l) => acc + (l.total_points || 0), 0);
          successSess = logs.reduce((acc, l) => acc + (l.sessions_success || 0), 0);

          // Calculate focus streak
          const activeDates = new Set(
            logs.filter((l) => l.sessions_success > 0).map((l) => l.log_date)
          );

          const checkDate = new Date();
          checkDate.setHours(0, 0, 0, 0);
          const todayStr = checkDate.toISOString().split('T')[0];

          if (activeDates.has(todayStr)) {
            streakCount++;
            checkDate.setDate(checkDate.getDate() - 1);
            while (activeDates.has(checkDate.toISOString().split('T')[0])) {
              streakCount++;
              checkDate.setDate(checkDate.getDate() - 1);
            }
          } else {
            // Check yesterday
            checkDate.setDate(checkDate.getDate() - 1);
            while (activeDates.has(checkDate.toISOString().split('T')[0])) {
              streakCount++;
              checkDate.setDate(checkDate.getDate() - 1);
            }
          }

          const totalDays = 26 * 7;
          const formatted: HeatmapData[] = Array.from({ length: totalDays }, () => ({
            sessions_success: 0,
            sessions_failed: 0,
            total_points: 0,
          }));

          const today = new Date();
          today.setHours(0, 0, 0, 0);

          logs.forEach((log: { log_date: string; sessions_success: number; sessions_failed: number; total_points: number }) => {
            const logDate = new Date(log.log_date);
            logDate.setHours(0, 0, 0, 0);

            const diffTime = today.getTime() - logDate.getTime();
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays >= 0 && diffDays < totalDays) {
              const index = totalDays - 1 - diffDays;
              formatted[index] = {
                sessions_success: log.sessions_success,
                sessions_failed: log.sessions_failed,
                total_points: log.total_points,
              };
            }
          });
          setHeatmapData(formatted);
        }

        // Fetch successful focus minutes
        const { data: successSessions } = await supabase
          .from('sessions')
          .select('started_at, ended_at')
          .eq('user_id', user.id)
          .eq('status', 'SUCCESS');

        let totalFocusSec = 0;
        (successSessions || []).forEach((s) => {
          if (s.started_at && s.ended_at) {
            totalFocusSec += Math.floor((new Date(s.ended_at).getTime() - new Date(s.started_at).getTime()) / 1000);
          }
        });
        const totalFocusMin = Math.ceil(totalFocusSec / 60);

        setStats({
          totalPoints: totalPts,
          totalSessions: successSess,
          streak: streakCount,
          totalFocusMinutes: totalFocusMin,
        });

      } catch (err) {
        console.error('Failed to load stats & heatmap logs:', err);
      }
    };

    loadHeatmapAndStats();

    return () => {
      active = false;
    };
  }, []);

  // 1. Konfigurasi Sesi Baru (Button memicu createSession)
  const handleCreateSession = () => {
    const newSessionId = 'fs-sess-' + Math.random().toString(36).substring(2, 11);
    setSessionId(newSessionId);
    setStatus('PAIRING');
    addToast('success', 'Sesi baru berhasil diinisialisasi! Memulai proses pairing...');
    router.push(`/session/${newSessionId}`);
  };

  // 2. Konfigurasi Study Chamber (Deteksi sesi aktif di Zustand)
  const handleStudyChamberClick = () => {
    const hasActiveSession = status !== 'IDLE' && status !== 'FAILED' && status !== 'SUCCESS';
    if (!hasActiveSession) {
      addToast('error', 'Silakan mulai sesi baru terlebih dahulu untuk mengakses Study Chamber.');
    } else {
      router.push(`/session/${sessionId}`);
    }
  };

  return (
    <div className={`space-y-6 transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold text-text-primary">Dashboard</h2>
          <p className="text-text-secondary text-sm mt-1">Siap untuk sesi fokus hari ini?</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCreateSession}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet to-purple-700 text-white text-sm font-semibold shadow-glow-v hover:shadow-[0_0_60px_rgba(124,58,237,0.5)] transition-all duration-300 active:scale-95 inline-flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="10" cy="10" r="8" /><path d="M10 6v8M6 10h8" /></svg>
            Sesi Baru
          </button>
        </div>
      </div>

      <StatsGrid stats={stats} />

      <ContributionHeatmap data={heatmapData} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-glass border border-glass-border rounded-xl p-5 shadow-glass backdrop-blur-md">
            <h3 className="text-text-primary font-display font-semibold text-sm mb-4">Quick Actions</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'Sesi Baru', action: 'create', icon: '⚡', color: 'from-violet/20 to-violet/5 hover:border-violet/30' },
                { label: 'Allow-list', href: '/settings/allowlist', icon: '🛡️', color: 'from-emerald/20 to-emerald/5 hover:border-emerald/30' },
                { label: 'Distraction', href: '/distraction-review', icon: '📥', color: 'from-amber/20 to-amber/5 hover:border-amber/30' },
                { label: 'Chamber', action: 'chamber', icon: '📖', color: 'from-violet/20 to-violet/5 hover:border-violet/30' },
              ].map((action) => {
                const cardStyle = `relative bg-glass border border-glass-border rounded-xl p-4 text-center hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden ${action.color} cursor-pointer w-full block`;
                
                if (action.action === 'create') {
                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={handleCreateSession}
                      className={cardStyle}
                    >
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                      <span className="text-text-primary text-xs font-medium">{action.label}</span>
                    </button>
                  );
                }
                
                if (action.action === 'chamber') {
                  const hasActiveSession = status !== 'IDLE' && status !== 'FAILED' && status !== 'SUCCESS';
                  return (
                    <button
                      key={action.label}
                      type="button"
                      onClick={handleStudyChamberClick}
                      className={`${cardStyle} ${!hasActiveSession ? 'opacity-50 hover:bg-transparent hover:text-text-secondary cursor-not-allowed' : ''}`}
                    >
                      <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                      <span className="text-text-primary text-xs font-medium">{action.label}</span>
                    </button>
                  );
                }

                return (
                  <Link
                    key={action.label}
                    href={action.href || '#'}
                    className={cardStyle}
                  >
                    <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">{action.icon}</div>
                    <span className="text-text-primary text-xs font-medium">{action.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-glass border border-glass-border rounded-xl p-5 shadow-glass backdrop-blur-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-text-primary font-display font-semibold text-sm">Task Preview</h3>
              <span className="text-text-muted text-xs">Sesi terakhir</span>
            </div>
            <TaskChunker />
          </div>
        </div>

        <div className="space-y-6">
          <SessionHistory />
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <SidebarProvider>
      <AppLayout>
        <DashboardInner />
      </AppLayout>
    </SidebarProvider>
  );
}
