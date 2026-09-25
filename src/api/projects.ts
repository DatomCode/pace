import { apiClient } from './client'
import type { CreateProjectPayload, PaginatedResponse, Project, Task } from '@/types'

export const projectsApi = {
  list: async (): Promise<PaginatedResponse<Project>> => {
    const { data } = await apiClient.get('/projects/')
    return data
  },

  get: async (id: string): Promise<Project> => {
    const { data } = await apiClient.get(`/projects/${id}/`)
    return data
  },

  create: async (payload: CreateProjectPayload): Promise<Project> => {
    const { data } = await apiClient.post('/projects/', payload)
    return data
  },

  update: async (id: string, payload: Partial<CreateProjectPayload>): Promise<Project> => {
    const { data } = await apiClient.patch(`/projects/${id}/`, payload)
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${id}/`)
  },

  getTasks: async (id: string): Promise<PaginatedResponse<Task>> => {
    const { data } = await apiClient.get(`/projects/${id}/tasks/`)
    return data
  },
}
