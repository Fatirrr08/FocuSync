import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchAllowlist,
  addAllowlistItem,
  deleteAllowlistItem,
  toggleAllowlistItem,
  logAllowlistViolation
} from './allowlist';

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock('./client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'focus_allowlist') {
        return {
          select: mockSelect,
          insert: mockInsert,
          update: mockUpdate,
          delete: mockDelete,
        };
      }
      if (table === 'allowlist_violations') {
        return {
          insert: mockInsert,
        };
      }
      return {};
    },
  },
}));

describe('Supabase Allowlist DB Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchAllowlist returns mapped allowlist items', async () => {
    const mockDbItems = [
      { id: 'uuid-1', type: 'website', name: 'github.com', allowed: true, is_default: true }
    ];
    mockSelect.mockReturnValue({
      eq: () => ({
        order: () => Promise.resolve({ data: mockDbItems, error: null })
      }),
    });

    const result = await fetchAllowlist('user-123');

    expect(mockSelect).toHaveBeenCalled();
    expect(result).toEqual([
      { id: 'uuid-1', type: 'website', name: 'github.com', allowed: true, isDefault: true }
    ]);
  });

  it('addAllowlistItem inserts a new item', async () => {
    mockInsert.mockReturnValue(Promise.resolve({ error: null }));

    await addAllowlistItem('user-123', 'notion.so', 'website', true);

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-123',
      name: 'notion.so',
      type: 'website',
      allowed: true,
      is_default: false,
    });
  });

  it('deleteAllowlistItem deletes item by id', async () => {
    mockDelete.mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });

    await deleteAllowlistItem('uuid-1');

    expect(mockDelete).toHaveBeenCalled();
  });

  it('toggleAllowlistItem updates allowed flag', async () => {
    mockUpdate.mockReturnValue({
      eq: () => Promise.resolve({ error: null }),
    });

    await toggleAllowlistItem('uuid-1', false);

    expect(mockUpdate).toHaveBeenCalledWith({ allowed: false });
  });

  it('logAllowlistViolation logs a focus violation', async () => {
    mockInsert.mockReturnValue(Promise.resolve({ error: null }));

    await logAllowlistViolation('session-123', 'instagram.com', 'website', true);

    expect(mockInsert).toHaveBeenCalledWith({
      session_id: 'session-123',
      detected_name: 'instagram.com',
      type: 'website',
      is_self_reported: true,
    });
  });
});
