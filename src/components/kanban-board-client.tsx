'use client';

import dynamic from 'next/dynamic';
import { type Task } from '@/types/tasks';

const KanbanBoard = dynamic(
  () => import('@/components/kanban-board').then(m => ({ default: m.KanbanBoard })),
  { ssr: false }
);

interface Props {
  initialTasks: Task[];
}

export function KanbanBoardClient({ initialTasks }: Props) {
  return <KanbanBoard initialTasks={initialTasks} />;
}
