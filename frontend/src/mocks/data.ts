/**
 * Mock API layer — simulates the Django DRF backend.
 * Replace with real API calls by pointing VITE_API_BASE_URL to the Django server
 * and removing the mock interceptor from main.tsx.
 */

import type {
  Task, Todo, Project, ScheduleEvent,
  WeeklySummary, User, DashboardData, Notification
} from '@/types'
import { addDays, subDays, format } from 'date-fns'

const today = new Date()
const fmt = (d: Date) => format(d, 'yyyy-MM-dd')

// ── Users ──────────────────────────────────────────────────────────────────────
export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Enoch',
  email: 'enoch@example.com',
  date_joined: fmt(subDays(today, 30)),
  productivity_preference: 'work',
  default_category: 'Development',
  onboarding_completed: true,
}

// ── Projects ──────────────────────────────────────────────────────────────────
export const MOCK_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    name: 'ApplyFlow',
    description: 'Job application tracking platform',
    color: '#6366f1',
    task_count: 8,
    completed_task_count: 3,
    created_at: fmt(subDays(today, 20)),
    updated_at: fmt(subDays(today, 2)),
  },
  {
    id: 'proj-2',
    name: 'Newsletter API',
    description: 'Email newsletter management system',
    color: '#22c55e',
    task_count: 5,
    completed_task_count: 5,
    created_at: fmt(subDays(today, 14)),
    updated_at: fmt(subDays(today, 1)),
  },
  {
    id: 'proj-3',
    name: 'Portfolio',
    description: 'Personal portfolio website redesign',
    color: '#f59e0b',
    task_count: 3,
    completed_task_count: 0,
    created_at: fmt(subDays(today, 7)),
    updated_at: fmt(today),
  },
]

// ── Tasks ─────────────────────────────────────────────────────────────────────
export const MOCK_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Design task management UI mockups',
    description: 'Create wireframes and high-fidelity mockups for the task management interface.',
    status: 'in_progress',
    priority: 'high',
    due_date: fmt(today),
    estimated_duration: 120,
    project: 'proj-1',
    project_name: 'ApplyFlow',
    category: 'Design',
    created_at: fmt(subDays(today, 3)),
    updated_at: fmt(today),
  },
  {
    id: 'task-2',
    title: 'Build authentication endpoints',
    description: 'Implement JWT authentication with register, login, refresh, and logout.',
    status: 'todo',
    priority: 'urgent',
    due_date: fmt(today),
    estimated_duration: 180,
    project: 'proj-1',
    project_name: 'ApplyFlow',
    category: 'Development',
    created_at: fmt(subDays(today, 5)),
    updated_at: fmt(subDays(today, 1)),
  },
  {
    id: 'task-3',
    title: 'Write API documentation',
    description: 'Document all REST endpoints using OpenAPI spec.',
    status: 'todo',
    priority: 'medium',
    due_date: fmt(addDays(today, 2)),
    estimated_duration: 90,
    project: 'proj-1',
    project_name: 'ApplyFlow',
    category: 'Documentation',
    created_at: fmt(subDays(today, 4)),
    updated_at: fmt(subDays(today, 1)),
  },
  {
    id: 'task-4',
    title: 'Set up CI/CD pipeline',
    description: 'Configure GitHub Actions for automated testing and deployment.',
    status: 'completed',
    priority: 'high',
    due_date: fmt(subDays(today, 1)),
    estimated_duration: 60,
    project: 'proj-2',
    project_name: 'Newsletter API',
    category: 'DevOps',
    created_at: fmt(subDays(today, 7)),
    updated_at: fmt(subDays(today, 1)),
    completed_at: fmt(subDays(today, 1)),
  },
  {
    id: 'task-5',
    title: 'Implement email template system',
    description: 'Build a flexible template system for newsletter emails.',
    status: 'completed',
    priority: 'high',
    due_date: fmt(subDays(today, 3)),
    estimated_duration: 240,
    project: 'proj-2',
    project_name: 'Newsletter API',
    category: 'Development',
    created_at: fmt(subDays(today, 10)),
    updated_at: fmt(subDays(today, 3)),
    completed_at: fmt(subDays(today, 3)),
  },
  {
    id: 'task-6',
    title: 'Review and fix subscription endpoint bugs',
    description: 'Fix reported issues with the subscription unsubscribe flow.',
    status: 'in_progress',
    priority: 'urgent',
    due_date: fmt(subDays(today, 1)), // overdue
    estimated_duration: 45,
    project: 'proj-2',
    project_name: 'Newsletter API',
    category: 'Development',
    created_at: fmt(subDays(today, 2)),
    updated_at: fmt(today),
  },
  {
    id: 'task-7',
    title: 'Redesign hero section',
    description: 'Update the landing page hero with new messaging and visuals.',
    status: 'todo',
    priority: 'medium',
    due_date: fmt(addDays(today, 5)),
    estimated_duration: 90,
    project: 'proj-3',
    project_name: 'Portfolio',
    category: 'Design',
    created_at: fmt(subDays(today, 2)),
    updated_at: fmt(subDays(today, 2)),
  },
  {
    id: 'task-8',
    title: 'Write unit tests for task service',
    description: 'Achieve >80% coverage for the task management service layer.',
    status: 'todo',
    priority: 'low',
    due_date: fmt(addDays(today, 7)),
    estimated_duration: 120,
    project: 'proj-1',
    project_name: 'ApplyFlow',
    category: 'Testing',
    created_at: fmt(subDays(today, 1)),
    updated_at: fmt(subDays(today, 1)),
  },
]

// ── Todos ─────────────────────────────────────────────────────────────────────
export const MOCK_TODOS: Todo[] = [
  {
    id: 'todo-1',
    title: 'Review pull request from teammate',
    completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'todo-2',
    title: 'Update project README',
    completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'todo-3',
    title: 'Schedule weekly sync',
    completed: true,
    created_at: subDays(today, 1).toISOString(),
    completed_at: new Date().toISOString(),
  },
  {
    id: 'todo-4',
    title: 'Buy domain for portfolio',
    completed: false,
    created_at: new Date().toISOString(),
  },
  {
    id: 'todo-5',
    title: 'Check hosting options',
    completed: true,
    created_at: subDays(today, 2).toISOString(),
    completed_at: subDays(today, 1).toISOString(),
  },
]

// ── Schedule events ────────────────────────────────────────────────────────────
export const MOCK_EVENTS: ScheduleEvent[] = [
  {
    id: 'event-1',
    title: 'Deep work: Authentication module',
    description: 'Focus session for building out the auth endpoints.',
    date: fmt(today),
    start_time: '09:00',
    end_time: '11:00',
    task: 'task-2',
    task_title: 'Build authentication endpoints',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'event-2',
    title: 'Team standup',
    date: fmt(today),
    start_time: '11:30',
    end_time: '12:00',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'event-3',
    title: 'UI mockup review',
    description: 'Review the design mockups for task management.',
    date: fmt(today),
    start_time: '14:00',
    end_time: '15:00',
    task: 'task-1',
    task_title: 'Design task management UI mockups',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'event-4',
    title: 'API documentation session',
    date: fmt(addDays(today, 1)),
    start_time: '10:00',
    end_time: '12:00',
    task: 'task-3',
    task_title: 'Write API documentation',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'event-5',
    title: 'Portfolio design review',
    date: fmt(addDays(today, 2)),
    start_time: '15:00',
    end_time: '16:00',
    task: 'task-7',
    task_title: 'Redesign hero section',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

// ── Weekly summary ─────────────────────────────────────────────────────────────
const weekStart = fmt(subDays(today, today.getDay())) // Sunday
const weekEnd = fmt(addDays(subDays(today, today.getDay()), 6)) // Saturday

export const MOCK_CURRENT_SUMMARY: WeeklySummary = {
  id: 'summary-current',
  week_start: weekStart,
  week_end: weekEnd,
  stats: {
    tasks_created: 5,
    tasks_completed: 3,
    tasks_overdue: 1,
    completion_rate: 75,
    todos_created: 4,
    todos_completed: 2,
    scheduled_hours: 8.5,
    completed_task_hours: 7,
  },
  analysis: {
    overview: 'You completed 3 of 4 tasks scheduled for this week, with strong focus time logged on Monday and Wednesday.',
    wins: [
      'Completed the email template system ahead of schedule',
      'Set up the CI/CD pipeline, unblocking the deployment workflow',
      'Maintained consistent deep-work sessions throughout the week',
    ],
    challenges: [
      'The subscription endpoint bugs carried over from last week',
      'API documentation has been pushed forward twice',
    ],
    patterns: [
      'Most productive work happens between 9 AM and 12 PM',
      'Design tasks tend to take longer than estimated',
    ],
    recommendation: 'Consider time-boxing the API documentation into 45-minute focused sessions to make steady progress without feeling overwhelmed by the full scope.',
  },
  analysis_status: 'available',
  created_at: new Date().toISOString(),
}

export const MOCK_PAST_SUMMARIES: WeeklySummary[] = [
  {
    id: 'summary-1',
    week_start: fmt(subDays(today, 14)),
    week_end: fmt(subDays(today, 8)),
    stats: {
      tasks_created: 6,
      tasks_completed: 5,
      tasks_overdue: 0,
      completion_rate: 83,
      todos_created: 6,
      todos_completed: 5,
      scheduled_hours: 12,
      completed_task_hours: 10,
    },
    analysis: {
      overview: 'A strong week with high task completion and no overdue items.',
      wins: ['Completed all development tasks', 'Zero overdue tasks'],
      challenges: ['One design task estimated incorrectly'],
      patterns: ['Evening sessions were less productive than morning ones'],
      recommendation: 'Front-load complex work in the morning when focus is highest.',
    },
    analysis_status: 'available',
    created_at: subDays(today, 8).toISOString(),
  },
  {
    id: 'summary-2',
    week_start: fmt(subDays(today, 21)),
    week_end: fmt(subDays(today, 15)),
    stats: {
      tasks_created: 4,
      tasks_completed: 2,
      tasks_overdue: 2,
      completion_rate: 50,
      todos_created: 3,
      todos_completed: 1,
      scheduled_hours: 6,
      completed_task_hours: 4,
    },
    analysis_status: 'unavailable',
    created_at: subDays(today, 15).toISOString(),
  },
]

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const MOCK_DASHBOARD: DashboardData = {
  today_tasks: MOCK_TASKS.filter(t => t.due_date === fmt(today)),
  overdue_tasks: MOCK_TASKS.filter(t =>
    t.due_date < fmt(today) && t.status !== 'completed' && t.status !== 'cancelled'
  ),
  in_progress_tasks: MOCK_TASKS.filter(t => t.status === 'in_progress'),
  today_events: MOCK_EVENTS.filter(e => e.date === fmt(today)),
  upcoming_events: MOCK_EVENTS.filter(e => e.date > fmt(today)).slice(0, 3),
  pending_todos: MOCK_TODOS.filter(t => !t.completed),
  completed_todos_today: MOCK_TODOS.filter(t => t.completed),
  today_completion_rate: 50,
  tasks_completed_today: 1,
  tasks_due_today: 2,
}

// ── Notifications ─────────────────────────────────────────────────────────────
export const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    type: 'task_due',
    title: 'Task due today',
    message: 'Build authentication endpoints is due today.',
    read: false,
    created_at: new Date().toISOString(),
    data: { task_id: 'task-2' },
  },
  {
    id: 'notif-2',
    type: 'weekly_summary',
    title: 'Weekly review ready',
    message: 'Your weekly summary for this week is ready to view.',
    read: false,
    created_at: new Date().toISOString(),
    data: { summary_id: 'summary-current' },
  },
]
