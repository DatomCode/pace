import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { addDays, subDays, format, isSameDay } from 'date-fns'
import { Plus, Search, CheckCircle2 } from 'lucide-react'
import { tasksApi } from '@/api/tasks'
import { projectsApi } from '@/api/projects'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/SkeletonLoader'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal'
import TaskDetailDrawer from '@/components/tasks/TaskDetailDrawer'
import { cn } from '@/lib/utils'
import type { TaskStatus, TaskPriority } from '@/types'

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debouncedValue
}

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export default function TasksPage() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [drawerTaskId, setDrawerTaskId] = useState<string | null>(null)

  // Filters
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')
  const [dueStateFilter, setDueStateFilter] = useState<string>('all')
  const [ordering, setOrdering] = useState<string>('due_date')

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })
  const projects = projectsData?.results ?? []

  const queryParams = {
    search: debouncedSearch || undefined,
    status: statusFilter !== 'all' ? statusFilter : undefined,
    priority: priorityFilter !== 'all' ? priorityFilter : undefined,
    project: projectFilter !== 'all' ? projectFilter : undefined,
    due_state: dueStateFilter !== 'all' ? (dueStateFilter as 'today' | 'upcoming' | 'overdue') : undefined,
    ordering,
  }

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', queryParams],
    queryFn: () => tasksApi.list(queryParams),
  })

  const rawTasks = data?.results ?? []
  const tasks = rawTasks.filter(task => {
    if (!task.due_date) return false
    return task.due_date === format(selectedDate, 'yyyy-MM-dd')
  })

  const resetFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setPriorityFilter('all')
    setProjectFilter('all')
    setDueStateFilter('all')
    setOrdering('due_date')
  }

  const hasActiveFilters = search || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all' || dueStateFilter !== 'all'

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between">
          <button onClick={() => window.history.back()} className="p-2 -ml-2 rounded-xl hover:bg-surface-overlay transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <h1 className="text-lg font-bold text-text-primary">
            {isSameDay(selectedDate, new Date()) ? "Today's Tasks" : `${format(selectedDate, 'MMM d')} Tasks`}
          </h1>
          <button className="p-2 -mr-2 rounded-xl hover:bg-surface-overlay transition-colors relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
            <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
          </button>
        </div>

        {/* Date Row */}
        <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide snap-x -mx-4 px-4">
          {Array.from({ length: 14 }).map((_, i) => {
            const date = addDays(subDays(new Date(), 2), i)
            const isSelected = isSameDay(date, selectedDate)
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'snap-center shrink-0 flex flex-col items-center justify-center w-[72px] h-[90px] rounded-[24px] transition-all',
                  isSelected
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white dark:bg-surface text-text-primary hover:bg-gray-50 dark:hover:bg-surface-overlay border border-gray-100 dark:border-border'
                )}
              >
                <span className={cn('text-[11px] font-medium mb-1', isSelected ? 'text-white/80' : 'text-text-muted')}>{format(date, 'MMM')}</span>
                <span className="text-[22px] font-bold leading-none mb-1">{format(date, 'dd')}</span>
                <span className={cn('text-[11px] font-medium', isSelected ? 'text-white/80' : 'text-text-muted')}>{format(date, 'EEE')}</span>
              </button>
            )
          })}
        </div>

        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold transition-all shrink-0',
                statusFilter === tab.value
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-surface text-text-muted hover:bg-surface-overlay',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Secondary filters row ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 items-center">
          <Select
            value={dueStateFilter}
            onValueChange={setDueStateFilter}
            options={[
              { value: 'all', label: 'Any Time' },
              { value: 'today', label: 'Due Today' },
              { value: 'upcoming', label: 'Upcoming' },
              { value: 'overdue', label: 'Overdue' },
            ]}
            className="w-36"
          />
          <Select
            value={priorityFilter}
            onValueChange={setPriorityFilter}
            options={[
              { value: 'all', label: 'All Priorities' },
              { value: 'low', label: 'Low' },
              { value: 'medium', label: 'Medium' },
              { value: 'high', label: 'High' },
              { value: 'urgent', label: 'Urgent' },
            ]}
            className="w-36"
          />
          <Select
            value={projectFilter}
            onValueChange={setProjectFilter}
            options={[
              { value: 'all', label: 'All Projects' },
              ...projects.map(p => ({ value: p.id, label: p.name }))
            ]}
            className="w-36"
          />
          <Select
            value={ordering}
            onValueChange={setOrdering}
            options={[
              { value: 'due_date', label: 'Due Date ↑' },
              { value: '-due_date', label: 'Due Date ↓' },
              { value: 'priority', label: 'Priority' },
              { value: '-created_at', label: 'Newest' },
            ]}
            className="w-32"
          />
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="text-sm text-brand-500 hover:text-brand-400 font-medium transition-colors ml-auto"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Task List ─────────────────────────────────────────────────────── */}
        <div className="space-y-2">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
            </>
          ) : tasks.length === 0 ? (
            <div className="py-8">
              <div className="flex flex-col items-center text-center px-6 py-12">
                {/* Gradient icon square */}
                <div
                  className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                >
                  <CheckCircle2 className="w-7 h-7 text-white" strokeWidth={1.5} />
                </div>
                <h3 className="text-base font-bold text-text-primary mb-1.5">No tasks found</h3>
                <p className="text-sm text-text-muted max-w-xs leading-relaxed">
                  {hasActiveFilters
                    ? 'Try adjusting your filters to see more results.'
                    : "You're all caught up! Create a new task to get started."}
                </p>
                <button
                  onClick={hasActiveFilters ? resetFilters : () => setCreateTaskOpen(true)}
                  className="mt-5 px-5 py-2.5 rounded-2xl text-sm font-bold text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                >
                  {hasActiveFilters ? 'Clear filters' : 'Create task'}
                </button>
              </div>
            </div>
          ) : (
            tasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setDrawerTaskId(task.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── FAB Add button ────────────────────────────────────────────────── */}
      <button
        onClick={() => setCreateTaskOpen(true)}
        aria-label="Create new task"
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg z-30 transition-transform hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
      >
        <Plus className="w-6 h-6" />
      </button>

      {createTaskOpen && (
        <TaskCreateModal
          open={createTaskOpen}
          onClose={() => setCreateTaskOpen(false)}
        />
      )}

      <TaskDetailDrawer
        taskId={drawerTaskId}
        open={!!drawerTaskId}
        onClose={() => setDrawerTaskId(null)}
      />
    </>
  )
}
