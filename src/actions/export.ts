'use server';

import { getTasks } from '@/actions/tasks';
import { createClient } from '@/lib/supabase/server';
import { PRIORITY_CONFIG } from '@/types/tasks';

const STATUS_LABELS: Record<string, string> = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  done: 'Terminado',
};

export interface TaskExportRow {
  ID: string;
  Usuario: string;
  Título: string;
  Descripción: string;
  Prioridad: string;
  Estado: string;
  'Fecha creación': string;
}

export async function exportTasks(): Promise<TaskExportRow[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const email = user?.email ?? '';

  const tasks = await getTasks();

  return tasks.map((task) => ({
    ID: task.id,
    Usuario: email,
    Título: task.title,
    Descripción: task.description ?? '',
    Prioridad: PRIORITY_CONFIG[task.priority].label,
    Estado: STATUS_LABELS[task.status] ?? task.status,
    'Fecha creación': new Date(task.created_at).toLocaleDateString('es-ES'),
  }));
}
