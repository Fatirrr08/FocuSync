import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  fetchSessionTasks,
  createSessionTask,
  completeSessionTask,
  deleteSessionTask
} from './tasks';

const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();

vi.mock('./client', () => ({
  supabase: {
    from: (table: string) => {
      if (table === 'tasks') {
        return {
          select: mockSelect,
          insert: mockInsert,
          update: mockUpdate,
          delete: mockDelete,
        };
      }
      return {};
    },
  },
}));

describe('Supabase Tasks DB Helpers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetchSessionTasks retrieves tasks for session', async () => {
    const mockTasks = [
      { id: 'uuid-1', title: 'Task 1', is_done: false }
    ];
    mockSelect.mockReturnValue({
      eq: () => ({
        order: () => Promise.resolve({ data: mockTasks, error: null })
      })
    });

    const result = await fetchSessionTasks('session-123');

    expect(mockSelect).toHaveBeenCalled();
    expect(result).toEqual(mockTasks);
  });

  it('createSessionTask inserts a new task', async () => {
    mockInsert.mockReturnValue({
      select: () => ({
        single: () => Promise.resolve({ data: { id: 'task-123' }, error: null })
      })
    });

    await createSessionTask('session-123', 'My homework', 20);

    expect(mockInsert).toHaveBeenCalledWith({
      session_id: 'session-123',
      title: 'My homework',
      planned_duration_minutes: 20,
      is_done: false,
    });
  });

  it('completeSessionTask marks a task completed', async () => {
    mockUpdate.mockReturnValue({
      eq: () => Promise.resolve({ error: null })
    });

    await completeSessionTask('task-123', 12, 10);

    expect(mockUpdate).toHaveBeenCalledWith({
      is_done: true,
      actual_duration_minutes: 12,
      points_awarded: 10,
    });
  });

  it('deleteSessionTask deletes task by id', async () => {
    mockDelete.mockReturnValue({
      eq: () => Promise.resolve({ error: null })
    });

    await deleteSessionTask('task-123');

    expect(mockDelete).toHaveBeenCalled();
  });
});
