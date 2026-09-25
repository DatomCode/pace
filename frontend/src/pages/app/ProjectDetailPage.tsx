import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useParams, Link, useNavigate
} from 'react-router-dom'
import {
  ArrowLeft, Edit2, Trash2, Plus, FolderOpen, CheckCircle2
} from 'lucide-react'
import { projectsApi } from '@/api/projects'
import { tasksApi } from '@/api/tasks'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import ProgressBar from '@/components/ui/ProgressBar'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { TaskCard } from '@/components/tasks/TaskCard'
import { TaskCreateModal } from '@/components/tasks/TaskCreateModal'
import { TaskDetailDrawer } from '@/components/tasks/TaskDetailDrawer'
import { cn, formatDate } from '@/lib/utils'
import { normaliseError } from '@/api/client'
import type { TaskStatus } from '@/types'

const STATUS_TABS: { label: string; value: TaskStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'To Do', value: 'todo' },
  { label: 'In Progress', value: 'in_progress' },
  { label: 'Completed', value: 'completed' },
  { label: 'Cancelled', value: 'cancelled' },
]

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  color: z.string().optional(),
})
type EditFormData = z.infer<typeof editSchema>

const COLORS = [
  '#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7',
]

export default function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [createTaskOpen, setCreateTaskOpen] = useState(false)
  const [drawerTaskId, setDrawerTaskId] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const { data: project, isLoading: projLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.get(id!),
    enabled: !!id,
  })

  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['project-tasks', id],
    queryFn: () => projectsApi.getTasks(id!),
    enabled: !!id,
  })

  const allTasks = tasksData?.results ?? []
  const filteredTasks = statusFilter === 'all'
    ? allTasks
    : allTasks.filter(t => t.status === statusFilter)

  const completionPct = project
    ? project.task_count > 0
      ? Math.round((project.completed_task_count / project.task_count) * 100)
      : 0
    : 0

  const { register, handleSubmit, setValue, watch, formState: { errors }, reset } = useForm<EditFormData>({
    resolver: zodResolver(editSchema),
    values: project ? { name: project.name, description: project.description ?? '', color: project.color ?? '#6366f1' } : undefined,
  })

  const selectedColor = watch('color')

  const updateMutation = useMutation({
    mutationFn: (data: EditFormData) => projectsApi.update(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project', id] })
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      setEditOpen(false)
    },
    onError: (err) => setApiError(normaliseError(err).message),
  })

  const deleteMutation = useMutation({
    mutationFn: () => projectsApi.delete(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      navigate('/app/projects')
    },
    onError: (err) => setApiError(normaliseError(err).message),
  })

  if (projLoading) {
    return (
      <div className="page-container">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-surface-overlay rounded w-48" />
          <div className="h-4 bg-surface-overlay rounded w-64" />
          <div className="h-2 bg-surface-overlay rounded" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-surface-overlay rounded-xl" />)}
          </div>
        </div>
      </div>
    )
  }

  if (!project) {
    return (
      <div className="page-container">
        <EmptyState
          icon={FolderOpen}
          title="Project not found"
          description="This project may have been deleted."
          action={{ label: 'Back to projects', onClick: () => navigate('/app/projects') }}
        />
      </div>
    )
  }

  return (
    <>
      <div className="page-container max-w-4xl space-y-6">
        {/* Back link */}
        <Link
          to="/app/projects"
          className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All projects
        </Link>

        {/* Project header */}
        <div className="card p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: project.color ?? '#6366f1' }}
              />
              <h1 className="text-2xl font-bold text-text-primary">{project.name}</h1>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setEditOpen(true)}
                className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors"
                aria-label="Edit project"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-red-500/10 transition-colors"
                aria-label="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {project.description && (
            <p className="text-sm text-text-muted mb-4">{project.description}</p>
          )}

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-4">
            {[
              { label: 'Total', value: project.task_count },
              { label: 'Completed', value: project.completed_task_count },
              { label: 'Remaining', value: project.task_count - project.completed_task_count },
              { label: 'Progress', value: `${completionPct}%` },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-xl font-bold text-text-primary">{stat.value}</div>
                <div className="text-xs text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>

          <ProgressBar value={completionPct} color="green" showLabel />
          <p className="text-xs text-text-muted mt-2">
            Created {formatDate(project.created_at)}
          </p>
        </div>

        {/* Tasks section */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Tasks</h2>
            <Button size="sm" onClick={() => setCreateTaskOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1.5" />
              Add task
            </Button>
          </div>

          {/* Status filter tabs */}
          <div className="flex gap-1 mb-4 bg-surface rounded-lg p-1 w-fit">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  'px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
                  statusFilter === tab.value
                    ? 'bg-surface-overlay text-text-primary'
                    : 'text-text-muted hover:text-text-secondary'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {tasksLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-surface-overlay animate-pulse rounded-xl" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title={statusFilter === 'all' ? 'No tasks yet' : `No ${statusFilter.replace('_', ' ')} tasks`}
              description={statusFilter === 'all' ? 'Add tasks to track work for this project.' : undefined}
              action={statusFilter === 'all' ? { label: 'Add first task', onClick: () => setCreateTaskOpen(true) } : undefined}
            />
          ) : (
            <div className="space-y-2">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => setDrawerTaskId(task.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit project modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit project">
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
          {apiError && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {apiError}
            </div>
          )}
          <Input label="Project name" error={errors.name?.message} {...register('name')} />
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Description</label>
            <textarea
              className="w-full px-3 py-2.5 rounded-lg bg-surface-overlay border border-border text-text-primary text-sm placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none"
              rows={3}
              {...register('description')}
            />
          </div>
          <div>
            <label className="block text-sm text-text-muted mb-2">Color</label>
            <div className="flex gap-2">
              {COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue('color', color)}
                  className={cn(
                    'w-7 h-7 rounded-full border-2 transition-all',
                    selectedColor === color ? 'border-white scale-110' : 'border-transparent opacity-70 hover:opacity-100'
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setEditOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" isLoading={updateMutation.isPending} className="flex-1">Save changes</Button>
          </div>
        </form>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        title="Delete project"
        description={`Delete "${project.name}"? The project's tasks will not be deleted.`}
        confirmLabel="Delete project"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />

      {/* Create task */}
      {createTaskOpen && (
        <TaskCreateModal
          open={createTaskOpen}
          onClose={() => setCreateTaskOpen(false)}
          defaultProjectId={id}
        />
      )}

      {/* Task detail */}
      <TaskDetailDrawer
        taskId={drawerTaskId}
        open={!!drawerTaskId}
        onClose={() => setDrawerTaskId(null)}
      />
    </>
  )
}
