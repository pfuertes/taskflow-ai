import { redirect } from 'next/navigation';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getTasks } from '@/actions/tasks';
import { KanbanBoardClient } from '@/components/kanban-board-client';
import { TaskChat } from '@/components/chat/task-chat';
import { NewTaskModal } from '@/components/new-task-modal';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const tasks = await getTasks();

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0f0f1a' }}>
      <header className="flex items-center gap-4 px-5 py-3 border-b border-white/10">
        <span className="text-white font-bold text-sm tracking-tight shrink-0">
          TaskFlow <span className="text-neutral-400 font-normal">AI</span>
        </span>

        <div className="flex-1" />

        <NewTaskModal />

        <div className="flex items-center gap-3 shrink-0">
          <span className="text-neutral-400 text-sm">{user.email}</span>
          <div className="w-7 h-7 rounded-full bg-neutral-600 flex items-center justify-center text-white text-xs font-bold">
            {user.email?.slice(0, 2).toUpperCase()}
          </div>
          <Bell className="w-4 h-4 text-neutral-400" />
        </div>
      </header>

      <main className="flex-1 p-5 flex flex-col md:flex-row gap-6 min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 overflow-x-auto">
          <KanbanBoardClient initialTasks={tasks} />
        </div>

        <div className="w-full md:w-80 shrink-0 flex flex-col gap-3">
          <h2 className="text-white text-sm font-semibold">Tu asistente IA</h2>
          <div className="h-[600px]">
            <TaskChat />
          </div>
        </div>
      </main>
    </div>
  );
}
