import { Bell, Plus, Search } from 'lucide-react';
import { TaskCard } from '@/components/task-card';
import { type Task, KANBAN_COLUMNS } from '@/types/tasks';

interface KanbanBoardStaticProps {
  tasks: Task[];
  userEmail?: string;
}

export function KanbanBoardStatic({ tasks, userEmail = 'user@email.com' }: KanbanBoardStaticProps) {
  const userInitials = userEmail.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0f0f1a' }}>
      {/* Header */}
      <header className="flex items-center gap-3 px-5 py-3 border-b border-white/10">
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-7 h-7 bg-white/10 border border-white/10 rounded-md flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="w-4 h-4 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9"
              />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">
            TaskFlow{' '}
            <span className="text-neutral-400 font-normal">AI</span>
          </span>
        </div>

        {/* Search */}
        <div className="relative w-64">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-600" />
          <input
            type="text"
            placeholder="Search"
            className="w-full bg-white/5 border border-white/10 rounded-md pl-8 pr-3 py-1.5 text-sm text-neutral-300 placeholder:text-neutral-600 focus:outline-none focus:border-white/20"
          />
        </div>

        <div className="flex-1" />

        {/* New Task button */}
        <button className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 transition-colors text-white text-sm font-semibold px-4 py-1.5 rounded-md">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nueva Tarea
        </button>

        {/* User info */}
        <div className="flex items-center gap-3 shrink-0">
          <span className="text-neutral-400 text-sm">{userEmail}</span>
          <div className="w-7 h-7 rounded-full bg-neutral-600 flex items-center justify-center text-white text-xs font-bold">
            {userInitials}
          </div>
          <button className="text-neutral-400 hover:text-white transition-colors">
            <Bell className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Board */}
      <main className="flex-1 p-5">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {KANBAN_COLUMNS.map((column) => {
            const columnTasks = tasks
              .filter((t) => t.status === column.status)
              .sort((a, b) => a.position - b.position);

            return (
              <div
                key={column.status}
                className="bg-white/[0.04] border border-white/10 rounded-xl p-4 flex flex-col gap-3 shadow-sm"
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-white font-semibold text-sm">{column.label}</h2>
                  {columnTasks.length > 0 && (
                    <span className="bg-white/10 text-neutral-300 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {columnTasks.length}
                    </span>
                  )}
                </div>

                {/* Cards */}
                <div className="flex flex-col gap-2">
                  {columnTasks.map((task) => (
                    <TaskCard key={task.id} task={task} commentsCount={1} />
                  ))}
                </div>

                {columnTasks.length === 0 && (
                  <p className="text-neutral-700 text-xs text-center py-8">Sin tareas</p>
                )}
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
