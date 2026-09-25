import { Loader2, X, Check } from 'lucide-react'
import type { Todo } from '@/types'
import { cn, formatDateTime } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface TodoItemProps {
  todo: Todo
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  isLoading?: boolean
}

// ── Component ──────────────────────────────────────────────────────────────────
function TodoItem({ todo, onToggle, onDelete, isLoading = false }: TodoItemProps) {
  const { id, title, completed, completed_at } = todo

  function handleToggle() {
    if (!isLoading) onToggle(id)
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    if (!isLoading) onDelete(id)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      handleToggle()
    }
  }

  return (
    <div
      className={cn(
        'group flex items-start gap-3 px-4 py-3',
        'border-b border-border-subtle last:border-0',
        'transition-colors duration-150',
        isLoading ? 'opacity-60 pointer-events-none' : 'hover:bg-surface-overlay/50',
      )}
      role="listitem"
    >
      {/* ── Custom checkbox ── */}
      <div
        role="checkbox"
        aria-checked={completed}
        aria-label={completed ? `Mark "${title}" as incomplete` : `Mark "${title}" as complete`}
        tabIndex={isLoading ? -1 : 0}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        className={cn(
          'mt-0.5 shrink-0 size-[18px] rounded-md border-2 flex items-center justify-center',
          'cursor-pointer transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
          completed
            ? 'bg-green-500 border-green-500'
            : 'border-border bg-transparent hover:border-brand-400',
        )}
      >
        {isLoading ? (
          <Loader2 className="size-2.5 animate-spin text-white" aria-hidden="true" />
        ) : completed ? (
          <Check className="size-2.5 text-white" strokeWidth={3} aria-hidden="true" />
        ) : null}
      </div>

      {/* ── Content ── */}
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span
          className={cn(
            'text-sm leading-snug break-words transition-colors duration-150',
            completed
              ? 'line-through text-text-disabled'
              : 'text-text-primary',
          )}
        >
          {title}
        </span>

        {/* Completed timestamp */}
        {completed && completed_at && (
          <span className="text-2xs text-text-muted">
            Done {formatDateTime(completed_at)}
          </span>
        )}
      </div>

      {/* ── Delete button (hover-reveal) ── */}
      <button
        type="button"
        onClick={handleDelete}
        aria-label={`Delete "${title}"`}
        tabIndex={isLoading ? -1 : 0}
        className={cn(
          'shrink-0 mt-0.5 flex items-center justify-center size-6 rounded-md',
          'text-text-muted transition-all duration-150',
          'opacity-0 group-hover:opacity-100 focus-visible:opacity-100',
          'hover:bg-red-500/15 hover:text-red-400',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
        )}
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

export { TodoItem }
export default TodoItem
