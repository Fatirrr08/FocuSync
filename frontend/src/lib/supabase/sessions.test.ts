import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createSession, updateSessionStatus, startSession, updateSession } from './sessions';

const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockSelect = vi.fn();

vi.mock('./client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'sessions') {
        return {
          insert: mockInsert,
          update: mockUpdate,
          select: mockSelect,
        };
      }
      return {};
    },
  },
}));

describe('Supabase Sessions DB Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createSession inserts a new session in PAIRING status', async () => {
    const mockSession = { id: 'session-123', session_token: 'token-456', status: 'PAIRING' };
    mockInsert.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: mockSession, error: null }),
      }),
    });

    const result = await createSession('user-999');

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: 'user-999',
        status: 'PAIRING',
      })
    );
    expect(result).toEqual(mockSession);
  });

  it('updateSessionStatus updates the session status', async () => {
    mockUpdate.mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });

    await updateSessionStatus('session-123', 'READY');

    expect(mockUpdate).toHaveBeenCalledWith({ status: 'READY' });
  });

  it('updateSession updates multiple fields', async () => {
    mockUpdate.mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });

    await updateSession('session-123', { status: 'STRIKE_WARN', strike_count: 2 });

    expect(mockUpdate).toHaveBeenCalledWith({ status: 'STRIKE_WARN', strike_count: 2 });
  });

  it('startSession updates status to FOCUSING and sets started_at', async () => {
    mockUpdate.mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });

    await startSession('session-123');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'FOCUSING',
        started_at: expect.any(String),
      })
    );
  });
});
