/**
 * BAD CODE — 6 SOLID violations annotated
 *
 * Simulates a realistic "everything-in-one-hook" pattern common in early
 * Next.js App Router projects. Each violation is labelled with its principle.
 */

'use client';

import { useState, useEffect } from 'react';
// ❌ VIOLATION 1 — DIP: high-level hook imports a low-level concrete server action.
// The hook is now coupled to this specific implementation.
// Fix: accept `onMove: (id: string, status: TaskStatus) => Promise<void>` as a parameter.
import { updateTaskStatus } from '@/actions/tasks';
import { type Task, type TaskStatus } from '@/types/tasks';

// ❌ VIOLATION 2 — OCP: hardcoded status list duplicates KANBAN_COLUMNS.
// Adding a new status (e.g. 'review') requires editing this array AND types/tasks.ts.
// Fix: derive from `KANBAN_COLUMNS.map(c => c.status)` — one place to change.
const VALID_STATUSES = ['todo', 'in_progress', 'done'];

// ❌ VIOLATION 3 — SRP: this hook has THREE responsibilities:
//   (a) manages optimistic task state
//   (b) owns sensor & drag-and-drop event logic
//   (c) calls the server and handles rollback
// Fix: split into useMoveTask (state + server) and useKanbanDnd (sensors + events).
export function useKanbanEverything(initialTasks: Task[]) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  // ❌ VIOLATION 4 — ISP: exposes `rawSensorConfig` which no caller ever uses.
  // Fix: return only what callers need; remove unused members from the return object.
  const [rawSensorConfig] = useState({ distance: 8, delay: 0 });
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  // ❌ VIOLATION 5 — SRP (second offence): side-effect polling inside a hook
  // that is also responsible for drag state. Two reasons to change = two responsibilities.
  // Fix: move polling into a dedicated useTaskPolling hook.
  useEffect(() => {
    const interval = setInterval(async () => {
      const res = await fetch('/api/tasks');
      const fresh = await res.json();
      setTasks(fresh);
    }, 30_000);
    return () => clearInterval(interval);
  }, []);

  async function moveTask(taskId: string, newStatus: string) {
    // ❌ VIOLATION 6 — LSP / TypeScript: `newStatus` is typed as `string` even though
    // the function contract requires a `TaskStatus`. Callers may pass invalid values
    // without a compile-time error, breaking the substitution guarantee.
    // Fix: type the parameter as `TaskStatus` and validate with VALID_STATUSES before use.
    if (!VALID_STATUSES.includes(newStatus)) return;

    const previous = [...tasks];
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus as TaskStatus } : t));
    setLoading(true);

    try {
      await updateTaskStatus(taskId, newStatus as TaskStatus);
    } catch {
      setTasks(previous);
    } finally {
      setLoading(false);
    }
  }

  function handleDragStart(taskId: string) {
    setActiveTask(tasks.find(t => t.id === taskId) ?? null);
  }

  function handleDragEnd(activeId: string, overId: string) {
    setActiveTask(null);
    const task = tasks.find(t => t.id === activeId);
    if (!task) return;
    const newStatus = VALID_STATUSES.includes(overId)
      ? overId
      : tasks.find(t => t.id === overId)?.status ?? task.status;
    void moveTask(activeId, newStatus);
  }

  return {
    tasks,
    activeTask,
    loading,
    rawSensorConfig,  // ← never used by any caller
    moveTask,
    handleDragStart,
    handleDragEnd,
  };
}
