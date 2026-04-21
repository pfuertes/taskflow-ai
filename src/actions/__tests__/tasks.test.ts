import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mocks (must be hoisted before the module under test is imported) ───────────
vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }));
vi.mock('@/lib/embed-task', () => ({
  embedTask: vi.fn().mockResolvedValue(undefined),
  taskToContent: vi.fn((t) => t.title),
}));
vi.mock('@/lib/supabase/server', () => ({ createClient: vi.fn() }));

import { createClient } from '@/lib/supabase/server';
import { embedTask } from '@/lib/embed-task';
import { getTasks, createTask, updateTaskStatus } from '../tasks';
import type { Task } from '@/types/tasks';

// ── Helpers ───────────────────────────────────────────────────────────────────

const USER_ID = 'user-abc';

function makeTask(overrides: Partial<Task> = {}): Task {
  return {
    id: 'task-1',
    user_id: USER_ID,
    title: 'Test task',
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

/**
 * Build a lightweight chainable Supabase query-builder mock.
 * Each method returns `this`; call `.mockResolve(value)` to set the terminal value.
 */
function buildChain(resolvedValue: unknown = { data: null, error: null }) {
  let _resolved = resolvedValue;

  const chain: Record<string, unknown> = {};

  const methods = [
    'select', 'eq', 'order', 'limit',
    'update', 'insert', 'upsert', 'single',
  ] as const;

  for (const m of methods) {
    chain[m] = vi.fn().mockReturnValue(chain);
  }

  // Make the chain await-able
  chain.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
    Promise.resolve(_resolved).then(resolve, reject);

  chain.mockResolve = (v: unknown) => { _resolved = v; return chain; };

  return chain as typeof chain & {
    mockResolve: (v: unknown) => typeof chain;
  } & { [K in (typeof methods)[number]]: ReturnType<typeof vi.fn> };
}

function buildSupabaseMock() {
  const authGetUser = vi.fn();
  const from = vi.fn();

  const supabase = {
    auth: { getUser: authGetUser },
    from,
  };

  return { supabase, authGetUser, from };
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('getTasks', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns tasks for the authenticated user ordered by position', async () => {
    const { supabase, authGetUser, from } = buildSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const tasks = [makeTask({ position: 0 }), makeTask({ id: 'task-2', position: 1 })];
    authGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });

    const chain = buildChain({ data: tasks, error: null });
    from.mockReturnValue(chain);

    const result = await getTasks();

    expect(from).toHaveBeenCalledWith('tasks');
    expect(chain.select).toHaveBeenCalledWith('*');
    expect(chain.eq).toHaveBeenCalledWith('user_id', USER_ID);
    expect(chain.order).toHaveBeenCalledWith('position');
    expect(result).toEqual(tasks);
  });

  it('returns [] when no user is authenticated', async () => {
    const { supabase, authGetUser } = buildSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);
    authGetUser.mockResolvedValue({ data: { user: null } });

    const result = await getTasks();

    expect(result).toEqual([]);
  });

  it('throws when Supabase returns an error', async () => {
    const { supabase, authGetUser, from } = buildSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);
    authGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });

    const chain = buildChain({ data: null, error: { message: 'DB error' } });
    from.mockReturnValue(chain);

    await expect(getTasks()).rejects.toThrow('DB error');
  });
});

describe('createTask', () => {
  beforeEach(() => vi.clearAllMocks());

  it('inserts a task with position 0 when the column is empty', async () => {
    const { supabase, authGetUser, from } = buildSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);
    authGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });

    const newTask = makeTask({ title: 'New task', position: 0 });

    // First from() call: fetch max position → empty column
    const positionChain = buildChain({ data: [], error: null });
    // Second from() call: insert
    const insertChain = buildChain({ data: newTask, error: null });

    from
      .mockReturnValueOnce(positionChain)
      .mockReturnValueOnce(insertChain);

    const result = await createTask({ title: 'New task', priority: 'medium' });

    expect(result).toEqual(newTask);
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        title: 'New task',
        priority: 'medium',
        status: 'todo',
        position: 0,
        user_id: USER_ID,
      })
    );
  });

  it('appends after the last task in the column', async () => {
    const { supabase, authGetUser, from } = buildSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);
    authGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });

    const newTask = makeTask({ title: 'Second task', position: 1 });

    const positionChain = buildChain({ data: [{ position: 0 }], error: null });
    const insertChain = buildChain({ data: newTask, error: null });

    from
      .mockReturnValueOnce(positionChain)
      .mockReturnValueOnce(insertChain);

    const result = await createTask({ title: 'Second task', priority: 'low' });

    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ position: 1 })
    );
    expect(result).toEqual(newTask);
  });

  it('throws when not authenticated', async () => {
    const { supabase, authGetUser } = buildSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);
    authGetUser.mockResolvedValue({ data: { user: null } });

    await expect(
      createTask({ title: 'Task', priority: 'medium' })
    ).rejects.toThrow('No autenticado');
  });

  it('throws when the insert fails', async () => {
    const { supabase, authGetUser, from } = buildSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);
    authGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });

    const positionChain = buildChain({ data: [], error: null });
    const insertChain = buildChain({ data: null, error: { message: 'Insert failed' } });

    from
      .mockReturnValueOnce(positionChain)
      .mockReturnValueOnce(insertChain);

    await expect(
      createTask({ title: 'Task', priority: 'medium' })
    ).rejects.toThrow('Insert failed');
  });

  it('respects an explicit status when provided', async () => {
    const { supabase, authGetUser, from } = buildSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);
    authGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });

    const newTask = makeTask({ status: 'in_progress', position: 0 });
    const positionChain = buildChain({ data: [], error: null });
    const insertChain = buildChain({ data: newTask, error: null });

    from
      .mockReturnValueOnce(positionChain)
      .mockReturnValueOnce(insertChain);

    await createTask({ title: 'Task', priority: 'high', status: 'in_progress' });

    expect(positionChain.eq).toHaveBeenCalledWith('status', 'in_progress');
    expect(insertChain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'in_progress' })
    );
  });
});

describe('updateTaskStatus', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates the status of a task', async () => {
    const { supabase, from } = buildSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const updatedTask = makeTask({ status: 'in_progress' });

    // First from() call: update
    const updateChain = buildChain({ error: null });
    // Second from() call: re-fetch for embedding
    const fetchChain = buildChain({ data: updatedTask, error: null });

    from
      .mockReturnValueOnce(updateChain)
      .mockReturnValueOnce(fetchChain);

    await updateTaskStatus('task-1', 'in_progress');

    expect(updateChain.update).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'in_progress' })
    );
    expect(updateChain.eq).toHaveBeenCalledWith('id', 'task-1');
  });

  it('throws when the update fails', async () => {
    const { supabase, from } = buildSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);

    const updateChain = buildChain({ error: { message: 'Update failed' } });
    from.mockReturnValue(updateChain);

    await expect(updateTaskStatus('task-1', 'done')).rejects.toThrow('Update failed');
  });

  it('swallows embedding errors without rejecting the action', async () => {
    const { supabase, from } = buildSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);
    vi.mocked(embedTask).mockRejectedValueOnce(new Error('embed failed'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const updatedTask = makeTask({ status: 'done' });
    const updateChain = buildChain({ error: null });
    const fetchChain = buildChain({ data: updatedTask, error: null });
    from.mockReturnValueOnce(updateChain).mockReturnValueOnce(fetchChain);

    await updateTaskStatus('task-1', 'done');
    // Let the background catch() callback settle
    await new Promise((r) => setTimeout(r, 0));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error actualizando embedding:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});

describe('createTask — embedding error handling', () => {
  it('swallows createTask embedding errors without rejecting', async () => {
    const { supabase, authGetUser, from } = buildSupabaseMock();
    vi.mocked(createClient).mockResolvedValue(supabase as never);
    authGetUser.mockResolvedValue({ data: { user: { id: USER_ID } } });
    vi.mocked(embedTask).mockRejectedValueOnce(new Error('embed error'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const newTask = makeTask({ title: 'Task', position: 0 });
    const positionChain = buildChain({ data: [], error: null });
    const insertChain = buildChain({ data: newTask, error: null });
    from.mockReturnValueOnce(positionChain).mockReturnValueOnce(insertChain);

    await createTask({ title: 'Task', priority: 'medium' });
    await new Promise((r) => setTimeout(r, 0));

    expect(consoleSpy).toHaveBeenCalledWith(
      'Error creando embedding:',
      expect.any(Error)
    );
    consoleSpy.mockRestore();
  });
});
