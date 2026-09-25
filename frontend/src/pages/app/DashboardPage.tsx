import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  CheckSquare,
  Calendar,
  FolderKanban,
  Sparkles,
  Clock,
  ChevronRight,
  Check,
  X,
} from 'lucide-react'
import { format } from 'date-fns'
import { dashboardApi } from '@/api/dashboard'
import { todosApi } from '@/api/todos'
import { useAuthStore } from '@/store/authStore'
import {
  cn,
  getGreeting,
  formatTime,
  formatCompletionRate,
  formatDate,
} from '@/lib/utils'
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { TaskCard } from '@/components/tasks/TaskCard'
import TaskCreateModal from '@/components/tasks/TaskCreateModal'
import type { Task, Todo, ScheduleEvent } from '@/types'

// -- Helpers -------------------------------------------------------------------
function deduplicateTasks(tasks: Task[]): Task[] {
  const seen = new Set<string>()
  return tasks.filter((t) => {
    if (seen.has(t.id)) return false
    seen.add(t.id)
    return true
  })
}

function SectionHeader({
  title,
  count,
  action,
}: {
  title: string
  count?: number
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-semibold text-text-primary flex items-center gap-2">
        {title}
        {count !== undefined && (
          <span className="text-xs text-text-muted font-normal">({count})</span>
        )}
      </h2>
      {action}
    </div>
  )
}

function GroupLabel({ label, color }: { label: string; color: 'red' | 'blue' | 'amber' | 'muted' }) {
  const colorMap = { red: 'text-red-400', blue: 'text-blue-400', amber: 'text-amber-400', muted: 'text-text-muted' }
  return (
    <p className={cn('text-xs font-semibold uppercase tracking-widest mb-2', colorMap[color])}>{label}</p>
  )
}

function TimelineEvent({ event }: { event: ScheduleEvent }) {
  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center shrink-0 w-16">
        <span className="text-xs text-text-muted tabular-nums">{formatTime(event.start_time)}</span>
        <span className="text-xs text-text-disabled tabular-nums">{formatTime(event.end_time)}</span>
      </div>
      <div className="flex flex-col items-center shrink-0">
        <div className="size-2 rounded-full bg-brand-500 mt-1 ring-2 ring-brand-500/20" />
        <div className="flex-1 w-px bg-border-subtle mt-1" />
      </div>
      <div className="pb-4 min-w-0 flex-1">
        <p className="text-sm font-medium text-text-primary truncate">{event.title}</p>
        {event.task_title && (
          <p className="text-xs text-text-muted mt-0.5 truncate">Task: {event.task_title}</p>
        )}
      </div>
    </div>
  )
}

function TodoRow({ todo, onToggle }: { todo: Todo; onToggle: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2.5 py-1 cursor-pointer group">
      <input
        type="checkbox"
        checked={todo.completed}
        onChange={(e) => onToggle(e.target.checked)}
        className="size-3.5 rounded border-border bg-surface-overlay cursor-pointer shrink-0 accent-brand-500"
      />
      <span className={cn('text-xs leading-snug', todo.completed ? 'line-through text-text-disabled' : 'text-text-secondary group-hover:text-text-primary transition-colors')}>
        {todo.title}
      </span>
    </label>
  )
}

function TodosSidebar({ startAdding }: { startAdding?: boolean }) {
  const queryClient = useQueryClient()
  const [newTodo, setNewTodo] = useState('')
  const [isAdding, setIsAdding] = useState(startAdding ?? false)

  const { data, isLoading } = useQuery({ queryKey: ['todos'], queryFn: todosApi.list })
  const todos = data?.results ?? []
  const pending = todos.filter((t) => !t.completed)
  const completed = todos.filter((t) => t.completed)

  const { mutate: toggleTodo } = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => todosApi.toggle(id, completed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

  const { mutate: createTodo, isPending: isCreating } = useMutation({
    mutationFn: (title: string) => todosApi.create({ title }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['todos'] }); setNewTodo(''); setIsAdding(false) },
  })

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = newTodo.trim()
    if (!trimmed) return
    createTodo(trimmed)
  }

  return (
    <div className="bg-surface border border-border rounded-xl p-4">
      <SectionHeader
        title="Todos"
        count={pending.length}
        action={
          <button type="button" onClick={() => setIsAdding(true)} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 transition-colors">
            <Plus className="size-3" />Add
          </button>
        }
      />
      {isLoading ? (
        <div className="space-y-2">{[1,2,3].map((i) => <div key={i} className="skeleton h-7 rounded-lg" />)}</div>
      ) : (
        <div className="space-y-1">
          {pending.map((todo) => (
            <TodoRow key={todo.id} todo={todo} onToggle={(v) => toggleTodo({ id: todo.id, completed: v })} />
          ))}
          {isAdding && (
            <form onSubmit={handleAdd} className="flex gap-1.5 mt-1">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                placeholder="Add a todo…"
                autoFocus
                className="flex-1 h-7 px-2 rounded-md text-xs bg-surface-overlay border border-border text-text-primary placeholder:text-text-disabled focus:outline-none focus:ring-1 focus:ring-brand-500"
              />
              <button type="submit" disabled={isCreating} className="flex items-center justify-center size-7 rounded-md bg-brand-500 text-white disabled:opacity-50" aria-label="Save">
                <Check className="size-3" />
              </button>
              <button type="button" onClick={() => { setIsAdding(false); setNewTodo('') }} className="flex items-center justify-center size-7 rounded-md text-text-muted hover:bg-surface-overlay" aria-label="Cancel">
                <X className="size-3" />
              </button>
            </form>
          )}
          {pending.length === 0 && !isAdding && (
            <p className="text-xs text-text-muted py-2 text-center">All caught up! ??</p>
          )}
          {completed.length > 0 && (
            <>
              <p className="text-xs text-text-disabled uppercase tracking-widest pt-3 pb-1">Completed</p>
              {completed.slice(0, 3).map((todo) => (
                <TodoRow key={todo.id} todo={todo} onToggle={(v) => toggleTodo({ id: todo.id, completed: v })} />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

function QuickActions({ onAddTask, onAddTodo }: { onAddTask: () => void; onAddTodo: () => void }) {
  const navigate = useNavigate()
  const actions = [
    { label: 'Add Task', icon: CheckSquare, onClick: onAddTask, color: 'text-brand-500 bg-brand-500/10' },
    { label: 'Add Todo', icon: Plus, onClick: onAddTodo, color: 'text-green-400 bg-green-500/10' },
    { label: 'Schedule', icon: Calendar, onClick: () => navigate('/app/schedule'), color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Projects', icon: FolderKanban, onClick: () => navigate('/app/projects'), color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Ask AI', icon: Sparkles, onClick: () => navigate('/app/ai'), color: 'text-purple-400 bg-purple-500/10' },
  ]
  return (
    <div>
      <SectionHeader title="Quick Actions" />
      <div className="grid grid-cols-5 gap-2">
        {actions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-surface hover:bg-surface-elevated transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              <span className={cn('flex items-center justify-center size-8 rounded-lg', action.color)}>
                <Icon className="size-4" aria-hidden="true" />
              </span>
              <span className="text-xs font-medium text-text-secondary text-center leading-tight">{action.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [showTaskCreate, setShowTaskCreate] = useState(false)
  const [showTodoAdd, setShowTodoAdd] = useState(false)
  const queryClient = useQueryClient()

  const { data: dashboard, isLoading, isError } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getData,
    staleTime: 30_000,
  })

  if (isLoading) return <div className="max-w-6xl mx-auto px-4 py-6"><DashboardSkeleton /></div>

  if (isError || !dashboard) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col items-center py-32 text-center">
        <p className="text-text-muted text-sm">Failed to load dashboard.</p>
        <button type="button" onClick={() => queryClient.invalidateQueries({ queryKey: ['dashboard'] })} className="mt-3 text-xs text-brand-500 underline">
          Try again
        </button>
      </div>
    )
  }

  const allTasksRaw = [...dashboard.overdue_tasks, ...dashboard.in_progress_tasks, ...dashboard.today_tasks]
  const allTasks = deduplicateTasks(allTasksRaw)
  const overdueTasks = allTasks.filter((t) => dashboard.overdue_tasks.some((o) => o.id === t.id))
  const inProgressTasks = allTasks.filter((t) => !overdueTasks.includes(t) && t.status === 'in_progress')
  const todayTasks = allTasks.filter((t) => !overdueTasks.includes(t) && !inProgressTasks.includes(t))
  const sortedEvents = [...dashboard.today_events].sort((a, b) => a.start_time.localeCompare(b.start_time))
  const completionRate = dashboard.today_completion_rate ?? 0
  const todayStr = format(new Date(), 'EEEE, MMMM d')

  return (
    <>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">{getGreeting(user?.name ?? 'there')} ??</h1>
          <p className="text-sm text-text-muted mt-0.5">{todayStr}</p>
          <p className="text-sm text-text-secondary mt-1">Here's what needs your attention today.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <SectionHeader title="Today's Progress" />
              <div className="flex items-center justify-between text-sm mb-2">
                <span className="text-text-secondary">
                  <span className="font-semibold text-text-primary">{dashboard.tasks_completed_today}</span>
                  {' '}of{' '}
                  <span className="font-semibold text-text-primary">{dashboard.tasks_due_today}</span>
                  {' '}tasks done today
                </span>
                <span className="text-xs font-semibold text-green-400">{formatCompletionRate(completionRate)}</span>
              </div>
              <ProgressBar value={completionRate} color={completionRate >= 80 ? 'green' : completionRate >= 40 ? 'brand' : 'amber'} />
            </div>

            {/* Tasks */}
            <div>
              <SectionHeader
                title="Today's Tasks"
                count={allTasks.length}
                action={
                  <button type="button" onClick={() => setShowTaskCreate(true)} className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-400 transition-colors">
                    <Plus className="size-3" />Add task
                  </button>
                }
              />
              {allTasks.length === 0 ? (
                <div className="bg-surface border border-border rounded-xl py-12 text-center">
                  <CheckSquare className="size-8 text-text-muted mx-auto mb-3" strokeWidth={1.5} />
                  <p className="text-sm font-medium text-text-primary">No tasks for today</p>
                  <p className="text-xs text-text-muted mt-1">Add a task to get started.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {overdueTasks.length > 0 && (
                    <div>
                      <GroupLabel label="Overdue" color="red" />
                      <div className="space-y-2">{overdueTasks.map((t) => <TaskCard key={t.id} task={t} />)}</div>
                    </div>
                  )}
                  {inProgressTasks.length > 0 && (
                    <div>
                      <GroupLabel label="In Progress" color="blue" />
                      <div className="space-y-2">{inProgressTasks.map((t) => <TaskCard key={t.id} task={t} />)}</div>
                    </div>
                  )}
                  {todayTasks.length > 0 && (
                    <div>
                      <GroupLabel label="Due Today" color="amber" />
                      <div className="space-y-2">{todayTasks.map((t) => <TaskCard key={t.id} task={t} />)}</div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Schedule */}
            <div className="bg-surface border border-border rounded-xl p-4">
              <SectionHeader
                title="Today's Schedule"
                action={
                  <Link to="/app/schedule" className="flex items-center gap-1 text-xs text-text-muted hover:text-text-primary transition-colors">
                    View all<ChevronRight className="size-3" />
                  </Link>
                }
              />
              {sortedEvents.length === 0 ? (
                <div className="flex flex-col items-center py-8 text-center">
                  <Clock className="size-6 text-text-muted mb-2" strokeWidth={1.5} />
                  <p className="text-sm text-text-muted">No events scheduled for today.</p>
                  <Link to="/app/schedule" className="text-xs text-brand-500 hover:text-brand-400 mt-2 underline">Add event</Link>
                </div>
              ) : (
                <div className="mt-2">{sortedEvents.map((e) => <TimelineEvent key={e.id} event={e} />)}</div>
              )}
            </div>

            {/* Quick actions */}
            <QuickActions onAddTask={() => setShowTaskCreate(true)} onAddTodo={() => setShowTodoAdd((v) => !v)} />
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            <TodosSidebar key={showTodoAdd ? 'open' : 'closed'} startAdding={showTodoAdd} />
            <div className="bg-surface border border-border rounded-xl p-4">
              <SectionHeader
                title="Upcoming Events"
                action={<Link to="/app/schedule" className="text-xs text-text-muted hover:text-text-primary transition-colors">See all</Link>}
              />
              {dashboard.upcoming_events.length === 0 ? (
                <p className="text-xs text-text-muted text-center py-4">No upcoming events.</p>
              ) : (
                <div className="space-y-3">
                  {dashboard.upcoming_events.slice(0, 3).map((event) => (
                    <div key={event.id} className="flex gap-3 p-2.5 rounded-lg border border-border-subtle hover:bg-surface-overlay transition-colors">
                      <div className="flex flex-col items-center shrink-0 text-center">
                        <span className="text-xs text-text-muted uppercase">{formatDate(event.date, 'MMM')}</span>
                        <span className="text-lg font-bold text-text-primary leading-none">{formatDate(event.date, 'd')}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-text-primary truncate">{event.title}</p>
                        <p className="text-xs text-text-muted">{formatTime(event.start_time)} – {formatTime(event.end_time)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <TaskCreateModal open={showTaskCreate} onClose={() => setShowTaskCreate(false)} />
    </>
  )
}
