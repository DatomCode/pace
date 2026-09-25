// ============================================================
// Core Entity Types
// ============================================================

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'cancelled'
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent'

export interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  due_date: string // ISO date string
  estimated_duration?: number // minutes
  project?: string // project id
  project_name?: string
  category?: string
  created_at: string
  updated_at: string
  completed_at?: string
}

export interface CreateTaskPayload {
  title: string
  description?: string
  status?: TaskStatus
  priority: TaskPriority
  due_date: string
  estimated_duration?: number
  project?: string
  category?: string
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {
  status?: TaskStatus
}

// ============================================================
// Project Types
// ============================================================

export interface Project {
  id: string
  name: string
  description?: string
  color?: string
  task_count: number
  completed_task_count: number
  created_at: string
  updated_at: string
}

export interface CreateProjectPayload {
  name: string
  description?: string
  color?: string
}

// ============================================================
// Todo Types
// ============================================================

export interface Todo {
  id: string
  title: string
  completed: boolean
  created_at: string
  completed_at?: string
}

export interface CreateTodoPayload {
  title: string
}

// ============================================================
// Schedule / Event Types
// ============================================================

export interface ScheduleEvent {
  id: string
  title: string
  description?: string
  date: string // ISO date (YYYY-MM-DD)
  start_time: string // HH:MM
  end_time: string // HH:MM
  task?: string // task id
  task_title?: string
  created_at: string
  updated_at: string
}

export interface CreateScheduleEventPayload {
  title: string
  description?: string
  date: string
  start_time: string
  end_time: string
  task?: string
}

export interface ScheduleConflict {
  conflicting_event: ScheduleEvent
  message: string
}

// ============================================================
// AI Types
// ============================================================

export interface AISuggestion {
  id: string // temp client-side ID
  title: string
  description?: string
  priority: TaskPriority
  estimated_duration?: number
  category?: string
}

export interface AIGeneratePayload {
  goal: string
}

export interface AIGenerateResponse {
  suggestions: Omit<AISuggestion, 'id'>[]
  goal: string
}

// ============================================================
// Weekly Summary Types
// ============================================================

export interface WeeklySummaryStats {
  tasks_created: number
  tasks_completed: number
  tasks_overdue: number
  completion_rate: number // 0-100
  todos_created: number
  todos_completed: number
  scheduled_hours: number
  completed_task_hours: number
}

export interface WeeklySummaryAnalysis {
  overview?: string
  wins?: string[]
  challenges?: string[]
  patterns?: string[]
  recommendation?: string
}

export interface WeeklySummary {
  id: string
  week_start: string // YYYY-MM-DD (Sunday)
  week_end: string // YYYY-MM-DD (Saturday)
  stats: WeeklySummaryStats
  analysis?: WeeklySummaryAnalysis
  analysis_status: 'available' | 'unavailable' | 'pending'
  created_at: string
}

// ============================================================
// Auth / User Types
// ============================================================

export interface User {
  id: string
  name: string
  email: string
  date_joined?: string
  productivity_preference?: string
  default_category?: string
  onboarding_completed?: boolean
}

export interface AuthTokens {
  access: string
  refresh: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  password_confirm: string
}

export interface OnboardingPayload {
  purpose: string
  initial_goal?: string
}

// ============================================================
// API Response Types
// ============================================================

export interface PaginatedResponse<T> {
  count: number
  next?: string
  previous?: string
  results: T[]
}

export interface APIError {
  message: string
  field_errors?: Record<string, string[]>
  status?: number
}

// ============================================================
// Dashboard Types
// ============================================================

export interface DashboardData {
  today_tasks: Task[]
  overdue_tasks: Task[]
  in_progress_tasks: Task[]
  today_events: ScheduleEvent[]
  upcoming_events: ScheduleEvent[]
  pending_todos: Todo[]
  completed_todos_today: Todo[]
  today_completion_rate: number
  tasks_completed_today: number
  tasks_due_today: number
}

// ============================================================
// Notification Types
// ============================================================

export interface Notification {
  id: string
  type: 'task_due' | 'event_starting' | 'weekly_summary'
  title: string
  message: string
  read: boolean
  created_at: string
  data?: Record<string, string>
}
