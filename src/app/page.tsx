import { Plus } from 'lucide-react';
import { KanbanBoard } from '@/components/kanban-board';
import { type Task } from '@/types/tasks';

const mockTasks: Task[] = [
  {
    id: '1',
    user_id: '1',
    title: 'Diseñar base de datos',
    description: 'Schema con RLS',
    priority: 'high',
    status: 'done',
    position: 1,
    due_date: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: '2',
    user_id: '1',
    title: 'Configurar Supabase',
    description: 'Auth + RLS policies',
    priority: 'high',
    status: 'done',
    position: 2,
    due_date: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: '3',
    user_id: '1',
    title: 'Construir Kanban Board',
    description: 'Drag & drop',
    priority: 'high',
    status: 'in_progress',
    position: 1,
    due_date: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: '4',
    user_id: '1',
    title: 'Implementar RAG',
    description: 'Chat con pgvector',
    priority: 'medium',
    status: 'in_progress',
    position: 2,
    due_date: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: '5',
    user_id: '1',
    title: 'Deploy en Vercel',
    description: 'CI/CD automatizado',
    priority: 'medium',
    status: 'todo',
    position: 1,
    due_date: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: '6',
    user_id: '1',
    title: 'Agregar Dark Mode',
    description: 'Tema oscuro',
    priority: 'low',
    status: 'todo',
    position: 2,
    due_date: null,
    created_at: '',
    updated_at: '',
  },
  {
    id: '7',
    user_id: '1',
    title: 'Tests E2E',
    description: 'Playwright',
    priority: 'medium',
    status: 'todo',
    position: 3,
    due_date: null,
    created_at: '',
    updated_at: '',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0f0f1a]">
      <header className="flex items-center px-5 py-3 border-b border-white/10">
        <span className="text-white font-bold text-sm tracking-tight">
          TaskFlow <span className="text-neutral-400 font-normal">AI</span>
        </span>

        <div className="flex-1" />

        <button className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 transition-colors text-white text-sm font-semibold px-4 py-1.5 rounded-md">
          <Plus className="w-4 h-4" strokeWidth={2.5} />
          Nueva Tarea
        </button>
      </header>

      <main className="flex-1 p-5">
        <KanbanBoard initialTasks={mockTasks} />
      </main>
    </div>
  );
}
