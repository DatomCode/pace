import { cn, STATUS_CONFIG } from '@/lib/utils'
import type { TaskStatus } from '@/types'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface TaskStatusBadgeProps {
  status: TaskStatus
  className?: string
}

// ── Component ──────────────────────────────────────────────────────────────────
export function TaskStatusBadge({ status, className }: TaskStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5',
        'text-xs font-medium leading-none whitespace-nowrap',
        cfg.bgColor,
        cfg.color,
        className,
      )}
    >
      <span
        className={cn('size-1.5 rounded-full shrink-0', cfg.dotColor)}
        aria-hidden="true"
      />
      {cfg.label}
    </span>
  )
}

export default TaskStatusBadge
