const VOYAGE_API_KEY = process.env.VOYAGE_API_KEY;

async function embed(texts: string[], inputType: 'document' | 'query'): Promise<number[][]> {
  const response = await fetch('https://api.voyageai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${VOYAGE_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      input: texts,
      model: 'voyage-3.5',
      input_type: inputType,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage AI error: ${error}`);
  }

  const data = await response.json();
  return data.data.map((item: { embedding: number[] }) => item.embedding);
}

export async function embedDocuments(texts: string[]): Promise<number[][]> {
  return embed(texts, 'document');
}

export async function embedQuery(text: string): Promise<number[]> {
  const results = await embed([text], 'query');
  return results[0];
}
