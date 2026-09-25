import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isToday, isPast, isFuture, parseISO, isValid } from 'date-fns'
import type { Task, TaskPriority, TaskStatus } from '@/types'

// ── Class merging ──────────────────────────────────────────────────────────────
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ── Date utilities ─────────────────────────────────────────────────────────────
export function formatDate(dateStr: string | undefined, fmt = 'MMM d, yyyy'): string {
  if (!dateStr) return '—'
  const date = parseISO(dateStr)
  if (!isValid(date)) return '—'
  return format(date, fmt)
}

export function formatTime(timeStr: string | undefined): string {
  if (!timeStr) return ''
  // Parse HH:MM and return 12h format
  const [hourStr, min] = timeStr.split(':')
  const hour = parseInt(hourStr, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const h12 = hour % 12 || 12
  return `${h12}:${min} ${ampm}`
}

export function formatDateTime(dateStr: string): string {
  const date = parseISO(dateStr)
  if (!isValid(date)) return '—'
  return format(date, 'MMM d, yyyy · h:mm a')
}

export function getRelativeDate(dateStr: string): string {
  const date = parseISO(dateStr)
  if (!isValid(date)) return '—'
  if (isToday(date)) return 'Today'
  return format(date, 'MMM d')
}

// ── Task due-state helpers ─────────────────────────────────────────────────────
export type DueState = 'overdue' | 'due-today' | 'upcoming' | 'no-date'

export function getTaskDueState(task: Task): DueState {
  if (!task.due_date) return 'no-date'
  if (task.status === 'completed' || task.status === 'cancelled') return 'upcoming' // neutral
  const date = parseISO(task.due_date)
  if (!isValid(date)) return 'no-date'
  if (isPast(date) && !isToday(date)) return 'overdue'
  if (isToday(date)) return 'due-today'
  return 'upcoming'
}

export function isTaskOverdueCompleted(task: Task): boolean {
  if (task.status !== 'completed') return false
  if (!task.due_date || !task.completed_at) return false
  const due = parseISO(task.due_date)
  const completed = parseISO(task.completed_at)
  if (!isValid(due) || !isValid(completed)) return false
  return completed > due
}

// ── Status / priority config ───────────────────────────────────────────────────
export const STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; color: string; bgColor: string; dotColor: string }
> = {
  todo: {
    label: 'To Do',
    color: 'text-text-muted',
    bgColor: 'bg-surface-overlay',
    dotColor: 'bg-text-muted',
  },
  in_progress: {
    label: 'In Progress',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    dotColor: 'bg-blue-400',
  },
  completed: {
    label: 'Completed',
    color: 'text-green-400',
    bgColor: 'bg-green-500/10',
    dotColor: 'bg-green-400',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'text-text-disabled',
    bgColor: 'bg-surface-overlay',
    dotColor: 'bg-text-disabled',
  },
}

export const PRIORITY_CONFIG: Record<
  TaskPriority,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  low: {
    label: 'Low',
    color: 'text-text-muted',
    bgColor: 'bg-surface-overlay',
    borderColor: 'border-border',
  },
  medium: {
    label: 'Medium',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/30',
  },
  high: {
    label: 'High',
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/30',
  },
  urgent: {
    label: 'Urgent',
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/30',
  },
}

// ── Task status transitions ────────────────────────────────────────────────────
export const ALLOWED_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  todo: ['in_progress', 'completed', 'cancelled'],
  in_progress: ['todo', 'completed', 'cancelled'],
  completed: ['todo'],
  cancelled: ['todo'],
}

export function getAllowedTransitions(status: TaskStatus): TaskStatus[] {
  return ALLOWED_TRANSITIONS[status] ?? []
}

// ── Duration ───────────────────────────────────────────────────────────────────
export function formatDuration(minutes: number | undefined): string {
  if (!minutes) return '—'
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

// ── Greeting ───────────────────────────────────────────────────────────────────
export function getGreeting(name: string): string {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${name}`
  if (hour < 17) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
}

// ── Completion rate display ────────────────────────────────────────────────────
export function formatCompletionRate(rate: number): string {
  return `${Math.round(rate)}%`
}

// ── Pluralise ──────────────────────────────────────────────────────────────────
export function pluralise(count: number, singular: string, plural?: string): string {
  return count === 1 ? `${count} ${singular}` : `${count} ${plural ?? singular + 's'}`
}

// ── Week label ─────────────────────────────────────────────────────────────────
export function formatWeekLabel(weekStart: string, weekEnd: string): string {
  const start = parseISO(weekStart)
  const end = parseISO(weekEnd)
  if (!isValid(start) || !isValid(end)) return 'Unknown week'
  if (start.getMonth() === end.getMonth()) {
    return `${format(start, 'MMM d')} – ${format(end, 'd, yyyy')}`
  }
  return `${format(start, 'MMM d')} – ${format(end, 'MMM d, yyyy')}`
}

export { isToday, isPast, isFuture, parseISO, isValid, format }
