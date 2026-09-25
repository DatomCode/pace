import { apiClient } from './client'
import type { CreateTaskPayload, PaginatedResponse, Task, UpdateTaskPayload } from '@/types'

export interface TaskFilters {
  status?: string
  priority?: string
  project?: string
  category?: string
  due_state?: 'today' | 'upcoming' | 'overdue'
  search?: string
  ordering?: string
}

export const tasksApi = {
  list: async (filters?: TaskFilters): Promise<PaginatedResponse<Task>> => {
    const { data } = await apiClient.get('/tasks/', { params: filters })
    return data
  },

  get: async (id: string): Promise<Task> => {
    const { data } = await apiClient.get(`/tasks/${id}/`)
    return data
  },

  create: async (payload: CreateTaskPayload): Promise<Task> => {
    const { data } = await apiClient.post('/tasks/', payload)
    return data
  },

  update: async (id: string, payload: UpdateTaskPayload): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${id}/`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/tasks/${id}/`)
  },

  updateStatus: async (id: string, status: Task['status']): Promise<Task> => {
    const { data } = await apiClient.patch(`/tasks/${id}/`, { status })
    return data
  },

  getToday: async (): Promise<Task[]> => {
    const { data } = await apiClient.get('/tasks/', { params: { due_state: 'today' } })
    return data.results ?? data
  },

  getOverdue: async (): Promise<Task[]> => {
    const { data } = await apiClient.get('/tasks/', { params: { due_state: 'overdue' } })
    return data.results ?? data
  },
}
