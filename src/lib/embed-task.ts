import { createClient } from '@/lib/supabase/server';
import { embedDocuments } from '@/lib/embeddings';
import { type Task } from '@/types/tasks';

const statusMap: Record<string, string> = {
  todo: 'Por hacer',
  in_progress: 'En progreso',
  done: 'Terminado',
};

const priorityMap: Record<string, string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

export function taskToContent(task: Task): string {
  const parts = [task.title];
  if (task.description) parts.push(task.description);
  parts.push(`Prioridad: ${priorityMap[task.priority] ?? task.priority}`);
  parts.push(`Estado: ${statusMap[task.status] ?? task.status}`);
  return parts.join('. ');
}

export async function embedTask(task: Task): Promise<void> {
  const content = taskToContent(task);
  const [embedding] = await embedDocuments([content]);

  const supabase = await createClient();

  await supabase.from('task_embeddings').upsert(
    {
      task_id: task.id,
      user_id: task.user_id,
      content,
      embedding: JSON.stringify(embedding),
    },
    { onConflict: 'task_id' }
  );
}
