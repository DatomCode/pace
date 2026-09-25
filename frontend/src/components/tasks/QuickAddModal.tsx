import { useNavigate } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Zap } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { tasksApi } from '@/api/tasks'
import type { APIError } from '@/types'

// ── Schema ─────────────────────────────────────────────────────────────────────
const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  due_date: z.string().min(1, 'Due date is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
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
export interface QuickAddModalProps {
  onClose: () => void
}

// ── Component ──────────────────────────────────────────────────────────────────
export function QuickAddModal({ onClose }: QuickAddModalProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      due_date: '',
      priority: 'medium',
    },
  })

  const { mutate: createTask, isPending } = useMutation({
    mutationFn: (values: FormValues) =>
      tasksApi.create({
        title: values.title,
        due_date: values.due_date,
        priority: values.priority,
        status: 'todo',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      onClose()
      navigate('/tasks')
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

  return (
    <Modal open={true} onClose={onClose} title="Quick add task" size="sm">
      <form onSubmit={handleSubmit((v) => createTask(v))} noValidate className="flex flex-col gap-4">
        {/* Icon hint */}
        <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
          <Zap className="size-3.5 text-brand-500 shrink-0" aria-hidden="true" />
          Fast capture — you can fill in the rest later
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-text-secondary select-none" htmlFor="qa-title">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            id="qa-title"
            autoFocus
            placeholder="What needs to be done?"
            aria-invalid={!!errors.title}
            aria-describedby={errors.title ? 'qa-title-error' : undefined}
            className={`w-full rounded-lg px-3 py-2 text-sm bg-surface-overlay text-text-primary border placeholder:text-text-disabled transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
              errors.title ? 'border-red-500 focus:ring-red-500' : 'border-border'
            }`}
            {...register('title')}
          />
          {errors.title && (
            <p id="qa-title-error" role="alert" className="text-xs text-red-400">
              {errors.title.message}
            </p>
          )}
        </div>

        {/* Due date */}
        <Input
          label="Due date"
          type="date"
          error={errors.due_date?.message}
          {...register('due_date')}
        />

        {/* Priority */}
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

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={isPending}>
            Cancel
          </Button>
          <Button type="submit" size="sm" isLoading={isPending}>
            Add task
          </Button>
        </div>
      </form>
    </Modal>
  )
}

export default QuickAddModal
