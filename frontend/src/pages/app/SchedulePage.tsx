import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, AlertTriangle, Trash2
} from 'lucide-react'
import { format, addDays, subDays, isSameDay } from 'date-fns'
import { scheduleApi } from '@/api/schedule'
import { tasksApi } from '@/api/tasks'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Modal from '@/components/ui/Modal'
import Select from '@/components/ui/Select'
import EmptyState from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import { normaliseError } from '@/api/client'
import { cn } from '@/lib/utils'
import type { ScheduleEvent } from '@/types'

const HOURS = Array.from({ length: 16 }, (_, i) => i + 7) // 7 AM to 10 PM

const eventSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  description: z.string().optional(),
  task: z.string().optional(),
}).refine(data => data.start_time < data.end_time, {
  message: "End time must be after start time",
  path: ["end_time"],
})

type EventFormData = z.infer<typeof eventSchema>

function timeToMinutes(timeStr: string) {
  const [h, m] = timeStr.split(':').map(Number)
  return h * 60 + (m || 0)
}

// Rotating palette for event left-border colours

const EVENT_SOLID_COLORS = [
  'bg-blue-500',
  'bg-emerald-500',
  'bg-violet-500',
  'bg-pink-500',
  'bg-amber-500',
  'bg-cyan-500',
]

const EVENT_BORDER_COLORS = [
  'border-l-brand-500',
  'border-l-violet-500',
  'border-l-emerald-500',
  'border-l-amber-500',
  'border-l-pink-500',
  'border-l-cyan-500',
]

const EVENT_BG_COLORS = [
  'bg-brand-500/8',
  'bg-violet-500/8',
  'bg-emerald-500/8',
  'bg-amber-500/8',
  'bg-pink-500/8',
  'bg-cyan-500/8',
]

const EVENT_TEXT_COLORS = [
  'text-brand-600 dark:text-brand-400',
  'text-violet-600 dark:text-violet-400',
  'text-emerald-600 dark:text-emerald-400',
  'text-amber-600 dark:text-amber-400',
  'text-pink-600 dark:text-pink-400',
  'text-cyan-600 dark:text-cyan-400',
]

export default function SchedulePage() {
  const queryClient = useQueryClient()
  const [currentDate, setCurrentDate] = useState(new Date())
  const dateStr = format(currentDate, 'yyyy-MM-dd')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingEvent, setEditingEvent] = useState<ScheduleEvent | null>(null)
  const [conflictWarning, setConflictWarning] = useState<string | null>(null)
  const [pendingData, setPendingData] = useState<EventFormData | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const { data: eventsData, isLoading } = useQuery({
    queryKey: ['schedule', dateStr],
    queryFn: () => scheduleApi.list({ date: dateStr }),
  })
  const events = eventsData?.results ?? []

  const { data: tasksData } = useQuery({
    queryKey: ['tasks', { status: 'todo' }],
    queryFn: () => tasksApi.list({ status: 'todo' }),
  })
  const tasks = tasksData?.results ?? []

  const { register, handleSubmit, setValue, watch, reset, formState: { errors } } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema),
    defaultValues: {
      date: dateStr,
      start_time: '09:00',
      end_time: '10:00',
    }
  })

  const openCreateModal = (defaultTime?: string) => {
    setEditingEvent(null)
    setConflictWarning(null)
    setApiError(null)
    reset({
      date: dateStr,
      start_time: defaultTime ?? '09:00',
      end_time: defaultTime ? `${parseInt(defaultTime.split(':')[0]) + 1}:00`.padStart(5, '0') : '10:00',
      title: '',
      description: '',
      task: '',
    })
    setModalOpen(true)
  }

  const openEditModal = (event: ScheduleEvent) => {
    setEditingEvent(event)
    setConflictWarning(null)
    setApiError(null)
    reset({
      title: event.title,
      date: event.date,
      start_time: event.start_time,
      end_time: event.end_time,
      description: event.description ?? '',
      task: event.task ?? '',
    })
    setModalOpen(true)
  }

  const saveMutation = useMutation({
    mutationFn: async ({ data, force }: { data: EventFormData, force?: boolean }) => {
      const payload = {
        ...data,
        task: data.task || undefined,
      }
      if (editingEvent) {
        return scheduleApi.update(editingEvent.id, payload, force)
      }
      return scheduleApi.create(payload, force)
    },
    onSuccess: (res) => {
      // API returns an object with conflict if conflict occurs and not forced
      if ('conflict' in res && res.conflict) {
        setConflictWarning(`This event overlaps with ${res.conflict.conflicting_event.title} (${res.conflict.conflicting_event.start_time} - ${res.conflict.conflicting_event.end_time})`)
        return
      }
      
      queryClient.invalidateQueries({ queryKey: ['schedule'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setModalOpen(false)
      setConflictWarning(null)
      setPendingData(null)
    },
    onError: (err) => {
      const norm = normaliseError(err)
      if (norm.status === 409) {
         setConflictWarning(norm.message)
      } else {
         setApiError(norm.message)
      }
    }
  })

  const onSubmit = (data: EventFormData) => {
    setPendingData(data)
    saveMutation.mutate({ data, force: false })
  }

  const forceSave = () => {
    if (pendingData) {
      saveMutation.mutate({ data: pendingData, force: true })
    }
  }

  const deleteMutation = useMutation({
    mutationFn: (id: string) => scheduleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      setDeleteId(null)
    }
  })

  // Timeline rendering prep
  const dayStartMin = 7 * 60
  const totalMinutes = 16 * 60 // 7 AM to 11 PM

  const isToday = isSameDay(currentDate, new Date())

  return (
    <>
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-sm"
              style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)' }}
            >
              <CalendarIcon className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-text-primary">Schedule</h1>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between gap-3 rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm p-3">
          <button
            onClick={() => setCurrentDate(subDays(currentDate, 1))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/10 text-white/90 text-text-primary hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-sm font-semibold"
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>

          <div className="flex flex-col items-center gap-1">
            <span className="font-bold text-text-primary text-sm">
              {format(currentDate, 'EEEE, MMMM d')}
            </span>
            <span className="text-xs text-text-muted">{format(currentDate, 'yyyy')}</span>
          </div>

          <div className="flex items-center gap-2">
            {!isToday && (
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-white transition-colors"
                style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
              >
                Today
              </button>
            )}
            <button
              onClick={() => setCurrentDate(addDays(currentDate, 1))}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-black/10 text-white/90 text-text-primary hover:bg-gray-200 dark:hover:bg-white/20 transition-colors text-sm font-semibold"
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Timeline Card */}
        <div className="rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <div
                className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
                style={{ borderTopColor: '#6366f1', borderRightColor: '#8b5cf6' }}
              />
              <span className="text-sm text-text-muted">Loading schedule...</span>
            </div>
          ) : (
            <div className="relative" style={{ height: `${totalMinutes}px` }}>
              {/* Hour grid rows */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="absolute w-full flex border-t border-gray-100 dark:border-border/50"
                  style={{ top: `${(hour - 7) * 60}px`, height: '60px' }}
                >
                  {/* Hour label */}
                  <div className="w-16 shrink-0 flex items-start justify-end pr-3 pt-1">
                    <span className="text-xs font-bold text-brand-500">
                      {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
                    </span>
                  </div>
                  {/* Clickable hour slot */}
                  <div
                    className="flex-1 hover:bg-brand-500/5 cursor-pointer transition-colors"
                    onClick={() => openCreateModal(`${hour.toString().padStart(2, '0')}:00`)}
                  />
                </div>
              ))}

              {/* Event cards */}
              {events.map((event, idx) => {
                const startMins = timeToMinutes(event.start_time)
                const endMins = timeToMinutes(event.end_time)
                const top = startMins - dayStartMin
                const height = endMins - startMins
                const safeTop = Math.max(0, top)
                const safeHeight = Math.max(28, height)
                const colorIdx = idx % EVENT_BORDER_COLORS.length

                return (
                  <div
                    key={event.id}
                    onClick={() => openEditModal(event)}
                    className={cn('absolute left-16 right-4 rounded-md overflow-hidden cursor-pointer transition-all group shadow-sm hover:shadow-md', EVENT_SOLID_COLORS[idx % EVENT_SOLID_COLORS.length])}
                    style={{ top: `${safeTop}px`, height: `${safeHeight}px` }}
                  >
                    <div className="px-3 py-1.5 h-full flex flex-col">
                      <div className="text-xs font-bold truncate text-white">
                        {event.title}
                      </div>
                      <div className="text-[10px] text-white/90 mt-0.5">
                        {event.start_time} – {event.end_time}
                      </div>
                      {event.task_title && safeHeight >= 50 && (
                        <div className="text-[10px] truncate mt-1 text-white/80 bg-black/10 text-white/90 px-1.5 py-0.5 rounded-full inline-block w-fit">
                          {event.task_title}
                        </div>
                      )}
                    </div>
                    <button
                      className="absolute top-1.5 right-1.5 p-1 opacity-0 group-hover:opacity-100 text-white/70 hover:text-white hover:bg-black/20 rounded-lg transition-all"
                      onClick={(e) => { e.stopPropagation(); setDeleteId(event.id); }}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}

              {/* Empty state overlay when no events */}
              {events.length === 0 && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <div
                    className="w-14 h-14 rounded-3xl flex items-center justify-center mb-3 shadow-sm"
                    style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)' }}
                  >
                    <CalendarIcon className="w-7 h-7 text-white" />
                  </div>
                  <p className="font-bold text-text-primary text-sm">No events today</p>
                  <p className="text-xs text-text-muted mt-1">Click any hour slot or the + button to add one</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={() => openCreateModal()}
        className="fixed bottom-24 right-5 w-14 h-14 rounded-full shadow-lg flex items-center justify-center z-30 transition-transform hover:scale-105 active:scale-95"
        style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)' }}
        aria-label="Add event"
      >
        <Plus className="w-6 h-6 text-white" />
      </button>

      {/* Event create/edit modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingEvent ? 'Edit Event' : 'Add Event'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {apiError && (
            <div className="px-3 py-2.5 rounded-2xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-sm text-red-600 dark:text-red-400">
              {apiError}
            </div>
          )}

          {/* Conflict warning banner */}
          {conflictWarning && (
            <div className="px-4 py-3 rounded-2xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 flex flex-col gap-3">
              <div className="flex items-start gap-2 text-amber-700 dark:text-amber-400">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="text-sm font-medium">{conflictWarning}</span>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="flex-1 px-3 py-2 rounded-xl border border-amber-300 dark:border-amber-500/40 text-sm font-semibold text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-500/10 transition-colors"
                  onClick={() => setConflictWarning(null)}
                >
                  Edit time
                </button>
                <button
                  type="button"
                  className="flex-1 px-3 py-2 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                  onClick={forceSave}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? 'Saving...' : 'Continue anyway'}
                </button>
              </div>
            </div>
          )}

          {!conflictWarning && (
            <>
              <Input label="Event Title" error={errors.title?.message} {...register('title')} autoFocus />
              <div className="grid grid-cols-2 gap-3">
                <Input type="date" label="Date" error={errors.date?.message} {...register('date')} />
                <Select
                  label="Linked Task"
                  value={watch('task') || ''}
                  onValueChange={(v) => setValue('task', v)}
                  placeholder="None"
                  options={tasks.map(t => ({ label: t.title, value: t.id }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Input type="time" label="Start Time" error={errors.start_time?.message} {...register('start_time')} />
                <Input type="time" label="End Time" error={errors.end_time?.message} {...register('end_time')} />
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 dark:border-border text-sm font-semibold text-text-muted hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 rounded-2xl text-sm font-bold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
                  style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
                  disabled={saveMutation.isPending}
                >
                  {saveMutation.isPending ? 'Saving...' : 'Save Event'}
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => { if (deleteId) deleteMutation.mutate(deleteId); }}
        title="Delete Event"
        description="Are you sure you want to delete this event?"
        variant="danger"
        isLoading={deleteMutation.isPending}
      />
    </>
  )
}
