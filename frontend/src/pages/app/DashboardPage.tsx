import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Plus,
  CheckSquare,
  Calendar,
  FolderKanban,
  Sparkles,
  ArrowRight,
  Clock,
  Check,
  X,
  ChevronRight,
} from 'lucide-react'
import { format } from 'date-fns'
import { dashboardApi } from '@/api/dashboard'
import { todosApi } from '@/api/todos'
import { useAuthStore } from '@/store/authStore'
import {
  cn,
  getGreeting,
  formatTime,
  formatDate,
} from '@/lib/utils'
import { DashboardSkeleton } from '@/components/ui/SkeletonLoader'
import { TaskCard } from '@/components/tasks/TaskCard'
import TaskCreateModal from '@/components/tasks/TaskCreateModal'
import type { Task, Todo } from '@/types'

// -- Helpers -------------------------------------------------------------------
function deduplicateTasks(tasks: Task[]): Task[] {
  const seen = new Set<string>()
  return tasks.filter((t) => {
    if (seen.has(t.id)) return false
    seen.add(t.id)
    return true
  })
}

// Circular progress donut
function DonutProgress({ value, size = 80 }: { value: number; size?: number }) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
      <circle
        cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="white" strokeWidth="8"
        strokeDasharray={circ} strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

// Status pill
function StatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    completed: { label: 'Done', cls: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' },
    in_progress: { label: 'In Progress', cls: 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400' },
    todo: { label: 'To-do', cls: 'bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-white/60' },
    cancelled: { label: 'Cancelled', cls: 'bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400' },
  }
  const cfg = map[status] ?? map.todo
  return (
    <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', cfg.cls)}>
      {cfg.label}
    </span>
  )
}

// Compact task row for dashboard list
function TaskRow({ task }: { task: Task }) {
  const navigate = useNavigate()
  return (
    <button
      onClick={() => navigate('/app/tasks')}
      className="w-full text-left p-4 rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border hover:shadow-md transition-all group"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {task.project_name && (
            <p className="text-[11px] font-semibold text-brand-500 mb-1 uppercase tracking-wide">{task.project_name}</p>
          )}
          <p className={cn(
            'font-semibold text-sm text-text-primary leading-snug',
            task.status === 'completed' && 'line-through text-text-muted'
          )}>
            {task.title}
          </p>
          {task.due_date && (
            <p className="flex items-center gap-1 mt-1.5 text-[11px] text-text-muted">
              <Clock className="w-3 h-3" />
              {formatDate(task.due_date)}
            </p>
          )}
        </div>
        <div className="flex flex-col items-end gap-2 shrink-0">
          <div className={cn(
            'w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold',
            task.priority === 'urgent' ? 'bg-red-500' :
            task.priority === 'high' ? 'bg-amber-500' :
            task.priority === 'medium' ? 'bg-brand-500' : 'bg-gray-400'
          )}>
            {task.priority[0].toUpperCase()}
          </div>
          <StatusPill status={task.status} />
        </div>
      </div>
    </button>
  )
}

// Todo item compact
function TodoItem({ todo, onToggle, onDelete }: { todo: Todo; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-white dark:bg-surface border border-gray-100 dark:border-border group">
      <button
        onClick={onToggle}
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
          todo.completed
            ? 'border-brand-500 bg-brand-500'
            : 'border-gray-300 dark:border-border hover:border-brand-500'
        )}
      >
        {todo.completed && <Check className="w-3 h-3 text-white" />}
      </button>
      <span className={cn(
        'flex-1 text-sm text-text-primary',
        todo.completed && 'line-through text-text-muted'
      )}>
        {todo.title}
      </span>
      <button onClick={onDelete} className="opacity-0 group-hover:opacity-100 p-1 rounded text-text-disabled hover:text-red-400 transition-all">
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

// Quick action pill
function QuickActionPill({
  label, icon: Icon, color, onClick
}: { label: string; icon: React.ElementType; color: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-surface hover:shadow-md transition-all text-sm font-medium text-text-primary"
    >
      <span className={cn('w-6 h-6 rounded-lg flex items-center justify-center', color)}>
        <Icon className="w-3.5 h-3.5 text-white" />
      </span>
      {label}
    </button>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [newTodo, setNewTodo] = useState('')

  const { data: dashboard, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getData,
  })

  const { data: todoData } = useQuery({
    queryKey: ['todos'],
    queryFn: todosApi.list,
  })

  const { mutate: toggleTodo } = useMutation({
    mutationFn: ({ id, completed }: { id: string; completed: boolean }) => todosApi.toggle(id, completed),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

  const { mutate: deleteTodo } = useMutation({
    mutationFn: (id: string) => todosApi.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })

  const { mutate: createTodo } = useMutation({
    mutationFn: (title: string) => todosApi.create({ title }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['todos'] }); setNewTodo('') },
  })

  if (isLoading) return <DashboardSkeleton />

  if (isError || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center min-h-64 gap-4 text-center p-8">
        <p className="text-text-muted">Could not load your dashboard.</p>
        <button onClick={() => refetch()} className="text-sm text-brand-500 font-medium">Try again</button>
      </div>
    )
  }

  const todos = todoData?.results ?? []
  const pendingTodos = todos.filter((t) => !t.completed)
  const allTasksRaw = [...dashboard.overdue_tasks, ...dashboard.in_progress_tasks, ...dashboard.today_tasks]
  const allTasks = deduplicateTasks(allTasksRaw)
  const overdueTasks = allTasks.filter((t) => dashboard.overdue_tasks.some((o) => o.id === t.id))
  const inProgressTasks = allTasks.filter((t) => !overdueTasks.includes(t) && t.status === 'in_progress')
  const todayTasks = allTasks.filter((t) => !overdueTasks.includes(t) && !inProgressTasks.includes(t))
  const completionRate = Math.round((dashboard.today_completion_rate ?? 0) * 100)
  const todayStr = format(new Date(), 'EEEE, MMMM d')
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">

        {/* ── Hero Greeting Card ── */}
        <div className="relative rounded-3xl overflow-hidden p-6"
          style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)' }}>
          {/* decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-6 right-12 w-20 h-20 rounded-full bg-white/10" />
          <div className="absolute top-4 -right-4 w-16 h-16 rounded-full bg-white/5" />

          <div className="relative flex items-start justify-between">
            <div className="flex-1">
              <p className="text-white/70 text-sm font-medium mb-1">Hello!</p>
              <h1 className="text-white text-2xl font-bold mb-4">{firstName}</h1>
              <div className="inline-block bg-white/20 rounded-2xl px-4 py-3 backdrop-blur-sm">
                <p className="text-white/80 text-xs mb-1">Today's progress</p>
                <p className="text-white text-sm font-semibold">
                  {dashboard.tasks_completed_today ?? 0} of {dashboard.tasks_due_today ?? 0} tasks done
                </p>
              </div>
            </div>

            {/* Donut progress */}
            <div className="relative flex items-center justify-center shrink-0">
              <DonutProgress value={completionRate} size={88} />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white font-bold text-lg">{completionRate}%</span>
              </div>
            </div>
          </div>

          {/* Today date pill */}
          <div className="mt-4 flex items-center justify-between">
            <span className="text-white/60 text-xs">{todayStr}</span>
            <button
              onClick={() => navigate('/app/tasks')}
              className="flex items-center gap-1.5 bg-white text-brand-600 text-xs font-bold px-4 py-2 rounded-full hover:bg-white/90 transition-colors"
            >
              View Tasks <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Quick Actions ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-text-primary">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <QuickActionPill label="Add Task" icon={CheckSquare} color="bg-brand-500" onClick={() => setShowTaskModal(true)} />
            <QuickActionPill label="Schedule" icon={Calendar} color="bg-blue-500" onClick={() => navigate('/app/schedule')} />
            <QuickActionPill label="Projects" icon={FolderKanban} color="bg-amber-500" onClick={() => navigate('/app/projects')} />
            <QuickActionPill label="Ask AI" icon={Sparkles} color="bg-purple-500" onClick={() => navigate('/app/ai')} />
          </div>
        </div>

        {/* ── In Progress ── */}
        {inProgressTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-text-primary">In Progress</h2>
              <span className="text-xs font-semibold text-brand-500 bg-brand-500/10 px-2.5 py-1 rounded-full">
                {inProgressTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {inProgressTasks.slice(0, 3).map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
            {inProgressTasks.length > 3 && (
              <button onClick={() => navigate('/app/tasks')} className="mt-2 w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm text-brand-500 font-medium hover:bg-brand-500/5 transition-colors">
                See {inProgressTasks.length - 3} more <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* ── Overdue ── */}
        {overdueTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-text-primary">Overdue</h2>
              <span className="text-xs font-semibold text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full">
                {overdueTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {overdueTasks.slice(0, 3).map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
            </div>
          </div>
        )}

        {/* ── Due Today ── */}
        {todayTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-text-primary">Due Today</h2>
              <span className="text-xs font-semibold text-text-muted bg-surface-overlay px-2.5 py-1 rounded-full">
                {todayTasks.length}
              </span>
            </div>
            <div className="space-y-3">
              {todayTasks.slice(0, 4).map((task) => (
                <TaskRow key={task.id} task={task} />
              ))}
              {todayTasks.length > 4 && (
                <button onClick={() => navigate('/app/tasks')} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-sm text-brand-500 font-medium hover:bg-brand-500/5 transition-colors">
                  See {todayTasks.length - 4} more <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* ── Empty state ── */}
        {allTasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-3xl gradient-brand flex items-center justify-center mb-4 shadow-brand">
              <CheckSquare className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-base font-bold text-text-primary mb-2">You're all caught up!</h3>
            <p className="text-sm text-text-muted mb-6">No tasks due today. Add something to stay productive.</p>
            <button
              onClick={() => setShowTaskModal(true)}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white text-sm font-bold transition-colors shadow-brand"
            >
              <Plus className="w-4 h-4" /> Add your first task
            </button>
          </div>
        )}

        {/* ── Todos ── */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-text-primary">Quick Todos</h2>
            {pendingTodos.length > 0 && (
              <span className="text-xs font-semibold text-text-muted bg-surface-overlay px-2.5 py-1 rounded-full">
                {pendingTodos.length} pending
              </span>
            )}
          </div>

          {/* Add todo */}
          <form
            onSubmit={(e) => { e.preventDefault(); const t = newTodo.trim(); if (t) createTodo(t) }}
            className="flex items-center gap-2 mb-3"
          >
            <input
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a quick todo..."
              className="flex-1 px-4 py-3 rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-surface text-sm text-text-primary placeholder:text-text-disabled outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 transition-all"
            />
            <button
              type="submit"
              disabled={!newTodo.trim()}
              className="w-11 h-11 rounded-2xl bg-brand-500 hover:bg-brand-600 text-white flex items-center justify-center disabled:opacity-40 transition-colors shadow-brand"
            >
              <Plus className="w-5 h-5" />
            </button>
          </form>

          <div className="space-y-2">
            {pendingTodos.slice(0, 5).map((todo) => (
              <TodoItem
                key={todo.id}
                todo={todo}
                onToggle={() => toggleTodo({ id: todo.id, completed: true })}
                onDelete={() => deleteTodo(todo.id)}
              />
            ))}
            {pendingTodos.length === 0 && (
              <p className="text-sm text-text-disabled text-center py-4">No pending todos — great work!</p>
            )}
          </div>
        </div>

        {/* ── Today's Schedule ── */}
        {dashboard.today_events.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-bold text-text-primary">Today's Schedule</h2>
              <button onClick={() => navigate('/app/schedule')} className="text-xs text-brand-500 font-semibold hover:underline">
                View all
              </button>
            </div>
            <div className="space-y-3">
              {dashboard.today_events.slice(0, 3).map((event) => (
                <div key={event.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border">
                  <div className="flex flex-col items-center shrink-0 w-14 text-center">
                    <span className="text-xs font-bold text-brand-500">{formatTime(event.start_time)}</span>
                    <span className="text-[10px] text-text-disabled mt-0.5">{formatTime(event.end_time)}</span>
                  </div>
                  <div className="w-0.5 h-10 rounded-full bg-brand-500/30 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-text-primary truncate">{event.title}</p>
                    {event.task_title && (
                      <p className="text-[11px] text-text-muted truncate mt-0.5">{event.task_title}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {showTaskModal && <TaskCreateModal open={showTaskModal} onClose={() => setShowTaskModal(false)} />}
    </>
  )
}
