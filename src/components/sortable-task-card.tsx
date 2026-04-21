'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from '@/components/task-card';
import { type Task } from '@/types/tasks';

interface SortableTaskCardProps {
  task: Task;
  commentsCount?: number;
}

export function SortableTaskCard({ task, commentsCount }: SortableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} commentsCount={commentsCount} isDragging={isDragging} />
    </div>
  );
}
