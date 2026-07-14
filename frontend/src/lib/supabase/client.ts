import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type {
  AuthChangeEvent,
  Session,
  Subscription,
  User,
  AuthTokenResponsePassword,
  AuthError,
} from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Detect if credentials are real or placeholder
const isReal =
  supabaseUrl.length > 0 &&
  supabaseAnonKey.length > 0 &&
  !supabaseUrl.includes('your-project-id') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseAnonKey.includes('your-anon-key') &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.endsWith('.supabase.co');

// ─────────────────────────────────────────────────────────
// REAL Supabase client (when .env.local is properly set)
// ─────────────────────────────────────────────────────────
let supabase: SupabaseClient;

if (isReal) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else {
  // ─────────────────────────────────────────────────────────
  // FULL OFFLINE MOCK — demo@focusync.com / focusync123
  // ─────────────────────────────────────────────────────────
  const STORAGE_KEY = 'focusync_mock_session';

  const mockUser: User = {
    id: 'demo-user-id-999',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'demo@focusync.com',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: { provider: 'email' },
    user_metadata: { name: 'Demo User' },
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const makeMockSession = (): Session => ({
    access_token: 'mock-access-token-' + Date.now(),
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'mock-refresh-token',
    user: mockUser,
  });

  const listeners: Set<(event: AuthChangeEvent, session: Session | null) => void> = new Set();

  const notify = (event: AuthChangeEvent, session: Session | null) => {
    listeners.forEach((cb) => { try { cb(event, session); } catch { /* ignore */ } });
  };

  const getStoredSession = (): Session | null => {
    if (typeof window === 'undefined') return null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  };

  // ─── Mock Auth ────────────────────────────────────────
  const mockAuth = {
    signInWithPassword: async (credentials: { email?: string; phone?: string; password: string }): Promise<AuthTokenResponsePassword> => {
      const email = (credentials as { email?: string }).email ?? '';
      const password = credentials.password ?? '';
      if (email === 'demo@focusync.com' && password === 'focusync123') {
        const session = makeMockSession();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
        notify('SIGNED_IN', session);
        return { data: { session, user: mockUser }, error: null } as AuthTokenResponsePassword;
      }
      const err = Object.assign(new Error('Email atau password demo salah.\nGunakan: demo@focusync.com | password: focusync123'), {
        status: 400, code: 'invalid_credentials',
      }) as unknown as AuthError;
      return { data: { session: null, user: null }, error: err } as unknown as AuthTokenResponsePassword;
    },
    signUp: async () => {
      const session = makeMockSession();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      notify('SIGNED_IN', session);
      return { data: { session, user: mockUser }, error: null };
    },
    signOut: async () => {
      localStorage.removeItem(STORAGE_KEY);
      notify('SIGNED_OUT', null);
      return { error: null };
    },
    getSession: async () => {
      const session = getStoredSession();
      return { data: { session }, error: null };
    },
    getUser: async () => {
      const session = getStoredSession();
      return { data: { user: session ? session.user : null }, error: null };
    },
    onAuthStateChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) => {
      listeners.add(callback);
      setTimeout(() => {
        const session = getStoredSession();
        callback('INITIAL_SESSION', session);
      }, 0);
      const subscription: Subscription = {
        id: 'mock-sub-' + Math.random(),
        callback: callback as unknown as () => void,
        unsubscribe: () => { listeners.delete(callback); },
      };
      return { data: { subscription } };
    },
    resetPasswordForEmail: async () => ({ data: {}, error: null }),
    updateUser: async () => ({ data: { user: mockUser }, error: null }),
    setSession: async () => ({ data: { session: null, user: null }, error: null }),
    exchangeCodeForSession: async () => ({ data: { session: null, user: null }, error: null }),
  };

  // ─── Mock Database (supabase.from) ────────────────────
  const MOCK_DB: Record<string, Record<string, unknown>[]> = {
    sessions: [],
    tasks: [],
    focus_allowlist: [
      { id: 1, user_id: 'demo-user-id-999', type: 'website', name: 'github.com', allowed: true, is_default: true },
      { id: 2, user_id: 'demo-user-id-999', type: 'website', name: 'docs.google.com', allowed: true, is_default: true },
      { id: 3, user_id: 'demo-user-id-999', type: 'website', name: 'scholar.google.com', allowed: true, is_default: true },
      { id: 4, user_id: 'demo-user-id-999', type: 'website', name: 'developer.mozilla.org', allowed: true, is_default: true },
      { id: 5, user_id: 'demo-user-id-999', type: 'website', name: 'notion.so', allowed: true, is_default: true },
      { id: 6, user_id: 'demo-user-id-999', type: 'website', name: 'youtube.com', allowed: false, is_default: true },
      { id: 7, user_id: 'demo-user-id-999', type: 'website', name: 'instagram.com', allowed: false, is_default: true },
      { id: 8, user_id: 'demo-user-id-999', type: 'website', name: 'tiktok.com', allowed: false, is_default: true },
      { id: 9, user_id: 'demo-user-id-999', type: 'app', name: 'Visual Studio Code', allowed: true, is_default: true },
      { id: 10, user_id: 'demo-user-id-999', type: 'app', name: 'Notion Desktop', allowed: true, is_default: true },
      { id: 11, user_id: 'demo-user-id-999', type: 'app', name: 'Zotero / Mendeley', allowed: true, is_default: true },
      { id: 12, user_id: 'demo-user-id-999', type: 'app', name: 'Game launcher (Steam)', allowed: false, is_default: true },
    ],
    notes: [],
    distraction_notes: [],
    allowlist_violations: [],
    heatmap_logs: [],
  };

  // Chainable query builder — fully functional for offline mock
  const makeQueryBuilder = (table: string) => {
    const allRows = () => MOCK_DB[table] ?? [];

    const _filters: Array<{ col: string; val: unknown }> = [];
    let _single = false;
    let _mode: 'select' | 'insert' | 'update' | 'delete' = 'select';
    let _insertData: Record<string, unknown> | Record<string, unknown>[] | null = null;
    let _updateData: Record<string, unknown> | null = null;
    let _count: 'exact' | null = null;

    const applyFilters = (rows: Record<string, unknown>[]) =>
      rows.filter((r) => _filters.every(({ col, val }) => r[col] === val));

    const builder = {
      select: (_cols?: string, opts?: { count?: string; head?: boolean }) => {
        _mode = 'select';
        if (opts?.count === 'exact') _count = 'exact';
        return builder;
      },
      eq: (col: string, val: unknown) => { _filters.push({ col, val }); return builder; },
      neq: () => builder,
      in: () => builder,
      order: () => builder,
      limit: () => builder,
      single: () => { _single = true; return builder; },
      insert: (data: Record<string, unknown> | Record<string, unknown>[]) => {
        _mode = 'insert'; _insertData = data; return builder;
      },
      update: (data: Record<string, unknown>) => {
        _mode = 'update'; _updateData = data; return builder;
      },
      upsert: (data: Record<string, unknown> | Record<string, unknown>[]) => {
        _mode = 'insert'; _insertData = data; return builder;
      },
      delete: () => { _mode = 'delete'; return builder; },
      then: (resolve: (val: { data: unknown; error: null; count?: number | null }) => void) => {
        if (_mode === 'insert' && _insertData !== null) {
          const toInsert = Array.isArray(_insertData) ? _insertData : [_insertData];
          const inserted = toInsert.map((item, i) => ({
            id: Date.now() + i,
            is_default: false,
            ...item,
          }));
          if (!MOCK_DB[table]) MOCK_DB[table] = [];
          MOCK_DB[table].push(...inserted);
          resolve({ data: _single ? inserted[0] ?? null : inserted, error: null });
          return;
        }
        if (_mode === 'update' && _updateData !== null) {
          const matched = applyFilters(allRows());
          matched.forEach((r) => Object.assign(r, _updateData));
          resolve({ data: _single ? matched[0] ?? null : matched, error: null });
          return;
        }
        if (_mode === 'delete') {
          const toDelete = applyFilters(allRows());
          const ids = new Set(toDelete.map((r) => r.id));
          MOCK_DB[table] = allRows().filter((r) => !ids.has(r.id));
          resolve({ data: toDelete, error: null });
          return;
        }
        // select
        if (_count === 'exact') {
          const rows = applyFilters(allRows());
          resolve({ data: null, error: null, count: rows.length });
          return;
        }
        const rows = applyFilters(allRows());
        resolve({ data: _single ? (rows[0] ?? null) : rows, error: null });
      },
    };
    return builder;
  };

  // Build the full mock channel for Realtime (no-op)
  const makeMockChannel = () => {
    const ch = {
      on: () => ch,
      subscribe: () => ch,
      unsubscribe: () => ch,
      send: async () => ({ status: 'ok' }),
    };
    return ch;
  };

  // Create real client but override everything
  supabase = createClient('https://mock.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.mock');

  // @ts-expect-error — intentional full auth override
  supabase.auth = mockAuth;

  // @ts-expect-error — override from() with mock query builder
  supabase.from = (table: string) => makeQueryBuilder(table);

  // @ts-expect-error — override channel() with mock realtime
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  supabase.channel = (_n: string) => makeMockChannel();
}

export { supabase };
