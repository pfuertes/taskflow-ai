'use client';

import dynamic from 'next/dynamic';
import { type Task, type PriorityFilter } from '@/types/tasks';

const KanbanBoard = dynamic(
  () => import('@/components/kanban-board').then(m => ({ default: m.KanbanBoard })),
  { ssr: false }
);

interface Props {
  initialTasks: Task[];
  searchQuery: string;
  priorityFilter: PriorityFilter;
}

export function KanbanBoardClient({ initialTasks, searchQuery, priorityFilter }: Props) {
  return (
    <KanbanBoard
      initialTasks={initialTasks}
      searchQuery={searchQuery}
      priorityFilter={priorityFilter}
    />
  );
}
