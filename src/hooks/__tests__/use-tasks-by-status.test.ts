import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useTasksByStatus } from '../use-tasks-by-status';
import type { Task } from '@/types/tasks';

function makeTask(overrides: Partial<Task>): Task {
  return {
    id: 'task-1',
    user_id: 'user-1',
    title: 'Test',
    description: null,
    priority: 'medium',
    status: 'todo',
    position: 0,
    due_date: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    ...overrides,
  };
}

describe('useTasksByStatus', () => {
  it('returns empty arrays when there are no tasks', () => {
    const { result } = renderHook(() => useTasksByStatus([]));

    expect(result.current.todo).toEqual([]);
    expect(result.current.in_progress).toEqual([]);
    expect(result.current.done).toEqual([]);
  });

  it('correctly buckets tasks by status', () => {
    const tasks = [
      makeTask({ id: '1', status: 'todo' }),
      makeTask({ id: '2', status: 'in_progress' }),
      makeTask({ id: '3', status: 'done' }),
      makeTask({ id: '4', status: 'todo' }),
    ];

    const { result } = renderHook(() => useTasksByStatus(tasks));

    expect(result.current.todo).toHaveLength(2);
    expect(result.current.in_progress).toHaveLength(1);
    expect(result.current.done).toHaveLength(1);
  });

  it('sorts todo tasks by position ascending', () => {
    const tasks = [
      makeTask({ id: 'b', status: 'todo', position: 2 }),
      makeTask({ id: 'c', status: 'todo', position: 0 }),
      makeTask({ id: 'a', status: 'todo', position: 1 }),
    ];

    const { result } = renderHook(() => useTasksByStatus(tasks));

    expect(result.current.todo.map((t) => t.id)).toEqual(['c', 'a', 'b']);
  });

  it('sorts in_progress tasks by position ascending', () => {
    const tasks = [
      makeTask({ id: 'z', status: 'in_progress', position: 5 }),
      makeTask({ id: 'x', status: 'in_progress', position: 1 }),
      makeTask({ id: 'y', status: 'in_progress', position: 3 }),
    ];

    const { result } = renderHook(() => useTasksByStatus(tasks));

    expect(result.current.in_progress.map((t) => t.id)).toEqual(['x', 'y', 'z']);
  });

  it('sorts done tasks by position ascending', () => {
    const tasks = [
      makeTask({ id: 'p', status: 'done', position: 10 }),
      makeTask({ id: 'n', status: 'done', position: 0 }),
      makeTask({ id: 'o', status: 'done', position: 5 }),
    ];

    const { result } = renderHook(() => useTasksByStatus(tasks));

    expect(result.current.done.map((t) => t.id)).toEqual(['n', 'o', 'p']);
  });

  it('does not bleed tasks between buckets', () => {
    const tasks = [
      makeTask({ id: '1', status: 'todo' }),
      makeTask({ id: '2', status: 'done' }),
    ];

    const { result } = renderHook(() => useTasksByStatus(tasks));

    expect(result.current.in_progress).toHaveLength(0);
    expect(result.current.todo.map((t) => t.id)).toEqual(['1']);
    expect(result.current.done.map((t) => t.id)).toEqual(['2']);
  });

  it('recomputes when the tasks array reference changes', () => {
    const initial = [makeTask({ id: '1', status: 'todo' })];
    const { result, rerender } = renderHook(
      ({ tasks }) => useTasksByStatus(tasks),
      { initialProps: { tasks: initial } }
    );

    expect(result.current.todo).toHaveLength(1);

    const updated = [
      ...initial,
      makeTask({ id: '2', status: 'todo', position: 1 }),
    ];
    rerender({ tasks: updated });

    expect(result.current.todo).toHaveLength(2);
  });

  it('preserves referential equality when tasks do not change', () => {
    const tasks = [makeTask({ id: '1', status: 'todo' })];
    const { result, rerender } = renderHook(
      ({ tasks }) => useTasksByStatus(tasks),
      { initialProps: { tasks } }
    );

    const first = result.current;
    rerender({ tasks });

    expect(result.current).toBe(first);
  });
});
