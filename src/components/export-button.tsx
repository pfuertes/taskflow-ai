'use client';

import { useState } from 'react';
import * as XLSX from 'xlsx';
import { Download, Loader2 } from 'lucide-react';
import { exportTasks } from '@/actions/export';

export function ExportButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    try {
      const data = await exportTasks();
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Tareas');
      const fecha = new Date().toISOString().split('T')[0];
      XLSX.writeFile(wb, `taskflow-${fecha}.xlsx`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-1.5 rounded-lg px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/20 text-neutral-400 text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      Exportar
    </button>
  );
}
