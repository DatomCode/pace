import { Clock } from 'lucide-react'
import { cn, formatDate, getTaskDueState, isTaskOverdueCompleted } from '@/lib/utils'
import type { Task } from '@/types'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface DueDateLabelProps {
  task: Task
  className?: string
}

// ── Component ──────────────────────────────────────────────────────────────────
export function DueDateLabel({ task, className }: DueDateLabelProps) {
  if (!task.due_date) return null

  // Completed late: completed but after due date
  if (isTaskOverdueCompleted(task)) {
    return (
      <span
        className={cn('inline-flex items-center gap-1 text-xs text-green-400', className)}
        title={`Completed on ${formatDate(task.completed_at)}`}
      >
        <span className="line-through text-text-muted">{formatDate(task.due_date)}</span>
        <span className="text-green-400 not-italic">· Completed late</span>
      </span>
    )
  }

  const dueState = getTaskDueState(task)

  if (dueState === 'overdue') {
    return (
      <span
        className={cn('inline-flex items-center gap-1 text-xs font-medium text-red-400', className)}
      >
        <Clock className="size-3 shrink-0" aria-hidden="true" />
        Overdue · {formatDate(task.due_date)}
      </span>
    )
  }

  if (dueState === 'due-today') {
    return (
      <span
        className={cn('inline-flex items-center gap-1 text-xs font-medium text-amber-400', className)}
      >
        <Clock className="size-3 shrink-0" aria-hidden="true" />
        Due today
      </span>
    )
  }

  // Upcoming or neutral (completed/cancelled tasks show normal date)
  return (
    <span className={cn('text-xs text-text-muted', className)}>
      {formatDate(task.due_date)}
    </span>
  )
}

export default DueDateLabel
