'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import type { DistractionNote } from '@/types';
import { fetchDistractionNotes } from '@/lib/supabase/distractions';

function getNoteCategory(content: string): { label: string; style: string } {
  const text = content.toLowerCase();
  if (
    text.includes('todo') ||
    text.includes('task') ||
    text.includes('kerjakan') ||
    text.includes('buat') ||
    text.includes('selesaikan')
  ) {
    return { label: "Actionable", style: "bg-emerald-pale text-emerald-light border-emerald/30" };
  }
  if (
    text.includes('ide') ||
    text.includes('mungkin') ||
    text.includes('inspirasi') ||
    text.includes('coba')
  ) {
    return { label: "Creative Idea", style: "bg-amber-pale text-amber border-amber/30" };
  }
  return { label: "Pure Distraction", style: "bg-crimson-pale text-crimson-light border-crimson/30" };
}

function DistractionReviewInner() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionId');
  const [notes, setNotes] = useState<DistractionNote[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const loadNotes = async () => {
      if (sessionId) {
        try {
          const dbNotes = await fetchDistractionNotes(sessionId);
          setNotes(
            dbNotes.map((n) => ({
              id: n.id,
              content: n.content,
              created_at: n.created_at,
            }))
          );
        } catch (err) {
          console.error('Failed to load notes from Supabase:', err);
        }
      } else {
        // Fallback to local storage scan
        const allNotes: DistractionNote[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('distraction_inbox_')) {
            try {
              const data = JSON.parse(localStorage.getItem(key) || '[]');
              allNotes.push(...data);
            } catch {}
          }
        }
        allNotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        setNotes(allNotes);
      }
    };
    loadNotes();
  }, [sessionId]);

  const totalNotes = notes.length;
  const actionableItems = notes.filter((n) =>
    n.content.toLowerCase().includes('todo') ||
    n.content.toLowerCase().includes('task') ||
    n.content.toLowerCase().includes('kerjakan') ||
    n.content.toLowerCase().includes('buat') ||
    n.content.toLowerCase().includes('selesaikan')
  ).length;
  const creativeIdeas = notes.filter((n) =>
    n.content.toLowerCase().includes('ide') ||
    n.content.toLowerCase().includes('mungkin') ||
    n.content.toLowerCase().includes('inspirasi') ||
    n.content.toLowerCase().includes('coba')
  ).length;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className={`w-full max-w-2xl transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
        <div className="text-center mb-8">
          <img src="/FocuSync.svg" alt="FocuSync" className="h-10 w-auto mb-4 mx-auto" />
          <h1 className="text-2xl font-display font-bold text-text-primary">Distraction Review</h1>
          <p className="text-text-secondary text-sm mt-1">Catatan pikiran yang mengganggu selama sesi fokus</p>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total Notes', value: totalNotes, color: 'text-violet-light', icon: '📝' },
            { label: 'Actionable', value: actionableItems, color: 'text-emerald-light', icon: '✅' },
            { label: 'Creative Ideas', value: creativeIdeas, color: 'text-amber', icon: '💡' },
          ].map((stat) => (
            <div key={stat.label} className="bg-glass border border-glass-border rounded-xl p-4 text-center shadow-glass backdrop-blur-md">
              <span className="text-xl block mb-2">{stat.icon}</span>
              <div className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-text-muted text-xs mt-1">{stat.label}</div>
            </div>
          ))}
        </div>

        {notes.length === 0 ? (
          <div className="bg-glass border border-glass-border rounded-xl p-12 text-center shadow-glass backdrop-blur-md">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(241,245,249,0.35)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
            <p className="text-text-primary text-sm font-medium">Belum ada catatan distraksi</p>
            <p className="text-text-muted text-xs mt-1">Catatan dari sesi fokus akan muncul di sini.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notes.map((note) => {
              const cat = getNoteCategory(note.content);
              return (
                <div
                  key={note.id}
                  className="bg-glass border border-glass-border rounded-xl p-5 shadow-glass backdrop-blur-md hover:border-glass-border-h transition-all duration-200 animate-fade-up"
                >
                  <div className="flex items-start gap-4">
                    <span className="shrink-0 mt-0.5 text-lg">💭</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-3 mb-2 flex-wrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${cat.style}`}>
                          {cat.label}
                        </span>
                        <span className="text-text-muted text-[10px] font-mono">
                          {new Date(note.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-text-primary text-sm leading-relaxed">{note.content}</p>
                      <p className="text-text-muted text-[10px] mt-3">
                        {new Date(note.created_at).toLocaleDateString('id-ID', {
                          weekday: 'long',
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="text-center mt-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet to-purple-700 text-white font-semibold text-sm shadow-glow-v hover:shadow-[0_0_60px_rgba(124,58,237,0.5)] transition-all duration-300 active:scale-[0.98]"
          >
            <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5l-5 5l5 5" />
            </svg>
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function DistractionReviewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-deeper flex items-center justify-center">
        <div className="w-10 h-10 rounded-full border border-violet bg-violet-pale/10 animate-ping" />
      </div>
    }>
      <DistractionReviewInner />
    </Suspense>
  );
}
