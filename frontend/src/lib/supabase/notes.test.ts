import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveSessionNotes, fetchSessionNotes } from './notes';

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock('./client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'notes') {
        return {
          select: mockSelect,
          insert: mockInsert,
          update: mockUpdate,
        };
      }
      return {};
    },
  },
}));

describe('Supabase Notes DB Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saveSessionNotes inserts a note if it does not exist', async () => {
    // Mock select returning no note ID
    mockSelect.mockReturnValue({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: null, error: null })
      })
    });

    mockInsert.mockReturnValue(Promise.resolve({ error: null }));

    const result = await saveSessionNotes('session-123', 'My notes content');

    expect(mockInsert).toHaveBeenCalledWith({
      session_id: 'session-123',
      content_markdown: 'My notes content',
    });
    expect(result).toBe(true);
  });

  it('saveSessionNotes updates a note if it already exists', async () => {
    // Mock select returning an existing note ID
    mockSelect.mockReturnValue({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: { id: 'note-uuid-999' }, error: null })
      })
    });

    mockUpdate.mockReturnValue({
      eq: () => Promise.resolve({ error: null })
    });

    const result = await saveSessionNotes('session-123', 'Updated notes content');

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        content_markdown: 'Updated notes content',
      })
    );
    expect(result).toBe(true);
  });

  it('fetchSessionNotes returns note markdown content', async () => {
    mockSelect.mockReturnValue({
      eq: () => ({
        maybeSingle: () => Promise.resolve({ data: { content_markdown: 'Saved text' }, error: null })
      })
    });

    const result = await fetchSessionNotes('session-123');

    expect(result).toBe('Saved text');
  });
});
