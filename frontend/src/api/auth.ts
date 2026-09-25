import { apiClient } from './client'
import type { AuthTokens, LoginPayload, OnboardingPayload, RegisterPayload, User } from '@/types'

export const authApi = {
  register: async (payload: RegisterPayload): Promise<{ user: User; tokens: AuthTokens }> => {
    const { data } = await apiClient.post('/auth/register/', payload)
    return data
  },

  login: async (payload: LoginPayload): Promise<{ user: User; tokens: AuthTokens }> => {
    const { data } = await apiClient.post('/auth/token/', payload)
    return data
  },

  logout: async (): Promise<void> => {
    const refresh = localStorage.getItem('pace_refresh_token')
    if (refresh) {
      await apiClient.post('/auth/token/blacklist/', { refresh }).catch(() => {})
    }
    localStorage.removeItem('pace_access_token')
    localStorage.removeItem('pace_refresh_token')
  },

  getMe: async (): Promise<User> => {
    const { data } = await apiClient.get('/auth/me/')
    return data
  },

  updateProfile: async (payload: Partial<Pick<User, 'name' | 'email' | 'productivity_preference' | 'default_category'>>): Promise<User> => {
    const { data } = await apiClient.patch('/auth/me/', payload)
    return data
  },

  completeOnboarding: async (payload: OnboardingPayload): Promise<User> => {
    const { data } = await apiClient.post('/auth/onboarding/', payload)
    return data
  },
}
