export interface User {
  id: string;
  email: string;
  display_name?: string;
  created_at: string;
}

export type SessionStatus = 'IDLE' | 'PAIRING' | 'READY' | 'FOCUSING' | 'STRIKE_WARN' | 'SUCCESS' | 'FAILED';

export interface Session {
  id: string;
  user_id: string;
  session_token: string;
  status: SessionStatus;
  strike_count: number;
  started_at?: string;
  ended_at?: string;
  created_at: string;
}

export interface TaskChunk {
  id: number;
  name: string;
  duration: number;
  done: boolean;
  points: number;
}

export interface DistractionNote {
  id: string | number;
  content: string;
  created_at: string;
}

export interface AllowlistItem {
  id: string | number;
  type: 'website' | 'app';
  name: string;
  allowed: boolean;
  isDefault: boolean;
}

export interface HeatmapData {
  sessions_success: number;
  sessions_failed: number;
  total_points: number;
}

export type AnchorStatus = 'PAIRING' | 'ANCHORED' | 'LIFTED' | 'FOCUSING' | 'ENDED';

export interface RealtimeEvent {
  type: string;
  payload: Record<string, unknown>;
  sender: string;
  timestamp: number;
}

export interface ViolationLog {
  name: string;
  type: 'website' | 'app';
  is_self_reported: boolean;
  time: string;
}

export interface SessionStats {
  totalPoints: number;
  totalSessions: number;
  streak: number;
  totalFocusMinutes: number;
}

export interface SessionHistoryItem {
  id: string;
  name: string;
  duration: number;
  chunks: number;
  points: number;
  status: 'success' | 'failed';
  strikes: number;
  time: string;
}
