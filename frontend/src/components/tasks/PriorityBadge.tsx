import { cn, PRIORITY_CONFIG } from '@/lib/utils'
import type { TaskPriority } from '@/types'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface PriorityBadgeProps {
  priority: TaskPriority
  className?: string
}

// ── Component ──────────────────────────────────────────────────────────────────
export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const cfg = PRIORITY_CONFIG[priority]

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2 py-0.5',
        'text-xs font-medium leading-none whitespace-nowrap border',
        cfg.bgColor,
        cfg.color,
        cfg.borderColor,
        className,
      )}
    >
      {cfg.label}
    </span>
  )
}

export default PriorityBadge
