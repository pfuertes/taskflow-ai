'use client';

import { useState, useRef } from 'react';
import { X, Plus } from 'lucide-react';
import { createTask } from '@/actions/tasks';
import { type TaskPriority, PRIORITY_CONFIG } from '@/types/tasks';

export function NewTaskModal() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const priority = formData.get('priority') as TaskPriority;

    try {
      await createTask({ title, description: description || undefined, priority });
      setOpen(false);
      formRef.current?.reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la tarea');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 bg-green-500 hover:bg-green-600 transition-colors text-white text-sm font-semibold px-4 py-1.5 rounded-md"
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Nueva Tarea
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#1a1a2e] border border-black/10 dark:border-white/10 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-gray-900 dark:text-white font-semibold text-base">Nueva Tarea</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label htmlFor="title" className="text-neutral-400 text-xs font-medium">
                  Título *
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="¿En qué estás trabajando?"
                  className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black/25 dark:focus:border-white/25"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="description" className="text-neutral-400 text-xs font-medium">
                  Descripción
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  placeholder="Detalles opcionales..."
                  className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white placeholder:text-neutral-500 focus:outline-none focus:border-black/25 dark:focus:border-white/25 resize-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="priority" className="text-neutral-400 text-xs font-medium">
                  Prioridad
                </label>
                <select
                  id="priority"
                  name="priority"
                  defaultValue="medium"
                  className="bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:border-black/25 dark:focus:border-white/25 appearance-none cursor-pointer"
                >
                  {(Object.entries(PRIORITY_CONFIG) as [TaskPriority, { label: string }][]).map(
                    ([value, { label }]) => (
                      <option key={value} value={value} className="bg-white dark:bg-[#1a1a2e]">
                        {label}
                      </option>
                    )
                  )}
                </select>
              </div>

              {error && (
                <p className="text-red-400 text-xs bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <div className="flex gap-3 mt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors text-neutral-600 dark:text-neutral-300 text-sm font-medium py-2 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-green-500 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white text-sm font-semibold py-2 rounded-lg"
                >
                  {loading ? 'Creando...' : 'Crear Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
