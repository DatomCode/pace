import { apiClient } from './client'
import type { PaginatedResponse, WeeklySummary } from '@/types'

export const summariesApi = {
  list: async (): Promise<PaginatedResponse<WeeklySummary>> => {
    const { data } = await apiClient.get('/summaries/')
    return data
  },

  get: async (id: string): Promise<WeeklySummary> => {
    const { data } = await apiClient.get(`/summaries/${id}/`)
    return data
  },

  getCurrent: async (): Promise<WeeklySummary> => {
    const { data } = await apiClient.get('/summaries/current/')
    return data
  },

  retryAnalysis: async (id: string): Promise<WeeklySummary> => {
    const { data } = await apiClient.post(`/summaries/${id}/retry-analysis/`)
    return data
  },
}
