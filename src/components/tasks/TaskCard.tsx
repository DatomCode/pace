import { useState, useRef, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  CheckCircle2,
  Circle,
  XCircle,
  MoreHorizontal,
  Clock,
  Folder,
  Timer,
} from 'lucide-react'
import { cn, STATUS_CONFIG, getAllowedTransitions, formatDuration } from '@/lib/utils'
import { tasksApi } from '@/api/tasks'
import type { Task, TaskStatus } from '@/types'
import { PriorityBadge } from './PriorityBadge'
import { DueDateLabel } from './DueDateLabel'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface TaskCardProps {
  task: Task
  onClick?: () => void
  compact?: boolean
}

// ── Status icon helper ─────────────────────────────────────────────────────────
function StatusIcon({ status }: { status: TaskStatus }) {
  if (status === 'completed') {
    return <CheckCircle2 className="size-4 text-green-400 shrink-0" aria-hidden="true" />
  }
  if (status === 'cancelled') {
    return <XCircle className="size-4 text-text-disabled shrink-0" aria-hidden="true" />
  }
  if (status === 'in_progress') {
    return (
      <Circle className="size-4 text-blue-400 shrink-0 fill-blue-400/20" aria-hidden="true" />
    )
  }
  return <Circle className="size-4 text-text-muted shrink-0" aria-hidden="true" />
}

// ── Action menu ────────────────────────────────────────────────────────────────
interface ActionMenuProps {
  task: Task
  onTransition: (status: TaskStatus) => void
  isLoading: boolean
}

function ActionMenu({ task, onTransition, isLoading }: ActionMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const transitions = getAllowedTransitions(task.status)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (transitions.length === 0) return null

  return (
    <div ref={menuRef} className="relative shrink-0">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        disabled={isLoading}
        className={cn(
          'flex items-center justify-center size-6 rounded-md',
          'text-text-muted hover:text-text-primary hover:bg-surface-overlay',
          'transition-colors duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
        aria-label="Task actions"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreHorizontal className="size-4" aria-hidden="true" />
      </button>

      {open && (
        <div
          role="menu"
          className={cn(
            'absolute right-0 top-full mt-1 z-20',
            'min-w-[160px] py-1',
            'bg-surface-elevated border border-border rounded-xl shadow-strong',
            'animate-fade-in',
          )}
        >
          {transitions.map((toStatus) => {
            const cfg = STATUS_CONFIG[toStatus]
            return (
              <button
                key={toStatus}
                role="menuitem"
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  onTransition(toStatus)
                  setOpen(false)
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-sm text-left',
                  'text-text-secondary hover:text-text-primary hover:bg-surface-overlay',
                  'transition-colors duration-100',
                  'focus-visible:outline-none focus-visible:bg-surface-overlay',
                )}
              >
                <span className={cn('size-1.5 rounded-full shrink-0', cfg.dotColor)} aria-hidden="true" />
                Mark as {cfg.label}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function TaskCard({ task, onClick, compact = false }: TaskCardProps) {
  const queryClient = useQueryClient()

  const { mutate: updateStatus, isPending } = useMutation({
    mutationFn: (status: TaskStatus) => tasksApi.updateStatus(task.id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  const isCompleted = task.status === 'completed'
  const isCancelled = task.status === 'cancelled'
  const isDimmed = isCompleted || isCancelled

  // Clicking the status icon cycles to the first allowed transition
  function handleStatusClick(e: React.MouseEvent) {
    e.stopPropagation()
    const [next] = getAllowedTransitions(task.status)
    if (next) updateStatus(next)
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onClick?.()
        }
      }}
      aria-label={`Task: ${task.title}`}
      className={cn(
        'group flex items-start gap-3 w-full text-left',
        'bg-surface border border-border rounded-xl',
        'transition-all duration-150',
        'hover:border-border hover:bg-surface-elevated',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        'cursor-pointer',
        compact ? 'px-3 py-2.5' : 'px-4 py-3',
      )}
    >
      {/* Status toggle button */}
      <button
        type="button"
        onClick={handleStatusClick}
        disabled={isPending}
        className={cn(
          'mt-0.5 shrink-0 transition-transform duration-150',
          'hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-full',
          'disabled:opacity-50 disabled:cursor-not-allowed',
        )}
        aria-label={`Toggle status (currently ${STATUS_CONFIG[task.status].label})`}
      >
        <StatusIcon status={task.status} />
      </button>

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {/* Title row */}
        <p
          className={cn(
            'text-sm font-medium leading-snug truncate',
            isDimmed ? 'text-text-muted line-through' : 'text-text-primary',
          )}
        >
          {task.title}
        </p>

        {/* Meta row */}
        {!compact && (
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            {task.project_name && (
              <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                <Folder className="size-3 shrink-0" aria-hidden="true" />
                {task.project_name}
              </span>
            )}
            <DueDateLabel task={task} />
            {task.estimated_duration && (
              <span className="inline-flex items-center gap-1 text-xs text-text-muted">
                <Timer className="size-3 shrink-0" aria-hidden="true" />
                {formatDuration(task.estimated_duration)}
              </span>
            )}
          </div>
        )}

        {compact && (
          <div className="flex items-center gap-2">
            <DueDateLabel task={task} />
          </div>
        )}
      </div>

      {/* Right side badges + menu */}
      <div
        className="flex items-center gap-2 shrink-0 mt-0.5"
        onClick={(e) => e.stopPropagation()}
      >
        <PriorityBadge priority={task.priority} />
        <ActionMenu task={task} onTransition={updateStatus} isLoading={isPending} />
      </div>
    </div>
  )
}

export default TaskCard
