import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Pencil,
  Check,
  X,
  Trash2,
  Folder,
  Timer,
  CalendarDays,
  Clock,
  Tag,
} from 'lucide-react'
import { cn, STATUS_CONFIG, PRIORITY_CONFIG, getAllowedTransitions, formatDuration, formatDateTime } from '@/lib/utils'
import { tasksApi } from '@/api/tasks'
import { projectsApi } from '@/api/projects'
import { Drawer } from '@/components/ui/Drawer'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { Skeleton } from '@/components/ui/SkeletonLoader'
import { DueDateLabel } from './DueDateLabel'
import { TaskStatusBadge } from './TaskStatusBadge'
import { PriorityBadge } from './PriorityBadge'
import type { Task, TaskStatus, TaskPriority, APIError } from '@/types'

// ── Schema ─────────────────────────────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  due_date: z.string().min(1, 'Due date is required'),
  // Keep as string in the form; convert to number inside the mutation
  estimated_duration: z.string().optional(),
  project: z.string().optional(),
  category: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

// ── Options ────────────────────────────────────────────────────────────────────
const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
]

// ── Types ──────────────────────────────────────────────────────────────────────
export interface TaskDetailDrawerProps {
  taskId: string | null
  open: boolean
  onClose: () => void
}

// ── Detail row ─────────────────────────────────────────────────────────────────
function DetailRow({
  icon: Icon,
  label,
  children,
}: {
  icon: React.ElementType
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border-subtle last:border-0">
      <div className="flex items-center gap-2 w-32 shrink-0 mt-0.5">
        <Icon className="size-3.5 text-text-muted shrink-0" aria-hidden="true" />
        <span className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex-1 min-w-0 text-sm text-text-primary">{children}</div>
    </div>
  )
}

// ── Drawer loading skeleton ────────────────────────────────────────────────────
function DrawerSkeleton() {
  return (
    <div className="flex flex-col gap-5" aria-label="Loading task…" aria-busy="true">
      <Skeleton className="h-6 w-3/4 rounded" />
      <Skeleton className="h-4 w-1/2 rounded" />
      <div className="flex flex-col gap-3 mt-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-4 w-24 rounded shrink-0" />
            <Skeleton className="h-4 flex-1 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────
export function TaskDetailDrawer({ taskId, open, onClose }: TaskDetailDrawerProps) {
  const queryClient = useQueryClient()
  const [editMode, setEditMode] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Fetch task
  const {
    data: task,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['tasks', taskId],
    queryFn: () => tasksApi.get(taskId!),
    enabled: open && !!taskId,
  })

  // Fetch projects
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
    enabled: open,
  })

  const projectOptions = [
    { value: '', label: 'No project' },
    ...(projectsData?.results ?? []).map((p) => ({ value: p.id, label: p.name })),
  ]

  // Update mutation
  const { mutate: updateTask, isPending: isUpdating } = useMutation({
    mutationFn: (payload: Parameters<typeof tasksApi.update>[1]) =>
      tasksApi.update(taskId!, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(['tasks', taskId], updated)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setEditMode(false)
    },
    onError: (err: unknown) => {
      const apiErr = err as APIError
      if (apiErr?.field_errors) {
        Object.entries(apiErr.field_errors).forEach(([field, messages]) => {
          setError(field as keyof FormValues, { message: messages[0] })
        })
      }
    },
  })

  // Status transition mutation
  const { mutate: updateStatus, isPending: isTransitioning } = useMutation({
    mutationFn: (status: TaskStatus) => tasksApi.updateStatus(taskId!, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(['tasks', taskId], updated)
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    },
  })

  // Delete mutation
  const { mutate: deleteTask, isPending: isDeleting } = useMutation({
    mutationFn: () => tasksApi.delete(taskId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setConfirmDelete(false)
      onClose()
    },
  })

  // Form
  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  })

  // Populate form when task loads or edit mode activates
  function enterEditMode(t: Task) {
    reset({
      title: t.title,
      description: t.description ?? '',
      priority: t.priority as TaskPriority,
      due_date: t.due_date,
      estimated_duration: t.estimated_duration ? String(t.estimated_duration) : '',
      project: t.project ?? '',
      category: t.category ?? '',
    })
    setEditMode(true)
  }

  function cancelEdit() {
    setEditMode(false)
    reset()
  }

  function onSubmit(values: FormValues) {
    updateTask({
      title: values.title,
      description: values.description || undefined,
      priority: values.priority as TaskPriority,
      due_date: values.due_date,
      estimated_duration: values.estimated_duration
        ? parseInt(String(values.estimated_duration), 10)
        : undefined,
      project: values.project || undefined,
      category: values.category || undefined,
    })
  }

  const drawerTitle = task?.title ?? (isLoading ? 'Loading…' : 'Task details')

  return (
    <>
      <Drawer open={open} onClose={onClose} title={drawerTitle} width="lg">
        {isLoading && <DrawerSkeleton />}

        {isError && (
          <div className="flex items-center justify-center py-16 text-sm text-text-muted">
            Failed to load task. Please try again.
          </div>
        )}

        {task && !isLoading && (
          <div className="flex flex-col gap-5">
            {/* Edit / save toolbar */}
            <div className="flex items-center justify-between">
              <TaskStatusBadge status={task.status} />
              <div className="flex items-center gap-2">
                {!editMode ? (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => enterEditMode(task)}
                    >
                      <Pencil className="size-3.5" aria-hidden="true" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-400 hover:text-red-300"
                      onClick={() => setConfirmDelete(true)}
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Delete
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={cancelEdit}
                      disabled={isUpdating}
                    >
                      <X className="size-3.5" aria-hidden="true" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleSubmit(onSubmit)}
                      isLoading={isUpdating}
                      disabled={!isDirty}
                    >
                      <Check className="size-3.5" aria-hidden="true" />
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>

            {/* Status transition buttons */}
            {!editMode && (() => {
              const transitions = getAllowedTransitions(task.status)
              if (transitions.length === 0) return null
              return (
                <div className="flex flex-wrap gap-2">
                  {transitions.map((toStatus) => {
                    const cfg = STATUS_CONFIG[toStatus]
                    return (
                      <button
                        key={toStatus}
                        type="button"
                        onClick={() => updateStatus(toStatus)}
                        disabled={isTransitioning}
                        className={cn(
                          'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border',
                          'transition-all duration-150',
                          'hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed',
                          cfg.bgColor,
                          cfg.color,
                          'border-transparent',
                          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
                        )}
                      >
                        <span className={cn('size-1.5 rounded-full', cfg.dotColor)} aria-hidden="true" />
                        Mark as {cfg.label}
                      </button>
                    )
                  })}
                </div>
              )
            })()}

            {/* Title (edit mode) */}
            {editMode && (
              <Input
                label="Title"
                error={errors.title?.message}
                {...register('title')}
              />
            )}

            {/* View mode title + description */}
            {!editMode && (
              <>
                <div>
                  <h2 className="text-lg font-semibold text-text-primary leading-snug">
                    {task.title}
                  </h2>
                  {task.description && (
                    <p className="mt-2 text-sm text-text-secondary leading-relaxed whitespace-pre-wrap">
                      {task.description}
                    </p>
                  )}
                </div>
              </>
            )}

            {/* Edit mode description */}
            {editMode && (
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-text-secondary select-none">
                  Description
                </label>
                <textarea
                  rows={4}
                  className="w-full rounded-lg px-3 py-2 text-sm bg-surface-overlay text-text-primary border border-border placeholder:text-text-disabled resize-none transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
                  placeholder="Add details…"
                  {...register('description')}
                />
              </div>
            )}

            {/* Detail rows — view mode */}
            {!editMode && (
              <div className="bg-surface-elevated border border-border rounded-xl px-4 py-1">
                <DetailRow icon={CalendarDays} label="Due">
                  <DueDateLabel task={task} />
                </DetailRow>

                <DetailRow icon={Tag} label="Priority">
                  <PriorityBadge priority={task.priority} />
                </DetailRow>

                {task.project_name && (
                  <DetailRow icon={Folder} label="Project">
                    <span className="text-text-secondary">{task.project_name}</span>
                  </DetailRow>
                )}

                {task.estimated_duration && (
                  <DetailRow icon={Timer} label="Duration">
                    <span className="text-text-secondary">
                      {formatDuration(task.estimated_duration)}
                    </span>
                  </DetailRow>
                )}

                {task.category && (
                  <DetailRow icon={Tag} label="Category">
                    <span className="text-text-secondary">{task.category}</span>
                  </DetailRow>
                )}

                <DetailRow icon={Clock} label="Created">
                  <span className="text-text-muted">{formatDateTime(task.created_at)}</span>
                </DetailRow>

                {task.completed_at && (
                  <DetailRow icon={Check} label="Completed">
                    <span className="text-green-400">{formatDateTime(task.completed_at)}</span>
                  </DetailRow>
                )}
              </div>
            )}

            {/* Edit mode fields */}
            {editMode && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 gap-3">
                  <Controller
                    name="priority"
                    control={control}
                    render={({ field }) => (
                      <Select
                        label="Priority"
                        options={PRIORITY_OPTIONS}
                        value={field.value}
                        onValueChange={field.onChange}
                        error={errors.priority?.message}
                      />
                    )}
                  />
                  <Input
                    label="Due date"
                    type="date"
                    error={errors.due_date?.message}
                    {...register('due_date')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Input
                    label="Est. duration (min)"
                    type="number"
                    min={1}
                    placeholder="e.g. 30"
                    error={errors.estimated_duration?.message}
                    {...register('estimated_duration')}
                  />
                  <Input
                    label="Category"
                    placeholder="e.g. Marketing"
                    error={errors.category?.message}
                    {...register('category')}
                  />
                </div>

                <Controller
                  name="project"
                  control={control}
                  render={({ field }) => (
                    <Select
                      label="Project"
                      options={projectOptions}
                      value={field.value ?? ''}
                      onValueChange={field.onChange}
                      placeholder="No project"
                      error={errors.project?.message}
                    />
                  )}
                />
              </div>
            )}
          </div>
        )}
      </Drawer>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={() => deleteTask()}
        title="Delete task"
        description="This action cannot be undone. The task will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        isLoading={isDeleting}
      />
    </>
  )
}

export default TaskDetailDrawer
