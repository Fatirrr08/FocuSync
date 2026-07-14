import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchHeatmapLogs, updateHeatmapLog } from './heatmap';

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();

vi.mock('./client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'heatmap_logs') {
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

describe('Supabase Heatmap DB Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchHeatmapLogs returns heatmap log data', async () => {
    const mockData = [
      { id: 'uuid-1', log_date: '2026-07-13', sessions_success: 1, sessions_failed: 0, total_points: 10 }
    ];
    mockSelect.mockReturnValue({
      eq: () => ({
        order: () => Promise.resolve({ data: mockData, error: null })
      })
    });

    const result = await fetchHeatmapLogs('user-123');

    expect(mockSelect).toHaveBeenCalled();
    expect(result).toEqual(mockData);
  });

  it('updateHeatmapLog updates log if it already exists for today', async () => {
    // Select returns existing log
    mockSelect.mockReturnValue({
      eq: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({
            data: { id: 'log-999', sessions_success: 1, sessions_failed: 0, total_points: 10 },
            error: null
          })
        })
      })
    });

    mockUpdate.mockReturnValue({
      eq: () => Promise.resolve({ error: null })
    });

    const result = await updateHeatmapLog('user-123', 1, 0, 15);

    expect(mockUpdate).toHaveBeenCalledWith({
      sessions_success: 2,
      sessions_failed: 0,
      total_points: 25,
    });
    expect(result).toBe(true);
  });

  it('updateHeatmapLog inserts new log if it does not exist for today', async () => {
    // Select returns no log
    mockSelect.mockReturnValue({
      eq: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null })
        })
      })
    });

    mockInsert.mockReturnValue(Promise.resolve({ error: null }));

    const result = await updateHeatmapLog('user-123', 1, 0, 10);

    expect(mockInsert).toHaveBeenCalledWith({
      user_id: 'user-123',
      log_date: expect.any(String),
      sessions_success: 1,
      sessions_failed: 0,
      total_points: 10,
    });
    expect(result).toBe(true);
  });
});
