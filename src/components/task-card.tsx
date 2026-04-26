import { CheckCircle2, GripVertical, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { type Task, PRIORITY_CONFIG } from '@/types/tasks';

const AVATAR_COLORS = [
  'bg-violet-500',
  'bg-blue-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-pink-500',
  'bg-indigo-500',
];

function avatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = (hash * 31 + userId.charCodeAt(i)) >>> 0;
  }
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function userInitials(userId: string): string {
  return userId.slice(0, 2).toUpperCase();
}

interface TaskCardProps {
  task: Task;
  commentsCount?: number;
  isDragging?: boolean;
  isVisible?: boolean;
}

export function TaskCard({ task, commentsCount = 0, isDragging = false, isVisible = true }: TaskCardProps) {
  const priority = PRIORITY_CONFIG[task.priority];
  const isDone = task.status === 'done';
  const metaTime = task.status === 'done'
    ? 'Terminado'
    : task.status === 'in_progress'
    ? 'En curso'
    : 'Por hacer';

  return (
    <div
      className={cn(
        'bg-white dark:bg-[#1a1a2e] border border-black/10 dark:border-white/[0.08] rounded-lg p-4 flex gap-2.5 transition-all duration-200 hover:border-black/20 dark:hover:border-white/20',
        isDragging && 'opacity-50 rotate-2 shadow-xl scale-105',
        !isVisible && 'opacity-0 scale-95 pointer-events-none'
      )}
    >
      {/* Grip */}
      <div className="shrink-0 mt-0.5 cursor-grab active:cursor-grabbing">
        <GripVertical className="w-3.5 h-3.5 text-neutral-600" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        {/* Title row */}
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">{task.title}</p>
          {isDone && (
            <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
          )}
        </div>

        {/* Priority badge */}
        <div>
          <span
            className={cn(
              'inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide',
              priority.className
            )}
          >
            {priority.label}
          </span>
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between mt-0.5">
          <div className="flex items-center gap-2">
            <div
              className={cn(
                'w-5 h-5 rounded-full flex items-center justify-center text-white text-[9px] font-bold shrink-0',
                avatarColor(task.user_id)
              )}
            >
              {userInitials(task.user_id)}
            </div>
            <div className="flex items-center gap-1 text-neutral-500">
              <MessageSquare className="w-3 h-3" />
              <span className="text-xs">{commentsCount}</span>
            </div>
          </div>
          <span className="text-neutral-500 text-xs">{metaTime}</span>
        </div>
      </div>
    </div>
  );
}
