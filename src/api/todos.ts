import { apiClient } from './client'
import type { CreateTodoPayload, PaginatedResponse, Todo } from '@/types'

export const todosApi = {
  list: async (): Promise<PaginatedResponse<Todo>> => {
    const { data } = await apiClient.get('/todos/')
    return data
  },

  create: async (payload: CreateTodoPayload): Promise<Todo> => {
    const { data } = await apiClient.post('/todos/', payload)
    return data
  },

  toggle: async (id: string, completed: boolean): Promise<Todo> => {
    const { data } = await apiClient.patch(`/todos/${id}/`, { completed })
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/todos/${id}/`)
  },
}
