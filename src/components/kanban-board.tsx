'use client';

import { useMemo } from 'react';
import { DndContext, DragOverlay, closestCorners } from '@dnd-kit/core';
import { KanbanColumn } from '@/components/kanban-column';
import { TaskCard } from '@/components/task-card';
import { useKanbanDnd } from '@/hooks/use-kanban-dnd';
import { useMoveTask } from '@/hooks/use-move-task';
import { useTasksByStatus } from '@/hooks/use-tasks-by-status';
import { type Task, type PriorityFilter, KANBAN_COLUMNS } from '@/types/tasks';

interface KanbanBoardProps {
  initialTasks: Task[];
  searchQuery: string;
  priorityFilter: PriorityFilter;
}

export function KanbanBoard({ initialTasks, searchQuery, priorityFilter }: KanbanBoardProps) {
  const { tasks, moveTask } = useMoveTask(initialTasks);
  const tasksByStatus = useTasksByStatus(tasks);
  const { sensors, activeTask, handleDragStart, handleDragEnd } = useKanbanDnd(tasks, moveTask);

  const visibleTaskIds = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return new Set(
      tasks
        .filter((t) => {
          const matchesSearch = q === '' || t.title.toLowerCase().includes(q);
          const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
          return matchesSearch && matchesPriority;
        })
        .map((t) => t.id)
    );
  }, [tasks, searchQuery, priorityFilter]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {KANBAN_COLUMNS.map((col) => (
          <KanbanColumn
            key={col.status}
            id={col.status}
            label={col.label}
            tasks={tasksByStatus[col.status]}
            visibleTaskIds={visibleTaskIds}
          />
        ))}
      </div>
      <DragOverlay>
        {activeTask && (
          <div className="rotate-3 shadow-2xl">
            <TaskCard task={activeTask} commentsCount={1} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
