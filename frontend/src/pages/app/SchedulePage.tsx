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

  return (
    <>
      <div className="page-container h-full flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">Schedule</h1>
          </div>
          <Button onClick={() => openCreateModal()}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add Event
          </Button>
        </div>

        {/* Date Nav */}
        <div className="flex items-center justify-between bg-surface p-2 rounded-xl border border-border">
          <Button variant="ghost" onClick={() => setCurrentDate(subDays(currentDate, 1))}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Prev
          </Button>
          <div className="flex items-center gap-4">
            <span className="font-medium text-text-primary">
              {format(currentDate, 'EEEE, MMMM d, yyyy')}
            </span>
            {!isSameDay(currentDate, new Date()) && (
              <Button size="sm" variant="secondary" onClick={() => setCurrentDate(new Date())}>
                Today
              </Button>
            )}
          </div>
          <Button variant="ghost" onClick={() => setCurrentDate(addDays(currentDate, 1))}>
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        {/* Timeline */}
        <div className="card flex-1 overflow-y-auto relative min-h-[500px]">
          {isLoading ? (
             <div className="flex items-center justify-center h-full text-text-muted">Loading schedule...</div>
          ) : (
            <div className="relative" style={{ height: `${totalMinutes}px` }}>
              {/* Grid */}
              {HOURS.map((hour) => (
                <div 
                  key={hour} 
                  className="absolute w-full flex border-t border-border-subtle"
                  style={{ top: `${(hour - 7) * 60}px`, height: '60px' }}
                >
                  <div className="w-16 text-right pr-3 text-2xs text-text-muted -mt-2">
                    {format(new Date().setHours(hour, 0, 0, 0), 'h a')}
                  </div>
                  <div 
                    className="flex-1 hover:bg-surface-overlay/30 cursor-pointer transition-colors"
                    onClick={() => openCreateModal(`${hour.toString().padStart(2, '0')}:00`)}
                  />
                </div>
              ))}

              {/* Events */}
              {events.map((event) => {
                const startMins = timeToMinutes(event.start_time)
                const endMins = timeToMinutes(event.end_time)
                const top = startMins - dayStartMin
                const height = endMins - startMins
                // Bound it visually so it doesn't overflow
                const safeTop = Math.max(0, top)
                const safeHeight = Math.max(20, height)

                return (
                  <div
                    key={event.id}
                    onClick={() => openEditModal(event)}
                    className="absolute left-16 right-4 rounded-lg bg-brand-500/10 border border-brand-500/30 p-2 overflow-hidden cursor-pointer hover:bg-brand-500/20 transition-colors group"
                    style={{ top: `${safeTop}px`, height: `${safeHeight}px` }}
                  >
                    <div className="text-xs font-semibold text-brand-400">{event.title}</div>
                    <div className="text-2xs text-brand-400/80 mt-0.5">
                      {event.start_time} - {event.end_time}
                    </div>
                    {event.task_title && (
                      <div className="text-2xs text-text-muted truncate mt-1 bg-bg/50 px-1.5 py-0.5 rounded inline-block">
                        Task: {event.task_title}
                      </div>
                    )}
                    <button 
                      className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 text-brand-400 hover:text-red-400 hover:bg-red-500/10 rounded transition-all"
                      onClick={(e) => { e.stopPropagation(); setDeleteId(event.id); }}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingEvent ? 'Edit Event' : 'Add Event'} size="sm">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {apiError && (
            <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-sm text-red-400">
              {apiError}
            </div>
          )}
          
          {conflictWarning && (
            <div className="px-3 py-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-sm text-amber-400 flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{conflictWarning}</span>
              </div>
              <div className="flex gap-2">
                <Button type="button" size="sm" variant="secondary" onClick={() => setConflictWarning(null)}>Edit time</Button>
                <Button type="button" size="sm" onClick={forceSave} isLoading={saveMutation.isPending}>Continue anyway</Button>
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
              
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
                <Button type="submit" isLoading={saveMutation.isPending} className="flex-1">Save</Button>
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
