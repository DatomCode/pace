import { Settings, Bell } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { useAuthStore } from '@/store/authStore'
import NotificationDropdown from '@/components/notifications/NotificationDropdown'

export default function TopBar() {
  const { user } = useAuthStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const navigate = useNavigate()

  const today = format(new Date(), 'EEEE, MMMM d')

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 bg-bg/80 backdrop-blur-sm border-b border-border shrink-0 sticky top-0 z-20">
        {/* Left: Date */}
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-text-muted">{today}</span>
        </div>

        {/* Right: Notifications + Settings */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {/* Unread dot */}
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-brand-500" />
            </button>
            {notifOpen && (
              <NotificationDropdown onClose={() => setNotifOpen(false)} />
            )}
          </div>

          <button
            onClick={() => navigate('/app/settings')}
            className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>
    </>
  )
}
