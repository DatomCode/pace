import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Plus, Search, Filter, CheckCircle2 } from 'lucide-react'
import { tasksApi } from '@/api/tasks'
import { projectsApi } from '@/api/projects'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
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

export default function TasksPage() {
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

  const tasks = data?.results ?? []

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
      <div className="page-container space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Tasks</h1>
            <p className="text-sm text-text-muted mt-1">Manage and track your work</p>
          </div>
          <Button onClick={() => setCreateTaskOpen(true)}>
            <Plus className="w-4 h-4 mr-1.5" />
            New Task
          </Button>
        </div>

        {/* Filters Bar */}
        <div className="card p-4 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search tasks..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-text-muted" />}
              />
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="ghost" 
                className="md:hidden"
                onClick={resetFilters}
              >
                Clear
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <Select
              value={statusFilter}
              onValueChange={setStatusFilter}
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'todo', label: 'To Do' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <Select
              value={dueStateFilter}
              onValueChange={setDueStateFilter}
              options={[
                { value: 'all', label: 'Any Time' },
                { value: 'today', label: 'Due Today' },
                { value: 'upcoming', label: 'Upcoming' },
                { value: 'overdue', label: 'Overdue' },
              ]}
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
            />
            <Select
              value={projectFilter}
              onValueChange={setProjectFilter}
              options={[
                { value: 'all', label: 'All Projects' },
                ...projects.map(p => ({ value: p.id, label: p.name }))
              ]}
            />
            <Select
              value={ordering}
              onValueChange={setOrdering}
              options={[
                { value: 'due_date', label: 'Due Date (Earliest)' },
                { value: '-due_date', label: 'Due Date (Latest)' },
                { value: 'priority', label: 'Priority' },
                { value: '-created_at', label: 'Newest First' },
              ]}
            />
          </div>
          {hasActiveFilters && (
            <div className="flex justify-end hidden md:flex">
               <button onClick={resetFilters} className="text-sm text-brand-400 hover:text-brand-300 transition-colors">
                 Clear filters
               </button>
            </div>
          )}
        </div>

        {/* Task List */}
        <div className="space-y-2">
          {isLoading ? (
            <>
              {[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}
            </>
          ) : tasks.length === 0 ? (
            <div className="py-12">
              <EmptyState
                icon={CheckCircle2}
                title="No tasks found"
                description={hasActiveFilters ? "Try adjusting your filters to see more results." : "You're all caught up! Create a new task to get started."}
                action={!hasActiveFilters ? { label: 'Create task', onClick: () => setCreateTaskOpen(true) } : { label: 'Clear filters', onClick: resetFilters }}
              />
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
