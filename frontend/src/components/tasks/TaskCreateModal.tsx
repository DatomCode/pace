import { useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { tasksApi } from '@/api/tasks'
import { projectsApi } from '@/api/projects'
import type { APIError } from '@/types'

// ── Schema ─────────────────────────────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  status: z.enum(['todo', 'in_progress']),
  due_date: z.string().min(1, 'Due date is required'),
  // Keep as string in the form; convert to number in the mutation
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

const STATUS_OPTIONS = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
]

// ── Types ──────────────────────────────────────────────────────────────────────
export interface TaskCreateModalProps {
  open: boolean
  onClose: () => void
  defaultProjectId?: string
}

// ── Component ──────────────────────────────────────────────────────────────────
export function TaskCreateModal({ open, onClose, defaultProjectId }: TaskCreateModalProps) {
  const queryClient = useQueryClient()

  // Fetch projects for the dropdown
  const { data: projectsData } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
    enabled: open,
  })

  const projectOptions = [
    { value: '', label: 'No project' },
    ...(projectsData?.results ?? []).map((p) => ({ value: p.id, label: p.name })),
  ]

  const {
    register,
    handleSubmit,
    control,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      status: 'todo',
      due_date: '',
      estimated_duration: '',
      project: defaultProjectId ?? '',
      category: '',
    },
  })

  // Reset form when modal opens / default project changes
  useEffect(() => {
    if (open) {
      reset({
        title: '',
        description: '',
        priority: 'medium',
        status: 'todo',
        due_date: '',
        estimated_duration: '',
        project: defaultProjectId ?? '',
        category: '',
      })
    }
  }, [open, defaultProjectId, reset])

  const { mutate: createTask, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      tasksApi.create({
        title: values.title,
        description: values.description || undefined,
        priority: values.priority,
        status: values.status,
        due_date: values.due_date,
        estimated_duration: values.estimated_duration
          ? parseInt(values.estimated_duration, 10)
          : undefined,
        project: values.project || undefined,
        category: values.category || undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onClose()
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

  function onSubmit(values: FormValues) {
    createTask(values)
  }

  return (
    <Modal open={open} onClose={onClose} title="Create task" size="md">
      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary select-none" htmlFor="task-title">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            id="task-title"
            autoFocus
            placeholder="What needs to be done?"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'task-title-error' : undefined}
            className={`w-full rounded-lg px-3 py-2 text-base font-medium bg-surface-overlay text-text-primary border placeholder:text-text-disabled transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
              errors.title ? 'border-red-500 focus:ring-red-500' : 'border-border'
            }`}
            {...register('title')}
          />
          {errors.title && (
            <p id="task-title-error" role="alert" className="text-xs text-red-400">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary select-none" htmlFor="task-desc">
            Description
          </label>
          <textarea
            id="task-desc"
            rows={3}
            placeholder="Add details…"
            className="w-full rounded-lg px-3 py-2 text-sm bg-surface-overlay text-text-primary border border-border placeholder:text-text-disabled resize-none transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500"
            {...register('description')}
          />
        </div>

        {/* Priority + Status row */}
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
          <Controller
            name="status"
            control={control}
            render={({ field }) => (
              <Select
                label="Status"
                options={STATUS_OPTIONS}
                value={field.value}
                onValueChange={field.onChange}
                error={errors.status?.message}
              />
            )}
          />
        </div>

        {/* Due date + Duration row */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Due date"
            type="date"
            error={errors.due_date?.message}
            {...register('due_date')}
          />
          <Input
            label="Est. duration (min)"
            type="number"
            min={1}
            placeholder="e.g. 30"
            error={errors.estimated_duration?.message}
            {...register('estimated_duration')}
          />
        </div>

        {/* Project */}
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

        {/* Category */}
        <Input
          label="Category"
          placeholder="e.g. Marketing, Engineering…"
          error={errors.category?.message}
          {...register('category')}
        />

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1 border-t border-border">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isPending}>
            Create task
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default TaskCreateModal
