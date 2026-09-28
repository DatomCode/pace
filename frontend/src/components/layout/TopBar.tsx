import { Bell, Settings } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import NotificationDropdown from '@/components/notifications/NotificationDropdown'

// Generates initials from a full name: "Enoch Mensah" → "EM"
function getInitials(name?: string): string {
  if (!name) return '?'
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export default function TopBar() {
  const { user } = useAuthStore()
  const [notifOpen, setNotifOpen] = useState(false)
  const navigate = useNavigate()
  const initials = getInitials(user?.name)

  return (
    <>
      <header className="h-14 flex items-center justify-between px-4 bg-bg/80 backdrop-blur-sm border-b border-border shrink-0 sticky top-0 z-20">

        {/* Left: User Avatar */}
        <button
          onClick={() => navigate('/app/settings')}
          className="flex items-center gap-2.5 group"
          aria-label="Profile & Settings"
        >
          <div
            className="flex items-center justify-center size-9 rounded-full text-white font-bold text-sm shrink-0 shadow-sm ring-2 ring-white dark:ring-border group-hover:ring-brand-500 transition-all"
            style={{ background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' }}
          >
            {initials}
          </div>
          <div className="leading-none text-left hidden sm:block">
            <p className="text-sm font-semibold text-text-primary">{user?.name ?? 'Profile'}</p>
          </div>
        </button>

        {/* Right: Notifications + Settings */}
        <div className="flex items-center gap-1">
          <div className="relative">
            <button
              onClick={() => setNotifOpen((v) => !v)}
              className="relative p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-500 ring-2 ring-bg" />
            </button>
            {notifOpen && (
              <NotificationDropdown onClose={() => setNotifOpen(false)} />
            )}
          </div>

          <button
            onClick={() => navigate('/app/settings')}
            className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors"
            aria-label="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>

      </header>
    </>
  )
}
