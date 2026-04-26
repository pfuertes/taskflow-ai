import { redirect } from 'next/navigation';
import { Bell } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { getTasks } from '@/actions/tasks';
import { KanbanBoardClient } from '@/components/kanban-board-client';
import { TaskChat } from '@/components/chat/task-chat';
import { Kanban } from 'lucide-react';
import { NewTaskModal } from '@/components/new-task-modal';
import { ThemeToggle } from '@/components/theme-toggle';

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const tasks = await getTasks();

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 dark:bg-[#0f0f1a]">
      <header className="flex items-center gap-4 px-5 py-3 border-b border-black/10 dark:border-white/10">
        <div className="flex items-center gap-2 shrink-0">
          <Kanban className="h-5 w-5 text-green-400" />
          <span className="font-bold text-xl text-gray-900 dark:text-white">TaskFlow</span>
          <span className="font-bold text-xl text-green-400">AI</span>
        </div>

        <div className="flex-1" />

        <NewTaskModal />

        <ThemeToggle />

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
          <h2 className="text-gray-900 dark:text-white text-sm font-semibold">Tu asistente IA</h2>
          <div className="h-[600px]">
            <TaskChat />
          </div>
        </div>
      </main>
    </div>
  );
}
