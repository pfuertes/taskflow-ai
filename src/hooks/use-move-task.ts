'use client';

import { useState, useEffect } from 'react';
import { updateTaskStatus } from '@/actions/tasks';
import { type Task, type TaskStatus } from '@/types/tasks';

interface UseMoveTaskResult {
  tasks: Task[];
  moveTask: (taskId: string, newStatus: TaskStatus) => Promise<void>;
}

export function useMoveTask(initialTasks: Task[]): UseMoveTaskResult {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  // Sync with server-refreshed data after revalidatePath triggers a router refresh
  useEffect(() => {
    setTasks(initialTasks);
  }, [initialTasks]);

  async function moveTask(taskId: string, newStatus: TaskStatus): Promise<void> {
    const previous = [...tasks];

    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );

    try {
      await updateTaskStatus(taskId, newStatus);
    } catch {
      setTasks(previous);
    }
  }

  return { tasks, moveTask };
}
