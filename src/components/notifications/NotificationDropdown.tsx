import { X, Bell, CheckSquare, Calendar, BarChart3 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/api/client'
import { cn, formatDateTime } from '@/lib/utils'
import type { Notification } from '@/types'

interface NotificationDropdownProps {
  onClose: () => void
}

const NOTIFICATION_ICONS = {
  task_due: CheckSquare,
  event_starting: Calendar,
  weekly_summary: BarChart3,
}

export default function NotificationDropdown({ onClose }: NotificationDropdownProps) {
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await apiClient.get('/notifications/')
      return data.results as Notification[]
    },
    staleTime: 1000 * 30,
  })

  const markReadMutation = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.patch(`/notifications/${id}/`, { read: true })
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose])

  const notifications = data ?? []
  const unreadCount = notifications.filter((n) => !n.read).length

  const handleNotificationClick = (n: Notification) => {
    markReadMutation.mutate(n.id)
    if (n.type === 'task_due' && n.data?.task_id) {
      navigate('/app/tasks')
    } else if (n.type === 'weekly_summary') {
      navigate('/app/reviews')
    } else if (n.type === 'event_starting') {
      navigate('/app/schedule')
    }
    onClose()
  }

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-80 bg-surface-elevated border border-border rounded-xl shadow-strong animate-fade-in z-50"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-text-muted" />
          <span className="text-sm font-semibold text-text-primary">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-brand-500 text-white text-2xs font-semibold">
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded text-text-muted hover:text-text-primary transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* List */}
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="py-8 text-center">
            <Bell className="w-8 h-8 text-text-disabled mx-auto mb-2" />
            <p className="text-sm text-text-muted">No notifications</p>
          </div>
        ) : (
          <ul>
            {notifications.map((n) => {
              const Icon = NOTIFICATION_ICONS[n.type] ?? Bell
              return (
                <li key={n.id}>
                  <button
                    onClick={() => handleNotificationClick(n)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-surface-overlay transition-colors',
                      !n.read && 'bg-brand-500/5'
                    )}
                  >
                    <div className={cn(
                      'mt-0.5 p-1.5 rounded-lg shrink-0',
                      !n.read ? 'bg-brand-500/15' : 'bg-surface-overlay'
                    )}>
                      <Icon className={cn('w-3.5 h-3.5', !n.read ? 'text-brand-400' : 'text-text-muted')} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn('text-sm leading-snug', n.read ? 'text-text-secondary' : 'text-text-primary font-medium')}>
                        {n.title}
                      </p>
                      <p className="text-xs text-text-muted mt-0.5 line-clamp-2">{n.message}</p>
                      <p className="text-2xs text-text-disabled mt-1">{formatDateTime(n.created_at)}</p>
                    </div>
                    {!n.read && (
                      <div className="w-1.5 h-1.5 rounded-full bg-brand-500 shrink-0 mt-1.5" />
                    )}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
