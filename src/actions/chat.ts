'use server';

import Anthropic from '@anthropic-ai/sdk';
import { searchTasks } from '@/actions/search';
import { createClient } from '@/lib/supabase/server';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function chat(
  messages: ChatMessage[],
  userMessage: string
): Promise<string> {
  const supabase = await createClient();
  const { data: allTasks } = await supabase.from('tasks').select('*');

  const statusMap: Record<string, string> = {
    todo: 'Por hacer', in_progress: 'En progreso', done: 'Terminado'
  };
  const priorityMap: Record<string, string> = {
    high: 'Alta', medium: 'Media', low: 'Baja'
  };

  const todo = allTasks?.filter(t => t.status === 'todo') ?? [];
  const inProgress = allTasks?.filter(t => t.status === 'in_progress') ?? [];
  const done = allTasks?.filter(t => t.status === 'done') ?? [];

  const summary = `RESUMEN EXACTO (usa esto para conteos y listados):
- Por hacer (${todo.length}): ${todo.map(t => `${t.title} [${priorityMap[t.priority]}]`).join(', ') || 'ninguna'}
- En progreso (${inProgress.length}): ${inProgress.map(t => `${t.title} [${priorityMap[t.priority]}]`).join(', ') || 'ninguna'}
- Terminado (${done.length}): ${done.map(t => `${t.title} [${priorityMap[t.priority]}]`).join(', ') || 'ninguna'}`;

  const results = await searchTasks(userMessage, 0.2, 10).catch(() => []);
  const semanticContext = results.length > 0
    ? '\nDETALLE ADICIONAL:\n' + results.map(r => r.content).join('\n')
    : '';

  const system = `Eres un asistente de productividad para TaskFlow AI.
REGLAS ESTRICTAS:
1. Para conteos y listados SIEMPRE usa el RESUMEN EXACTO, nunca inventes ni estimes.
2. Responde en español, sin markdown, sin **, sin ##.
3. Sé conciso y directo.
4. Si el usuario pregunta cuántas tareas hay, cuenta exactamente las del RESUMEN EXACTO.

${summary}${semanticContext}`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system,
    messages: [
      ...messages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: userMessage },
    ],
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Unexpected response type');
  return block.text;
}
