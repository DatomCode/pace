import { useState, useRef } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Trash2, Check, ClipboardList } from 'lucide-react'

import { todosApi } from '@/api/todos'
import type { Todo } from '@/types'
import { Skeleton } from '@/components/ui/SkeletonLoader'
import { cn } from '@/lib/utils'

// ── TodoRow (card style) ───────────────────────────────────────────────────────
interface TodoRowProps {
  todo: Todo
  onToggle: (todo: Todo) => void
  onDelete: (id: string) => void
  isToggling: boolean
  isDeleting: boolean
}

function TodoRow({ todo, onToggle, onDelete, isToggling, isDeleting }: TodoRowProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 px-4 py-3',
        'rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border',
        'shadow-sm hover:shadow-md transition-all duration-150',
        (isToggling || isDeleting) && 'opacity-50',
      )}
    >
      {/* Circular checkbox */}
      <button
        type="button"
        onClick={() => onToggle(todo)}
        disabled={isToggling || isDeleting}
        aria-label={todo.completed ? `Mark "${todo.title}" as incomplete` : `Mark "${todo.title}" as complete`}
        className={cn(
          'shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
          todo.completed
            ? 'bg-brand-500 border-brand-500'
            : 'border-gray-300 dark:border-border hover:border-brand-400',
        )}
      >
        {todo.completed && (
          <Check className="w-3 h-3 text-white" strokeWidth={3} aria-hidden="true" />
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

      {/* Delete button — visible on hover */}
      <button
        type="button"
        onClick={() => onDelete(todo.id)}
        disabled={isToggling || isDeleting}
        aria-label={`Delete "${todo.title}"`}
        className={cn(
          'shrink-0 w-6 h-6 flex items-center justify-center rounded-lg',
          'text-text-disabled hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20',
          'transition-all duration-150',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500',
          'opacity-0 group-hover:opacity-100',
        )}
      >
        <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}

// ── Skeleton rows ──────────────────────────────────────────────────────────────
function TodoSkeletonRows({ count = 4 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading todos…" className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border"
          aria-hidden="true"
        >
          <Skeleton className="w-5 h-5 rounded-full shrink-0" />
          <Skeleton className="h-3.5 flex-1 rounded-xl max-w-xs" />
          <Skeleton className="w-4 h-4 rounded shrink-0" />
        </div>
      ))}
    </div>
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
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Todos</h1>
        </div>
        {!isLoading && (
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400">
            {pending.length} pending
          </span>
        )}
      </div>

      {/* ── Add todo form ────────────────────────────────────────────────────── */}
      <form
        onSubmit={handleCreate}
        className="flex gap-2"
        aria-label="Add a new todo"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Add a new todo…"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          disabled={createMutation.isPending}
          aria-label="Todo title"
          className="flex-1 px-4 py-3 rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-surface text-sm focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!newTitle.trim() || createMutation.isPending}
          aria-label="Add todo"
          className={cn(
            'w-12 h-12 rounded-full flex items-center justify-center text-white shrink-0',
            'transition-all hover:scale-105 active:scale-95',
            'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100',
          )}
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
        >
          {createMutation.isPending ? (
            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Plus className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </form>

      {/* ── Error state ─────────────────────────────────────────────────────── */}
      {isError && (
        <div
          role="alert"
          className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400"
        >
          Failed to load todos. Please refresh the page.
        </div>
      )}

      {/* ── Loading skeleton ─────────────────────────────────────────────────── */}
      {isLoading && <TodoSkeletonRows count={5} />}

      {/* ── Empty state ─────────────────────────────────────────────────────── */}
      {!isLoading && todos.length === 0 && (
        <div className="flex flex-col items-center text-center px-6 py-12">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
          >
            <ClipboardList className="w-7 h-7 text-white" strokeWidth={1.5} />
          </div>
          <h3 className="text-base font-bold text-text-primary mb-1.5">No todos yet</h3>
          <p className="text-sm text-text-muted max-w-xs leading-relaxed">
            Add your first todo above to get started.
          </p>
        </div>
      )}

      {/* ── Pending section ─────────────────────────────────────────────────── */}
      {!isLoading && pending.length > 0 && (
        <section aria-label="Pending todos">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-disabled mb-3 px-1">
            Pending · {pending.length}
          </h2>
          <div className="space-y-2">
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
          </div>
        </section>
      )}

      {/* ── Completed section ────────────────────────────────────────────────── */}
      {!isLoading && completed.length > 0 && (
        <section aria-label="Completed todos">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-text-disabled mb-3 px-1">
            Completed · {completed.length}
          </h2>
          <div className="space-y-2">
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
          </div>
        </section>
      )}

      {/* ── FAB (mobile) ────────────────────────────────────────────────────── */}
      <button
        onClick={() => {
          inputRef.current?.focus()
          inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }}
        aria-label="Add new todo"
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg z-30 transition-transform hover:scale-105 active:scale-95 md:hidden"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  )
}
