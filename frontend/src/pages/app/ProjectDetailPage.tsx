import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  useParams, Link, useNavigate,
} from 'react-router-dom'
import {
  ArrowLeft, Edit2, Trash2, Plus, FolderOpen, CheckCircle2,
} from 'lucide-react'
import { projectsApi } from '@/api/projects'
import { tasksApi } from '@/api/tasks'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
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

// ── DonutProgress ────────────────────────────────────────────────────────────
function DonutProgress({
  value,
  color,
  size = 56,
}: {
  value: number
  color: string
  size?: number
}) {
  const radius = (size - 8) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (value / 100) * circumference

  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="currentColor"
        strokeWidth={5}
        className="text-white/20"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="white"
        strokeWidth={5}
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

// Suppress unused import warning for tasksApi (used implicitly via project tasks)
void tasksApi

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

  // ── Loading state ──────────────────────────────────────────────────────────
  if (projLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-surface-overlay rounded-xl w-24" />
          <div className="rounded-3xl h-44 bg-surface-overlay" />
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map((i) => <div key={i} className="h-16 bg-surface-overlay rounded-2xl" />)}
          </div>
        </div>
      </div>
    )
  }

  // ── Not found ──────────────────────────────────────────────────────────────
  if (!project) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 pb-28">
        <EmptyState
          icon={FolderOpen}
          title="Project not found"
          description="This project may have been deleted."
          action={{ label: 'Back to projects', onClick: () => navigate('/app/projects') }}
        />
      </div>
    )
  }

  const projectColor = project.color ?? '#6366f1'
  const remaining = project.task_count - project.completed_task_count

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">

        {/* ── Back link ──────────────────────────────────────────────────── */}
        <Link
          to="/app/projects"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-500 hover:text-brand-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          All projects
        </Link>

        {/* ── Hero gradient card ─────────────────────────────────────────── */}
        <div
          className="relative rounded-3xl p-6 overflow-hidden text-white"
          style={{ background: `linear-gradient(135deg, ${projectColor} 0%, ${projectColor}cc 100%)` }}
        >
          {/* Decorative circles */}
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-10 -right-4 w-24 h-24 rounded-full bg-white/10" />

          {/* Top row: title + actions */}
          <div className="relative flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0 pr-3">
              <h1 className="text-2xl font-bold leading-tight">{project.name}</h1>
              {project.description && (
                <p className="text-sm text-white/70 mt-1 line-clamp-2">{project.description}</p>
              )}
              <p className="text-xs text-white/50 mt-1">Created {formatDate(project.created_at)}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setEditOpen(true)}
                className="p-2 rounded-xl bg-white/15 hover:bg-white/25 transition-colors"
                aria-label="Edit project"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setDeleteOpen(true)}
                className="p-2 rounded-xl bg-white/15 hover:bg-red-400/40 transition-colors"
                aria-label="Delete project"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Stat boxes */}
          <div className="relative grid grid-cols-3 gap-3 mt-5">
            {[
              { label: 'Total', value: project.task_count },
              { label: 'Completed', value: project.completed_task_count },
              { label: 'Remaining', value: remaining },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl bg-white/15 backdrop-blur-sm p-3 text-center">
                <div className="text-xl font-bold">{stat.value}</div>
                <div className="text-[11px] text-white/70 mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div className="relative mt-5">
            <div className="flex items-center justify-between text-xs text-white/70 mb-1.5">
              <span>Progress</span>
              <span className="font-bold text-white">{completionPct}%</span>
            </div>
            <div className="h-2 rounded-full bg-white/20">
              <div
                className="h-2 rounded-full bg-white transition-all duration-500"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          {/* Donut overlay (decorative — shown at bottom right) */}
          <div className="absolute bottom-4 right-5 opacity-30">
            <DonutProgress value={completionPct} color={projectColor} size={60} />
          </div>
        </div>

        {/* ── Tasks section ─────────────────────────────────────────────── */}
        <div className="space-y-4">
          <h2 className="text-base font-bold text-text-primary">Tasks</h2>

          {/* Status filter tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={cn(
                  'rounded-2xl px-4 py-2 text-sm font-semibold whitespace-nowrap transition-all shrink-0',
                  statusFilter === tab.value
                    ? 'bg-brand-500 text-white shadow-sm'
                    : 'bg-white dark:bg-surface text-text-muted hover:bg-gray-50 dark:hover:bg-surface-overlay border border-gray-100 dark:border-border'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Task list */}
          {tasksLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-surface-overlay animate-pulse rounded-2xl" />
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

      {/* FAB — Add task */}
      <button
        onClick={() => setCreateTaskOpen(true)}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg z-30"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)' }}
        aria-label="Add task"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* ── Edit project modal ─────────────────────────────────────────── */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit project">
        <form onSubmit={handleSubmit((data) => updateMutation.mutate(data))} className="space-y-4">
          {apiError && (
            <div className="px-3 py-2 rounded-2xl bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {apiError}
            </div>
          )}
          <Input label="Project name" error={errors.name?.message} {...register('name')} />
          <div>
            <label className="block text-sm text-text-muted mb-1.5">Description</label>
            <textarea
              className="w-full px-3 py-2.5 rounded-2xl border border-gray-100 dark:border-border bg-white dark:bg-surface text-text-primary text-sm placeholder-text-disabled focus:outline-none focus:ring-2 focus:ring-brand-500/30 focus:border-brand-500 resize-none transition-all"
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
                    selectedColor === color
                      ? 'border-white scale-110 shadow-md'
                      : 'border-transparent opacity-70 hover:opacity-100'
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

      {/* ── Delete confirm ─────────────────────────────────────────────── */}
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

      {/* ── Create task ────────────────────────────────────────────────── */}
      {createTaskOpen && (
        <TaskCreateModal
          open={createTaskOpen}
          onClose={() => setCreateTaskOpen(false)}
          defaultProjectId={id}
        />
      )}

      {/* ── Task detail drawer ─────────────────────────────────────────── */}
      <TaskDetailDrawer
        taskId={drawerTaskId}
        open={!!drawerTaskId}
        onClose={() => setDrawerTaskId(null)}
      />
    </>
  )
}
