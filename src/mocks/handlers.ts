/**
 * Mock API handlers — intercept apiClient calls when VITE_MOCK_API=true.
 * Uses Axios adapter approach with simulated latency.
 */
import type {
  Task, Todo, Project, ScheduleEvent, WeeklySummary, AISuggestion
} from '@/types'
import {
  MOCK_USER, MOCK_TASKS, MOCK_TODOS, MOCK_PROJECTS,
  MOCK_EVENTS, MOCK_CURRENT_SUMMARY, MOCK_PAST_SUMMARIES,
  MOCK_DASHBOARD, MOCK_NOTIFICATIONS,
} from './data'
import { apiClient } from '@/api/client'
import type { AxiosRequestConfig } from 'axios'
import { format, addDays } from 'date-fns'

// ── State (in-memory store) ───────────────────────────────────────────────────
let tasks: Task[] = [...MOCK_TASKS]
let todos: Todo[] = [...MOCK_TODOS]
let projects: Project[] = [...MOCK_PROJECTS]
let events: ScheduleEvent[] = [...MOCK_EVENTS]
let summaries: WeeklySummary[] = [MOCK_CURRENT_SUMMARY, ...MOCK_PAST_SUMMARIES]

let idCounter = 1000
const genId = () => `mock-${++idCounter}`

// ── Delay helper ───────────────────────────────────────────────────────────────
const delay = (ms: number) => new Promise((r) => setTimeout(r, ms))
const jitter = () => 300 + Math.random() * 300

// ── Paginate helper ───────────────────────────────────────────────────────────
function paginate<T>(items: T[]) {
  return { count: items.length, next: null, previous: null, results: items }
}

// ── Route matching ────────────────────────────────────────────────────────────
type Handler = (config: AxiosRequestConfig, match: RegExpMatchArray) => Promise<unknown>

const routes: Array<{ method: string; pattern: RegExp; handler: Handler }> = []

function route(method: string, pattern: RegExp, handler: Handler) {
  routes.push({ method: method.toUpperCase(), pattern, handler })
}

// ── Auth routes ────────────────────────────────────────────────────────────────
route('POST', /\/auth\/register\/$/, async (config) => {
  await delay(jitter())
  const body = JSON.parse(config.data ?? '{}')
  if (!body.email || !body.password) {
    throw { response: { status: 400, data: { email: ['This field is required.'] } } }
  }
  return { user: { ...MOCK_USER, name: body.name, email: body.email }, tokens: { access: 'mock-access-token', refresh: 'mock-refresh-token' } }
})

route('POST', /\/auth\/token\/$/, async (config) => {
  await delay(jitter())
  const body = JSON.parse(config.data ?? '{}')
  if (body.password === 'wrong') {
    throw { response: { status: 401, data: { detail: 'Invalid credentials.' } } }
  }
  return { user: MOCK_USER, tokens: { access: 'mock-access-token', refresh: 'mock-refresh-token' } }
})

route('GET', /\/auth\/me\/$/, async () => {
  await delay(200)
  return MOCK_USER
})

route('PATCH', /\/auth\/me\/$/, async (config) => {
  await delay(jitter())
  const body = JSON.parse(config.data ?? '{}')
  return { ...MOCK_USER, ...body }
})

route('POST', /\/auth\/onboarding\/$/, async (config) => {
  await delay(jitter())
  const body = JSON.parse(config.data ?? '{}')
  return { ...MOCK_USER, productivity_preference: body.purpose, onboarding_completed: true }
})

route('POST', /\/auth\/token\/blacklist\/$/, async () => { await delay(100); return {} })
route('POST', /\/auth\/token\/refresh\/$/, async () => { return { access: 'mock-access-token' } })

// ── Dashboard ──────────────────────────────────────────────────────────────────
route('GET', /\/dashboard\/$/, async () => {
  await delay(jitter())
  const today = format(new Date(), 'yyyy-MM-dd')
  return {
    ...MOCK_DASHBOARD,
    today_tasks: tasks.filter(t => t.due_date === today),
    overdue_tasks: tasks.filter(t => t.due_date < today && t.status !== 'completed' && t.status !== 'cancelled'),
    in_progress_tasks: tasks.filter(t => t.status === 'in_progress'),
    today_events: events.filter(e => e.date === today),
    pending_todos: todos.filter(t => !t.completed),
  }
})

// ── Tasks ──────────────────────────────────────────────────────────────────────
route('GET', /\/tasks\/$/, async (config) => {
  await delay(jitter())
  const params = config.params ?? {}
  let result = [...tasks]

  if (params.status) result = result.filter(t => t.status === params.status)
  if (params.priority) result = result.filter(t => t.priority === params.priority)
  if (params.project) result = result.filter(t => t.project === params.project)
  if (params.category) result = result.filter(t => t.category === params.category)
  if (params.search) {
    const q = params.search.toLowerCase()
    result = result.filter(t => t.title.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q))
  }
  if (params.due_state === 'today') {
    const today = format(new Date(), 'yyyy-MM-dd')
    result = result.filter(t => t.due_date === today)
  } else if (params.due_state === 'overdue') {
    const today = format(new Date(), 'yyyy-MM-dd')
    result = result.filter(t => t.due_date < today && t.status !== 'completed' && t.status !== 'cancelled')
  } else if (params.due_state === 'upcoming') {
    const today = format(new Date(), 'yyyy-MM-dd')
    result = result.filter(t => t.due_date > today)
  }

  if (params.ordering) {
    const desc = params.ordering.startsWith('-')
    const key = desc ? params.ordering.slice(1) : params.ordering
    result.sort((a, b) => {
      const av = (a as any)[key] as string ?? ''
      const bv = (b as any)[key] as string ?? ''
      return desc ? bv.localeCompare(av) : av.localeCompare(bv)
    })
  }

  return paginate(result)
})

route('GET', /\/tasks\/([^/]+)\/$/, async (_config, match) => {
  await delay(200)
  const task = tasks.find(t => t.id === match[1])
  if (!task) throw { response: { status: 404, data: { detail: 'Not found.' } } }
  return task
})

route('POST', /\/tasks\/$/, async (config) => {
  await delay(jitter())
  const body = JSON.parse(config.data ?? '{}')
  if (!body.title) throw { response: { status: 400, data: { title: ['This field is required.'] } } }
  const project = projects.find(p => p.id === body.project)
  const newTask: Task = {
    id: genId(),
    title: body.title,
    description: body.description ?? '',
    status: body.status ?? 'todo',
    priority: body.priority ?? 'medium',
    due_date: body.due_date,
    estimated_duration: body.estimated_duration,
    project: body.project,
    project_name: project?.name,
    category: body.category,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  tasks = [newTask, ...tasks]
  if (project) {
    projects = projects.map(p => p.id === project.id ? { ...p, task_count: p.task_count + 1 } : p)
  }
  return newTask
})

route('PATCH', /\/tasks\/([^/]+)\/$/, async (config, match) => {
  await delay(jitter())
  const body = JSON.parse(config.data ?? '{}')
  const task = tasks.find(t => t.id === match[1])
  if (!task) throw { response: { status: 404, data: { detail: 'Not found.' } } }

  // Status transition validation
  const ALLOWED: Record<string, string[]> = {
    todo: ['in_progress', 'completed', 'cancelled'],
    in_progress: ['todo', 'completed', 'cancelled'],
    completed: ['todo'],
    cancelled: ['todo'],
  }
  if (body.status && body.status !== task.status) {
    if (!ALLOWED[task.status]?.includes(body.status)) {
      throw { response: { status: 400, data: { status: [`Cannot transition from ${task.status} to ${body.status}.`] } } }
    }
  }

  const updated: Task = {
    ...task,
    ...body,
    updated_at: new Date().toISOString(),
    completed_at: body.status === 'completed' ? new Date().toISOString() : task.completed_at,
  }
  tasks = tasks.map(t => t.id === match[1] ? updated : t)

  // Update project counts
  if (body.status === 'completed' && task.status !== 'completed' && task.project) {
    projects = projects.map(p => p.id === task.project
      ? { ...p, completed_task_count: p.completed_task_count + 1 }
      : p
    )
  } else if (task.status === 'completed' && body.status && body.status !== 'completed' && task.project) {
    projects = projects.map(p => p.id === task.project
      ? { ...p, completed_task_count: Math.max(0, p.completed_task_count - 1) }
      : p
    )
  }

  return updated
})

route('DELETE', /\/tasks\/([^/]+)\/$/, async (_config, match) => {
  await delay(jitter())
  const task = tasks.find(t => t.id === match[1])
  if (!task) throw { response: { status: 404, data: { detail: 'Not found.' } } }
  tasks = tasks.filter(t => t.id !== match[1])
  if (task.project) {
    projects = projects.map(p => p.id === task.project
      ? { ...p, task_count: Math.max(0, p.task_count - 1) }
      : p
    )
  }
  return null
})

// ── Projects ──────────────────────────────────────────────────────────────────
route('GET', /\/projects\/$/, async () => {
  await delay(jitter())
  return paginate(projects)
})

route('GET', /\/projects\/([^/]+)\/$/, async (_config, match) => {
  await delay(200)
  const proj = projects.find(p => p.id === match[1])
  if (!proj) throw { response: { status: 404, data: { detail: 'Not found.' } } }
  return proj
})

route('POST', /\/projects\/$/, async (config) => {
  await delay(jitter())
  const body = JSON.parse(config.data ?? '{}')
  if (!body.name) throw { response: { status: 400, data: { name: ['This field is required.'] } } }
  const newProj: Project = {
    id: genId(),
    name: body.name,
    description: body.description,
    color: body.color ?? '#6366f1',
    task_count: 0,
    completed_task_count: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  projects = [newProj, ...projects]
  return newProj
})

route('PATCH', /\/projects\/([^/]+)\/$/, async (config, match) => {
  await delay(jitter())
  const body = JSON.parse(config.data ?? '{}')
  const proj = projects.find(p => p.id === match[1])
  if (!proj) throw { response: { status: 404, data: { detail: 'Not found.' } } }
  const updated = { ...proj, ...body, updated_at: new Date().toISOString() }
  projects = projects.map(p => p.id === match[1] ? updated : p)
  return updated
})

route('DELETE', /\/projects\/([^/]+)\/$/, async (_config, match) => {
  await delay(jitter())
  projects = projects.filter(p => p.id !== match[1])
  return null
})

route('GET', /\/projects\/([^/]+)\/tasks\/$/, async (_config, match) => {
  await delay(jitter())
  return paginate(tasks.filter(t => t.project === match[1]))
})

// ── Todos ──────────────────────────────────────────────────────────────────────
route('GET', /\/todos\/$/, async () => {
  await delay(jitter())
  return paginate(todos)
})

route('POST', /\/todos\/$/, async (config) => {
  await delay(jitter())
  const body = JSON.parse(config.data ?? '{}')
  if (!body.title) throw { response: { status: 400, data: { title: ['This field is required.'] } } }
  const newTodo: Todo = {
    id: genId(),
    title: body.title,
    completed: false,
    created_at: new Date().toISOString(),
  }
  todos = [newTodo, ...todos]
  return newTodo
})

route('PATCH', /\/todos\/([^/]+)\/$/, async (config, match) => {
  await delay(jitter())
  const body = JSON.parse(config.data ?? '{}')
  const todo = todos.find(t => t.id === match[1])
  if (!todo) throw { response: { status: 404, data: { detail: 'Not found.' } } }
  const updated: Todo = {
    ...todo,
    ...body,
    completed_at: body.completed ? new Date().toISOString() : undefined,
  }
  todos = todos.map(t => t.id === match[1] ? updated : t)
  return updated
})

route('DELETE', /\/todos\/([^/]+)\/$/, async (_config, match) => {
  await delay(jitter())
  todos = todos.filter(t => t.id !== match[1])
  return null
})

// ── Schedule ──────────────────────────────────────────────────────────────────
route('GET', /\/schedule\/$/, async (config) => {
  await delay(jitter())
  const params = config.params ?? {}
  let result = [...events]
  if (params.date) result = result.filter(e => e.date === params.date)
  if (params.date_from) result = result.filter(e => e.date >= params.date_from)
  if (params.date_to) result = result.filter(e => e.date <= params.date_to)
  result.sort((a, b) => `${a.date}${a.start_time}`.localeCompare(`${b.date}${b.start_time}`))
  return paginate(result)
})

route('GET', /\/schedule\/([^/]+)\/$/, async (_config, match) => {
  await delay(200)
  const event = events.find(e => e.id === match[1])
  if (!event) throw { response: { status: 404, data: { detail: 'Not found.' } } }
  return event
})

route('POST', /\/schedule\/$/, async (config) => {
  await delay(jitter())
  const body = JSON.parse(config.data ?? '{}')
  if (!body.title) throw { response: { status: 400, data: { title: ['This field is required.'] } } }
  if (body.start_time >= body.end_time) {
    throw { response: { status: 400, data: { non_field_errors: ['End time must be after start time.'] } } }
  }

  // Check for conflict
  if (!body.force_create) {
    const conflict = events.find(e =>
      e.date === body.date &&
      e.start_time < body.end_time &&
      e.end_time > body.start_time
    )
    if (conflict) {
      throw {
        response: {
          status: 409,
          data: {
            detail: 'This event overlaps with another scheduled event.',
            conflicting_event: conflict,
          }
        }
      }
    }
  }

  const task = tasks.find(t => t.id === body.task)
  const newEvent: ScheduleEvent = {
    id: genId(),
    title: body.title,
    description: body.description,
    date: body.date,
    start_time: body.start_time,
    end_time: body.end_time,
    task: body.task,
    task_title: task?.title,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
  events = [...events, newEvent]
  return newEvent
})

route('PATCH', /\/schedule\/([^/]+)\/$/, async (config, match) => {
  await delay(jitter())
  const body = JSON.parse(config.data ?? '{}')
  const event = events.find(e => e.id === match[1])
  if (!event) throw { response: { status: 404, data: { detail: 'Not found.' } } }
  const updated = { ...event, ...body, updated_at: new Date().toISOString() }
  events = events.map(e => e.id === match[1] ? updated : e)
  return updated
})

route('DELETE', /\/schedule\/([^/]+)\/$/, async (_config, match) => {
  await delay(jitter())
  events = events.filter(e => e.id !== match[1])
  return null
})

// ── AI ─────────────────────────────────────────────────────────────────────────
route('POST', /\/ai\/generate-tasks\/$/, async (config) => {
  await delay(2000 + Math.random() * 1000) // AI takes longer
  const body = JSON.parse(config.data ?? '{}')
  const goal = body.goal ?? ''

  // Simulate AI generating tasks
  const suggestions: Omit<AISuggestion, 'id'>[] = [
    {
      title: `Research and plan: ${goal}`,
      description: 'Gather requirements, research best practices, and create a high-level plan.',
      priority: 'high',
      estimated_duration: 60,
      category: 'Planning',
    },
    {
      title: 'Set up project structure',
      description: 'Initialize the project repository, folder structure, and tooling.',
      priority: 'high',
      estimated_duration: 30,
      category: 'Development',
    },
    {
      title: 'Build core functionality',
      description: 'Implement the main features based on the requirements gathered.',
      priority: 'urgent',
      estimated_duration: 240,
      category: 'Development',
    },
    {
      title: 'Add error handling and validation',
      description: 'Ensure all user inputs are validated and errors are handled gracefully.',
      priority: 'medium',
      estimated_duration: 90,
      category: 'Development',
    },
    {
      title: 'Write tests',
      description: 'Write unit and integration tests to ensure reliability.',
      priority: 'medium',
      estimated_duration: 120,
      category: 'Testing',
    },
    {
      title: 'Review, polish, and deploy',
      description: 'Final review of code quality, UI polish, and deployment to production.',
      priority: 'high',
      estimated_duration: 60,
      category: 'DevOps',
    },
  ]

  return { goal, suggestions }
})

// ── Summaries ─────────────────────────────────────────────────────────────────
route('GET', /\/summaries\/$/, async () => {
  await delay(jitter())
  return paginate(summaries)
})

route('GET', /\/summaries\/current\/$/, async () => {
  await delay(jitter())
  return summaries[0]
})

route('GET', /\/summaries\/([^/]+)\/$/, async (_config, match) => {
  await delay(200)
  const s = summaries.find(s => s.id === match[1])
  if (!s) throw { response: { status: 404, data: { detail: 'Not found.' } } }
  return s
})

route('POST', /\/summaries\/([^/]+)\/retry-analysis\/$/, async (_config, match) => {
  await delay(2000)
  const s = summaries.find(s => s.id === match[1])
  if (!s) throw { response: { status: 404, data: { detail: 'Not found.' } } }
  const updated = { ...s, analysis_status: 'available' as const, analysis: MOCK_CURRENT_SUMMARY.analysis }
  summaries = summaries.map(s => s.id === match[1] ? updated : s)
  return updated
})

// ── Notifications ─────────────────────────────────────────────────────────────
route('GET', /\/notifications\/$/, async () => {
  await delay(300)
  return paginate(MOCK_NOTIFICATIONS)
})

// ── Adapter setup ─────────────────────────────────────────────────────────────
export function setupMockApi() {
  const originalAdapter = apiClient.defaults.adapter

  apiClient.defaults.adapter = (async (config: AxiosRequestConfig) => {
    const url = config.url ?? ''
    const method = (config.method ?? 'GET').toUpperCase()

    for (const r of routes) {
      if (r.method !== method) continue
      const match = url.match(r.pattern)
      if (match) {
        try {
          const data = await r.handler(config, match)
          return {
            data,
            status: data === null ? 204 : 200,
            statusText: 'OK',
            headers: {},
            config,
          }
        } catch (error: unknown) {
          // Re-throw structured errors so Axios interceptors handle them
          if (
            error &&
            typeof error === 'object' &&
            'response' in error
          ) {
            const structured = error as { response: { status: number; data: unknown } }
            throw {
              isAxiosError: true,
              response: structured.response,
              config,
              message: String((structured.response.data as Record<string, unknown>)?.detail ?? 'Error'),
            }
          }
          throw error
        }
      }
    }

    // Fallthrough — not mocked
    console.warn(`[Mock API] No handler for ${method} ${url}`)
    throw {
      isAxiosError: true,
      response: { status: 404, data: { detail: 'Not found in mock API.' } },
      config,
      message: 'Not found in mock API.',
    }
  }) as any

  console.info('[Mock API] Enabled — using in-memory mock data.')
  return () => {
    apiClient.defaults.adapter = originalAdapter
  }
}
