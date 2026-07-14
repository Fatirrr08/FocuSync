import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncDistractionNotes, fetchDistractionNotes } from './distractions';

const mockSelect = vi.fn();
const mockInsert = vi.fn();

vi.mock('./client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'distraction_notes') {
        return {
          select: mockSelect,
          insert: mockInsert,
        };
      }
      return {};
    },
  },
}));

describe('Supabase Distractions DB Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('syncDistractionNotes reads from localStorage, bulk inserts to Supabase, and clears localStorage', async () => {
    const sessionId = 'session-123';
    const localData = [
      { id: 1, content: 'Distraction 1', created_at: '2026-07-13T10:00:00Z' },
      { id: 2, content: 'Distraction 2', created_at: '2026-07-13T10:05:00Z' },
    ];
    localStorage.setItem(`distraction_inbox_${sessionId}`, JSON.stringify(localData));

    mockInsert.mockReturnValue(Promise.resolve({ error: null }));

    const result = await syncDistractionNotes(sessionId);

    expect(mockInsert).toHaveBeenCalledWith([
      { session_id: sessionId, content: 'Distraction 1', created_at: '2026-07-13T10:00:00Z', unlocked_at: expect.any(String) },
      { session_id: sessionId, content: 'Distraction 2', created_at: '2026-07-13T10:05:00Z', unlocked_at: expect.any(String) },
    ]);
    expect(result).toBe(true);
    expect(localStorage.getItem(`distraction_inbox_${sessionId}`)).toBeNull();
  });

  it('syncDistractionNotes returns true if there is nothing to sync', async () => {
    const result = await syncDistractionNotes('session-empty');
    expect(result).toBe(true);
    expect(mockInsert).not.toHaveBeenCalled();
  });

  it('fetchDistractionNotes retrieves notes from Supabase', async () => {
    const mockNotes = [
      { id: 'uuid-1', session_id: 'session-123', content: 'Distraction 1', created_at: '2026-07-13T10:00:00Z' }
    ];
    mockSelect.mockReturnValue({
      eq: () => ({
        order: () => Promise.resolve({ data: mockNotes, error: null })
      })
    });

    const result = await fetchDistractionNotes('session-123');

    expect(mockSelect).toHaveBeenCalled();
    expect(result).toEqual(mockNotes);
  });
});
