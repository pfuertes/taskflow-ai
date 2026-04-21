'use server';

import { createClient } from '@/lib/supabase/server';
import { embedQuery } from '@/lib/embeddings';

export interface SearchResult {
  task_id: string;
  content: string;
  similarity: number;
}

export async function searchTasks(
  query: string,
  matchThreshold = 0.5,
  matchCount = 5
): Promise<SearchResult[]> {
  const embedding = await embedQuery(query);

  const supabase = await createClient();

  const { data, error } = await supabase.rpc('match_task_embeddings', {
    query_embedding: JSON.stringify(embedding),
    match_threshold: matchThreshold,
    match_count: matchCount,
  });

  if (error) throw new Error(error.message);

  return (data ?? []) as SearchResult[];
}
