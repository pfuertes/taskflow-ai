'use client';

import { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { chat, type ChatMessage } from '@/actions/chat';

export function TaskChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setInput('');
    setLoading(true);

    const userMsg: ChatMessage = { role: 'user', content: text };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const reply = await chat(messages, text);
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'Error al procesar la consulta. Intenta de nuevo.' },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
      <div className="px-4 py-3 border-b border-white/10">
        <span className="text-white text-sm font-semibold">Chat con tus tareas</span>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-neutral-500 text-sm text-center mt-8">
            Pregunta sobre tus tareas...
          </p>
        )}

        {messages.map((msg, i) => (
          <div
            key={i}
            className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
              msg.role === 'user'
                ? 'self-end bg-green-500/20 text-green-100'
                : 'self-start bg-white/10 text-neutral-200'
            }`}
          >
            {msg.content}
          </div>
        ))}

        {loading && (
          <div className="self-start bg-white/10 px-3 py-2 rounded-xl">
            <span className="text-neutral-400 text-sm animate-pulse">Pensando...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="px-4 py-3 border-t border-white/10 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ej: ¿Qué tareas tengo pendientes de alta prioridad?"
          disabled={loading}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-neutral-600 focus:outline-none focus:border-white/25 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-green-500 hover:bg-green-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-white p-2 rounded-lg"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
