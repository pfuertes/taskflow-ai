'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '@/lib/utils';
import { SortableTaskCard } from '@/components/sortable-task-card';
import { type Task, type TaskStatus } from '@/types/tasks';

interface KanbanColumnProps {
  id: TaskStatus;
  label: string;
  tasks: Task[];
}

export function KanbanColumn({ id, label, tasks }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <h2 className="text-white font-semibold text-sm">{label}</h2>
        {tasks.length > 0 && (
          <span className="bg-white/10 text-neutral-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        )}
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={cn(
          'rounded-xl border p-4 min-h-96 flex flex-col gap-2 transition-colors duration-200 shadow-sm',
          isOver
            ? 'border-blue-500/50 bg-blue-500/5'
            : 'border-white/10 bg-white/[0.04]'
        )}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <SortableTaskCard key={task.id} task={task} commentsCount={1} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-neutral-700 text-xs">Suelta aquí</p>
          </div>
        )}
      </div>
    </div>
  );
}
