'use client';

import { useState } from 'react';
import { Search } from 'lucide-react';
import { KanbanBoardClient } from '@/components/kanban-board-client';
import { type Task, type PriorityFilter } from '@/types/tasks';

const PRIORITY_FILTERS: { value: PriorityFilter; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'critical', label: 'CRÍTICA' },
  { value: 'high', label: 'ALTA' },
  { value: 'medium', label: 'MEDIA' },
  { value: 'low', label: 'BAJA' },
];

interface DashboardClientProps {
  initialTasks: Task[];
}

export function DashboardClient({ initialTasks }: DashboardClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('all');

  return (
    <div className="flex-1 min-w-0 flex flex-col gap-4">
      {/* Search and filter bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar tareas..."
            className="w-full pl-9 pr-3 py-1.5 text-sm bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg text-gray-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black/25 dark:focus:border-white/25"
          />
        </div>

        <div className="flex gap-1.5 flex-wrap">
          {PRIORITY_FILTERS.map(({ value, label }) => {
            const isActive = priorityFilter === value;
            return (
              <button
                key={value}
                onClick={() => setPriorityFilter(value)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                  isActive
                    ? 'bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-400'
                    : 'bg-black/5 dark:bg-white/5 border-black/10 dark:border-white/10 text-neutral-600 dark:text-neutral-400 hover:bg-black/10 dark:hover:bg-white/10'
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Kanban board */}
      <div className="overflow-x-auto">
        <KanbanBoardClient
          initialTasks={initialTasks}
          searchQuery={searchQuery}
          priorityFilter={priorityFilter}
        />
      </div>
    </div>
  );
}
