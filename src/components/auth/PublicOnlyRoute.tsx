import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export default function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuthStore()

  // Don't redirect while checking auth status
  if (isLoading) return null

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />
  }

  return <Outlet />
}
