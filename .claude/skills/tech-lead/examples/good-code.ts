/**
 * GOOD CODE — corrected version with dependency injection
 *
 * The three responsibilities from bad-code.ts are split across three focused
 * hooks. Each is independently testable by swapping injected dependencies.
 */

'use client';

import { useState } from 'react';
import {
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { type Task, type TaskStatus, KANBAN_COLUMNS } from '@/types/tasks';

// ✅ DIP: derive valid statuses from the single source of truth — KANBAN_COLUMNS.
// Adding a new column requires no change here.
const VALID_STATUSES = new Set(KANBAN_COLUMNS.map(c => c.status));

// ---------------------------------------------------------------------------
// Hook 1 — SRP: manages optimistic state + server sync only.
// ✅ DIP: accepts `onMove` callback instead of importing updateTaskStatus directly.
//         In tests, pass a jest.fn() — no module mocking needed.
// ---------------------------------------------------------------------------

type MoveTaskFn = (id: string, status: TaskStatus) => Promise<void>;

interface UseMoveTaskResult {
  tasks: Task[];
  moveTask: MoveTaskFn;
}

export function useMoveTask(
  initialTasks: Task[],
  // ✅ DIP: dependency injected, not hard-imported
  onMove: MoveTaskFn,
): UseMoveTaskResult {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  async function moveTask(taskId: string, newStatus: TaskStatus): Promise<void> {
    const previous = [...tasks];

    // optimistic update
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await onMove(taskId, newStatus);
    } catch {
      setTasks(previous); // rollback
    }
  }

  return { tasks, moveTask };
}

// ---------------------------------------------------------------------------
// Hook 2 — SRP: manages DnD sensors + drag event logic only.
// ✅ DIP: `moveTask` is injected — hook has no knowledge of server actions.
// ✅ OCP: uses VALID_STATUSES derived from KANBAN_COLUMNS, not a hardcoded list.
// ---------------------------------------------------------------------------

interface UseKanbanDndResult {
  sensors: ReturnType<typeof useSensors>;
  activeTask: Task | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export function useKanbanDnd(
  tasks: Task[],
  moveTask: MoveTaskFn,
): UseKanbanDndResult {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragStart(event: DragStartEvent): void {
    setActiveTask(tasks.find(t => t.id === event.active.id) ?? null);
  }

  function handleDragEnd(event: DragEndEvent): void {
    const { active, over } = event;
    setActiveTask(null);
    if (!over) return;

    const task = tasks.find(t => t.id === active.id);
    if (!task) return;

    // ✅ OCP: VALID_STATUSES comes from KANBAN_COLUMNS, no hardcoded array
    const overId = over.id as string;
    const newStatus: TaskStatus = VALID_STATUSES.has(overId as TaskStatus)
      ? (overId as TaskStatus)
      : (tasks.find(t => t.id === overId)?.status ?? task.status);

    if (task.status === newStatus) return;
    void moveTask(task.id, newStatus);
  }

  return { sensors, activeTask, handleDragStart, handleDragEnd };
}

// ---------------------------------------------------------------------------
// Hook 3 — SRP: polling concern isolated. Can be added/removed independently.
// (Not present in bad-code — shown here as the correct place for it.)
// ---------------------------------------------------------------------------

// ✅ SRP: a dedicated hook for the single concern of keeping tasks fresh.
// Callers opt in; it doesn't pollute useMoveTask or useKanbanDnd.
export function useTaskPolling(
  intervalMs: number,
  onRefresh: () => Promise<void>,
): void {
  // useEffect with cleanup — separated from drag state and server mutation
  // (implementation omitted for brevity; the key point is the separation)
}

// ---------------------------------------------------------------------------
// ISP note: each hook's return type exposes only what callers need.
// No rawSensorConfig, no loading flags unrelated to the hook's concern.
// ---------------------------------------------------------------------------
