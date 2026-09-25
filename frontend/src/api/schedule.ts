import { apiClient } from './client'
import type {
  CreateScheduleEventPayload,
  PaginatedResponse,
  ScheduleConflict,
  ScheduleEvent,
} from '@/types'

export interface EventFilters {
  date?: string
  date_from?: string
  date_to?: string
}

export const scheduleApi = {
  list: async (filters?: EventFilters): Promise<PaginatedResponse<ScheduleEvent>> => {
    const { data } = await apiClient.get('/schedule/', { params: filters })
    return data
  },

  get: async (id: string): Promise<ScheduleEvent> => {
    const { data } = await apiClient.get(`/schedule/${id}/`)
    return data
  },

  create: async (
    payload: CreateScheduleEventPayload,
    force?: boolean
  ): Promise<ScheduleEvent | { conflict: ScheduleConflict; event: CreateScheduleEventPayload }> => {
    const { data } = await apiClient.post('/schedule/', { ...payload, force_create: force ?? false })
    return data
  },

  update: async (
    id: string,
    payload: Partial<CreateScheduleEventPayload>,
    force?: boolean
  ): Promise<ScheduleEvent> => {
    const { data } = await apiClient.patch(`/schedule/${id}/`, { ...payload, force_update: force ?? false })
    return data
  },

  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/schedule/${id}/`)
  },

  getForDate: async (date: string): Promise<ScheduleEvent[]> => {
    const { data } = await apiClient.get('/schedule/', { params: { date } })
    return data.results ?? data
  },

  getForWeek: async (dateFrom: string, dateTo: string): Promise<ScheduleEvent[]> => {
    const { data } = await apiClient.get('/schedule/', {
      params: { date_from: dateFrom, date_to: dateTo },
    })
    return data.results ?? data
  },
}
