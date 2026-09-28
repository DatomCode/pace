import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { addDays, subDays, format, isSameDay } from 'date-fns'
import { Plus, CheckCircle2, AlertCircle } from 'lucide-react'
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
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const queryParams = {
    ordering: 'due_date',
  }

  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.list,
  })
  const projects = projectsData?.results ?? []

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', queryParams],
    queryFn: () => tasksApi.list(queryParams),
  })

  const rawTasks = data?.results ?? []
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const selectedStr = format(selectedDate, 'yyyy-MM-dd')

  // Overdue: past due and not completed/cancelled — always shown
  const overdueTasks = rawTasks.filter(t =>
    t.due_date && t.due_date < todayStr && t.status !== 'completed' && t.status !== 'cancelled'
  )

  // Tasks for the selected date, filtered by status tab
  const dateTasks = rawTasks
    .filter(t => t.due_date === selectedStr)
    .filter(t => statusFilter === 'all' || t.status === statusFilter)




  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5 pb-28">

        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-text-primary">
            {isSameDay(selectedDate, new Date()) ? "Today's Tasks" : `${format(selectedDate, 'EEE, MMM d')}`}
          </h1>
          <span className="text-sm font-semibold text-brand-500">
            {dateTasks.length} task{dateTasks.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Date Strip */}
        <div className="flex overflow-x-auto gap-3 pb-1 scrollbar-hide snap-x -mx-4 px-4">
          {Array.from({ length: 14 }).map((_, i) => {
            const date = addDays(subDays(new Date(), 0), i)
            const isSelected = isSameDay(date, selectedDate)
            return (
              <button
                key={i}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  'snap-center shrink-0 flex flex-col items-center justify-center w-[66px] h-[82px] rounded-[22px] transition-all',
                  isSelected
                    ? 'bg-brand-500 text-white shadow-md shadow-brand-500/20'
                    : 'bg-white dark:bg-surface text-text-primary border border-gray-100 dark:border-border hover:border-brand-300'
                )}
              >
                <span className={cn('text-[10px] font-semibold mb-0.5', isSelected ? 'text-white/80' : 'text-text-muted')}>
                  {format(date, 'MMM')}
                </span>
                <span className="text-[20px] font-bold leading-none mb-0.5">{format(date, 'd')}</span>
                <span className={cn('text-[10px] font-semibold', isSelected ? 'text-white/80' : 'text-text-muted')}>
                  {format(date, 'EEE')}
                </span>
              </button>
            )
          })}
        </div>

        {/* Status tabs */}
        <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-hide">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                'whitespace-nowrap rounded-2xl px-4 py-2 text-sm font-semibold transition-all shrink-0',
                statusFilter === tab.value
                  ? 'bg-brand-500 text-white shadow-sm'
                  : 'bg-white dark:bg-surface border border-gray-100 dark:border-border text-text-muted hover:border-brand-300',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map(i => <CardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="space-y-5">

            {/* Overdue section — always shown if there are overdue tasks */}
            {overdueTasks.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm font-bold text-red-500">
                    Overdue · {overdueTasks.length}
                  </span>
                </div>
                {overdueTasks.map(task => (
                  <div key={task.id} className="relative">
                    <TaskCard
                      task={task}
                      onClick={() => setDrawerTaskId(task.id)}
                    />
                    {/* Due date badge pinned bottom-left of the card */}
                    {task.due_date && (
                      <span className="absolute bottom-2 left-12 text-[10px] font-semibold text-red-500 bg-red-50 dark:bg-red-500/10 px-1.5 py-0.5 rounded-full pointer-events-none">
                        Was due {format(new Date(task.due_date + 'T00:00:00'), 'MMM d')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Tasks for the selected date */}
            <div className="space-y-2">
              {dateTasks.length === 0 ? (
                <div className="flex flex-col items-center text-center px-6 py-12">
                  <div
                    className="w-14 h-14 rounded-3xl flex items-center justify-center mb-4"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                  >
                    <CheckCircle2 className="w-6 h-6 text-white" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-base font-bold text-text-primary mb-1">
                    {isSameDay(selectedDate, new Date()) ? 'Nothing due today' : `Nothing on ${format(selectedDate, 'MMM d')}`}
                  </h3>
                  <p className="text-sm text-text-muted">Tap + to add a task for this day</p>
                </div>
              ) : (
                dateTasks.map(task => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onClick={() => setDrawerTaskId(task.id)}
                  />
                ))
              )}
            </div>

          </div>
        )}

      </div>

      {/* FAB */}
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
