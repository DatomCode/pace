import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, CheckSquare, Square, ClipboardList } from 'lucide-react'

import { todosApi } from '@/api/todos'
import type { Todo } from '@/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/SkeletonLoader'
import { cn, formatDate } from '@/lib/utils'

// ── Todo row ───────────────────────────────────────────────────────────────────
interface TodoRowProps {
  todo: Todo
  onToggle: (todo: Todo) => void
  onDelete: (id: string) => void
  isToggling: boolean
  isDeleting: boolean
}

function TodoRow({ todo, onToggle, onDelete, isToggling, isDeleting }: TodoRowProps) {
  return (
    <li
      className={cn(
        'group flex items-center gap-3 px-4 py-3',
        'border-b border-border-subtle last:border-0',
        'transition-opacity duration-150',
        (isToggling || isDeleting) && 'opacity-50',
      )}
    >
      {/* Checkbox toggle */}
      <button
        type="button"
        onClick={() => onToggle(todo)}
        disabled={isToggling || isDeleting}
        aria-label={todo.completed ? `Mark "${todo.title}" as incomplete` : `Mark "${todo.title}" as complete`}
        className="shrink-0 text-text-muted hover:text-brand-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded"
      >
        {todo.completed ? (
          <CheckSquare className="size-4.5 text-green-400" aria-hidden="true" />
        ) : (
          <Square className="size-4.5" aria-hidden="true" />
        )}
      </button>

      {/* Title */}
      <span
        className={cn(
          'flex-1 min-w-0 text-sm truncate',
          todo.completed
            ? 'line-through text-text-disabled'
            : 'text-text-primary',
        )}
      >
        {todo.title}
      </span>

      {/* Date */}
      <span className="hidden sm:block text-xs text-text-disabled shrink-0">
        {formatDate(todo.created_at, 'MMM d')}
      </span>

      {/* Delete */}
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        disabled={isToggling || isDeleting}
        aria-label={`Delete "${todo.title}"`}
        className={cn(
          'shrink-0 text-text-disabled hover:text-red-400 transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 rounded',
          'opacity-0 group-hover:opacity-100',
        )}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </button>
    </li>
  )
}

// ── Skeleton rows ──────────────────────────────────────────────────────────────
function TodoSkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <ul aria-busy="true" aria-label="Loading todos…">
      {Array.from({ length: count }).map((_, i) => (
        <li
          key={i}
          className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-0"
          aria-hidden="true"
        >
          <Skeleton className="size-4.5 rounded shrink-0" />
          <Skeleton className="h-3.5 flex-1 rounded max-w-xs" />
          <Skeleton className="h-3 w-12 rounded hidden sm:block" />
          <Skeleton className="size-4 rounded shrink-0" />
        </li>
      ))}
    </ul>
  )
}

// ── Component ──────────────────────────────────────────────────────────────────
export default function TodosPage() {
  const qc = useQueryClient()
  const [newTitle, setNewTitle] = useState('')
  const [toggleLoadingId, setToggleLoadingId] = useState<string | null>(null)
  const [deleteLoadingId, setDeleteLoadingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const { data, isLoading, isError } = useQuery({
    queryKey: ['todos'],
    queryFn: todosApi.list,
  })

  const todos = data?.results ?? []
  const pending = todos.filter((t) => !t.completed)
  const completed = todos.filter((t) => t.completed)

  // ── Create ─────────────────────────────────────────────────────────────────
  const createMutation = useMutation({
    mutationFn: todosApi.create,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['todos'] })
      setNewTitle('')
      inputRef.current?.focus()
    },
  })

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    const title = newTitle.trim()
    if (!title) return
    createMutation.mutate({ title })
  }

  // ── Toggle ─────────────────────────────────────────────────────────────────
  const toggleMutation = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) =>
      todosApi.toggle(id, completed),
    onMutate: ({ id }) => setToggleLoadingId(id),
    onSettled: () => {
      setToggleLoadingId(null)
      qc.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const handleToggle = (todo: Todo) => {
    toggleMutation.mutate({ id: todo.id, completed: !todo.completed })
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteMutation = useMutation({
    mutationFn: todosApi.delete,
    onMutate: (id) => setDeleteLoadingId(id),
    onSettled: () => {
      setDeleteLoadingId(null)
      qc.invalidateQueries({ queryKey: ['todos'] })
    },
  })

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id)
  }

  return (
    <div className="page-container max-w-2xl">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Todos</h1>
          {!isLoading && (
            <p className="mt-0.5 text-sm text-text-muted">
              {pending.length === 0
                ? 'Everything is done!'
                : `${pending.length} pending ${pending.length === 1 ? 'item' : 'items'}`}
            </p>
          )}
        </div>
      </div>

      {/* ── Add todo form ────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleCreate}
        className="flex gap-2 mb-6"
        aria-label="Add a new todo"
      >
        <Input
          ref={inputRef}
          type="text"
          placeholder="Add a new todo…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={createMutation.isPending}
          className="flex-1"
          aria-label="Todo title"
        />
        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={createMutation.isPending}
          disabled={!newTitle.trim() || createMutation.isPending}
          aria-label="Add todo"
        >
          <Plus className="size-4" aria-hidden="true" />
          <span className="hidden sm:inline">Add</span>
        </Button>
      </form>

      {/* ── Error state ─────────────────────────────────────────────────────── */}
      {isError && (
        <div
          role="alert"
          className="p-4 mb-4 rounded-xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
        >
          Failed to load todos. Please refresh the page.
        </div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────────────────── */}
      {isLoading && (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <TodoSkeletonRows count={5} />
        </div>
      )}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!isLoading && todos.length === 0 && (
        <EmptyState
          icon={ClipboardList}
          title="No todos yet"
          description="Add your first todo above to get started."
        />
      )}

      {/* ── Pending section ─────────────────────────────────────────────────── */}
      {!isLoading && pending.length > 0 && (
        <section className="mb-6" aria-label="Pending todos">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-disabled mb-2 px-1">
            Pending · {pending.length}
          </h2>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <ul>
              {pending.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  isToggling={toggleLoadingId === todo.id}
                  isDeleting={deleteLoadingId === todo.id}
                />
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* ── Completed section ────────────────────────────────────────────────── */}
      {!isLoading && completed.length > 0 && (
        <section aria-label="Completed todos">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-disabled mb-2 px-1">
            Completed · {completed.length}
          </h2>
          <div className="bg-surface border border-border rounded-xl overflow-hidden">
            <ul>
              {completed.map((todo) => (
                <TodoRow
                  key={todo.id}
                  todo={todo}
                  onToggle={handleToggle}
                  onDelete={handleDelete}
                  isToggling={toggleLoadingId === todo.id}
                  isDeleting={deleteLoadingId === todo.id}
                />
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  )
}
