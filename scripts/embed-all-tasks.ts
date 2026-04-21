import { config } from 'dotenv';
import { resolve } from 'path';
config({ path: resolve(process.cwd(), '.env.local') });

import { createClient } from '@supabase/supabase-js';
import { type Task } from '../src/types/tasks';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

function taskToContent(task: Task): string {
  const parts = [task.title];
  if (task.description) parts.push(task.description);
  parts.push(`Prioridad: ${task.priority}`);
  parts.push(`Estado: ${task.status}`);
  return parts.join('. ');
}

async function embedDocuments(texts: string[]): Promise<number[][]> {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: texts,
      model: 'voyage-3.5',
      input_type: 'document',
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI error: ${error}`);
  }

  const data = await response.json();
  return data.data.map((item: { embedding: number[] }) => item.embedding);
}

async function embedBatch(tasks: Task[]): Promise<void> {
  const contents = tasks.map(taskToContent);
  const embeddings = await embedDocuments(contents);

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i];

    const { error: deleteError } = await supabase
      .from('task_embeddings')
      .delete()
      .eq('task_id', task.id);

    if (deleteError) throw new Error(deleteError.message);

    const { error: insertError } = await supabase.from('task_embeddings').insert({
      task_id: task.id,
      user_id: task.user_id,
      content: contents[i],
      embedding: JSON.stringify(embeddings[i]),
    });

    if (insertError) throw new Error(insertError.message);
  }
}

async function main() {
  const { data: taskIds } = await supabase.from('tasks').select('id');
  const validIds = taskIds?.map(t => t.id) ?? [];

  if (validIds.length > 0) {
    await supabase
      .from('task_embeddings')
      .delete()
      .not('task_id', 'in', `(${validIds.join(',')})`);
  }

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .order('created_at');

  if (error) throw new Error(error.message);
  if (!tasks || tasks.length === 0) {
    console.log('No tasks found.');
    return;
  }

  console.log(`Embedding ${tasks.length} tasks...`);

  const BATCH_SIZE = 50;
  for (let i = 0; i < tasks.length; i += BATCH_SIZE) {
    const batch = tasks.slice(i, i + BATCH_SIZE);
    await embedBatch(batch as Task[]);
    console.log(`  ${Math.min(i + BATCH_SIZE, tasks.length)}/${tasks.length} done`);
  }

  console.log('All tasks embedded.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
