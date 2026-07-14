import { create } from 'zustand';

interface SessionState {
  status: 'IDLE' | 'PAIRING' | 'READY' | 'FOCUSING' | 'STRIKE_WARN' | 'SUCCESS' | 'FAILED';
  strikeCount: number;
  sessionId: string;
  sessionToken: string;
  elapsed: number;
  chunks: Array<{ id: string | number; name: string; duration: number; done: boolean; points: number }>;
  currentChunkIndex: number;
  distractionInbox: Array<{ id: number; content: string; created_at: string }>;
  zenMode: boolean;
  setStatus: (status: SessionState['status']) => void;
  addStrike: () => void;
  resetStrikes: () => void;
  setSessionId: (id: string) => void;
  setSessionToken: (token: string) => void;
  setElapsed: (s: number) => void;
  setChunks: (chunks: SessionState['chunks']) => void;
  completeChunk: (index: number) => void;
  setCurrentChunk: (index: number) => void;
  addDistraction: (content: string) => void;
  toggleZenMode: () => void;
  reset: () => void;
}

const defaultChunks = [
  { id: 1, name: 'Baca materi bab 5', duration: 15, done: false, points: 10 },
  { id: 2, name: 'Kerjakan latihan', duration: 15, done: false, points: 10 },
  { id: 3, name: 'Buat ringkasan', duration: 15, done: false, points: 10 },
  { id: 4, name: 'Review jawaban', duration: 10, done: false, points: 10 },
];

export const useSessionStore = create<SessionState>((set) => ({
  status: 'IDLE',
  strikeCount: 0,
  sessionId: 'demo-session-' + Date.now(),
  sessionToken: 'token-' + Date.now(),
  elapsed: 0,
  chunks: defaultChunks,
  currentChunkIndex: 0,
  distractionInbox: [],
  zenMode: false,
  setStatus: (status) => set({ status }),
  addStrike: () => set((s) => ({ strikeCount: s.strikeCount + 1 })),
  resetStrikes: () => set({ strikeCount: 0 }),
  setSessionId: (id) => set({ sessionId: id }),
  setSessionToken: (token) => set({ sessionToken: token }),
  setElapsed: (s) => set({ elapsed: s }),
  setChunks: (chunks) => set({ chunks }),
  completeChunk: (index) => set((s) => ({
    chunks: s.chunks.map((c, i) => i === index ? { ...c, done: true } : c)
  })),
  setCurrentChunk: (index) => set({ currentChunkIndex: index }),
  addDistraction: (content) => set((s) => ({
    distractionInbox: [...s.distractionInbox, { id: Date.now(), content, created_at: new Date().toISOString() }]
  })),
  toggleZenMode: () => set((s) => ({ zenMode: !s.zenMode })),
  reset: () => set({
    status: 'IDLE', strikeCount: 0, elapsed: 0, chunks: defaultChunks,
    currentChunkIndex: 0, distractionInbox: [], zenMode: false
  }),
}));
