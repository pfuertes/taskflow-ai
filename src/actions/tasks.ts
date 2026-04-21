"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { type Task, type TaskStatus, type TaskPriority } from "@/types/tasks";
import { embedTask } from '@/lib/embed-task';

export async function updateTaskStatus(taskId: string, newStatus: TaskStatus) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("tasks")
    .update({ status: newStatus, updated_at: new Date().toISOString() })
    .eq("id", taskId);

  if (error) throw new Error(error.message);

  // Auto-embed: actualizar embedding en background sin bloquear
  const { data: task } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', taskId)
    .single();

  if (task) {
    embedTask(task).catch((err) =>
      console.error('Error actualizando embedding:', err)
    );
  }

  revalidatePath("/dashboard");
}

export async function createTask(data: {
  title: string;
  description?: string;
  priority: TaskPriority;
  status?: TaskStatus;
}): Promise<Task> {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('No autenticado');

  // Get max position for the target status column
  const status = data.status ?? 'todo';
  const { data: existing } = await supabase
    .from('tasks')
    .select('position')
    .eq('user_id', user.id)
    .eq('status', status)
    .order('position', { ascending: false })
    .limit(1);

  const position = existing && existing.length > 0 ? existing[0].position + 1 : 0;

  const { data: task, error } = await supabase
    .from('tasks')
    .insert({
      title: data.title,
      description: data.description ?? null,
      priority: data.priority,
      status,
      position,
      user_id: user.id,
    })
    .select('*')
    .single();

  if (error) throw new Error(error.message);

  // Auto-embed in background
  embedTask(task).catch((err) =>
    console.error('Error creando embedding:', err)
  );

  revalidatePath('/dashboard');
  return task;
}

export async function getTasks(): Promise<Task[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("position");

  if (error) throw new Error(error.message);

  return data ?? [];
}
