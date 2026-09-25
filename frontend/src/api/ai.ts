import { apiClient } from './client'
import type { AIGeneratePayload, AIGenerateResponse } from '@/types'

export const aiApi = {
  generateTasks: async (payload: AIGeneratePayload): Promise<AIGenerateResponse> => {
    const { data } = await apiClient.post('/ai/generate-tasks/', payload)
    return data
  },
}
