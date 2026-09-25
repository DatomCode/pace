import { apiClient } from './client'
import type { DashboardData } from '@/types'

export const dashboardApi = {
  getData: async (): Promise<DashboardData> => {
    const { data } = await apiClient.get('/dashboard/')
    return data
  },
}
