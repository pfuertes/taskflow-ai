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
import { type Task, type TaskStatus } from '@/types/tasks';

const VALID_STATUSES: TaskStatus[] = ['todo', 'in_progress', 'done'];

interface UseKanbanDndResult {
  sensors: ReturnType<typeof useSensors>;
  activeTask: Task | null;
  handleDragStart: (event: DragStartEvent) => void;
  handleDragEnd: (event: DragEndEvent) => void;
}

export function useKanbanDnd(
  tasks: Task[],
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>
): UseKanbanDndResult {
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  function handleDragStart(event: DragStartEvent) {
    const task = tasks.find((t) => t.id === event.active.id) ?? null;
    setActiveTask(task);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) return;

    const task = tasks.find((t) => t.id === active.id);
    if (!task) return;

    const newStatus: TaskStatus = VALID_STATUSES.includes(over.id as TaskStatus)
      ? (over.id as TaskStatus)
      : (tasks.find((t) => t.id === over.id)?.status ?? task.status);

    if (task.status === newStatus) return;

    void moveTask(task.id, newStatus);
  }

  return { sensors, activeTask, handleDragStart, handleDragEnd };
}
