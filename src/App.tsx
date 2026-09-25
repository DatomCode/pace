import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useThemeStore } from '@/store/themeStore'
import { authApi } from '@/api/auth'

// Layouts
import AppShell from '@/components/layout/AppShell'
import PublicLayout from '@/components/layout/PublicLayout'

// Public pages
import LandingPage from '@/pages/public/LandingPage'
import LoginPage from '@/pages/public/LoginPage'
import RegisterPage from '@/pages/public/RegisterPage'

// Onboarding
import OnboardingPage from '@/pages/onboarding/OnboardingPage'

// App pages
import DashboardPage from '@/pages/app/DashboardPage'
import TasksPage from '@/pages/app/TasksPage'
import ProjectsPage from '@/pages/app/ProjectsPage'
import ProjectDetailPage from '@/pages/app/ProjectDetailPage'
import SchedulePage from '@/pages/app/SchedulePage'
import TodosPage from '@/pages/app/TodosPage'
import AIPage from '@/pages/app/AIPage'
import ReviewsPage from '@/pages/app/ReviewsPage'
import ReviewDetailPage from '@/pages/app/ReviewDetailPage'
import SettingsPage from '@/pages/app/SettingsPage'

// Guards
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import PublicOnlyRoute from '@/components/auth/PublicOnlyRoute'

export default function App() {
  const { isAuthenticated, setUser, setLoading, setTokens } = useAuthStore()
  const { theme } = useThemeStore()

  // Apply theme class
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  // Restore session on mount
  useEffect(() => {
    const token = localStorage.getItem('pace_access_token')
    if (!token) {
      setLoading(false)
      return
    }
    // Tokens exist in localStorage — hydrate user from API
    authApi.getMe()
      .then((user) => {
        setUser(user)
      })
      .catch(() => {
        // Token invalid — clear state
        localStorage.removeItem('pace_access_token')
        localStorage.removeItem('pace_refresh_token')
        setLoading(false)
      })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route element={<PublicOnlyRoute />}>
          <Route path="/" element={<PublicLayout />}>
            <Route index element={<LandingPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
        </Route>

        {/* Onboarding — protected but separate from app shell */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
        </Route>

        {/* App — protected with sidebar shell */}
        <Route element={<ProtectedRoute />}>
          <Route path="/app" element={<AppShell />}>
            <Route index element={<Navigate to="/app/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="tasks" element={<TasksPage />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="schedule" element={<SchedulePage />} />
            <Route path="todos" element={<TodosPage />} />
            <Route path="ai" element={<AIPage />} />
            <Route path="reviews" element={<ReviewsPage />} />
            <Route path="reviews/:id" element={<ReviewDetailPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
