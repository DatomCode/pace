import { NavLink, Link, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  CheckSquare,
  FolderOpen,
  Calendar,
  ListTodo,
  Sparkles,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { authApi } from '@/api/auth'

const NAV_SECTIONS = [
  {
    label: 'Execute',
    items: [
      { to: '/app/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    ],
  },
  {
    label: 'Plan',
    items: [
      { to: '/app/tasks', icon: CheckSquare, label: 'Tasks' },
      { to: '/app/projects', icon: FolderOpen, label: 'Projects' },
      { to: '/app/todos', icon: ListTodo, label: 'Todos' },
      { to: '/app/ai', icon: Sparkles, label: 'AI Planning' },
    ],
  },
  {
    label: 'Schedule',
    items: [
      { to: '/app/schedule', icon: Calendar, label: 'Schedule' },
    ],
  },
  {
    label: 'Review',
    items: [
      { to: '/app/reviews', icon: BarChart3, label: 'Weekly Reviews' },
    ],
  },
]

export default function Sidebar() {
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await authApi.logout()
    logout()
    navigate('/login')
  }

  return (
    <aside
      className={cn(
        'hidden md:flex relative bg-surface border-border transition-all duration-300 ease-in-out shrink-0 z-40',
        'flex-col',
        'h-[100dvh] w-full border-r',
        sidebarOpen ? 'w-[220px]' : 'w-[60px]'
      )}
    >
      <div className={cn(
        'hidden md:flex items-center h-14 border-b border-border px-3 shrink-0',
        sidebarOpen ? 'gap-3' : 'justify-center'
      )}>
        <Link to="/" className={cn(
          "flex items-center hover:opacity-80 transition-opacity",
          sidebarOpen ? 'gap-3' : 'justify-center'
        )}>
          {/* P logo mark */}
          <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center shrink-0">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          {sidebarOpen && (
            <span className="font-semibold text-text-primary text-base tracking-tight">Pace</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 flex md:block overflow-x-auto overflow-y-hidden md:overflow-y-auto md:overflow-x-hidden md:py-4 md:px-2 md:space-y-5 scrollbar-hide h-full items-center">
        <div className="flex md:block h-full items-center px-2 md:px-0 gap-1 md:gap-0">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label} className="flex md:block items-center h-full md:h-auto">
              {sidebarOpen && (
                <p className="hidden md:block px-3 mb-1 text-2xs font-semibold uppercase tracking-widest text-text-disabled">
                  {section.label}
                </p>
              )}
              <ul className="flex md:block items-center h-full md:h-auto md:space-y-0.5 space-x-1 md:space-x-0">
                {section.items.map((item) => (
                  <li key={item.to} className="flex items-center h-full md:h-auto">
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        cn(
                          'nav-item',
                          isActive && 'active text-text-primary bg-brand-500/10',
                          'w-14 h-14 md:w-auto md:h-auto flex-col md:flex-row justify-center md:justify-start px-0 md:px-3 text-[10px] md:text-sm gap-1 md:gap-3',
                          !sidebarOpen && 'md:justify-center md:px-0'
                        )
                      }
                      title={!sidebarOpen ? item.label : undefined}
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon
                            className={cn(
                              'w-5 h-5 md:w-4 md:h-4 shrink-0',
                              isActive ? 'text-brand-400' : 'text-text-muted'
                            )}
                          />
                          {sidebarOpen && (
                            <span className={cn('hidden md:block', isActive ? 'text-text-primary' : '')}>
                              {item.label}
                            </span>
                          )}
                          {!sidebarOpen && (
                            <span className={cn('md:hidden', isActive ? 'text-text-primary' : 'text-text-muted')}>
                              {item.label}
                            </span>
                          )}
                          {sidebarOpen && isActive && (
                            <div className="hidden md:block ml-auto w-1.5 h-1.5 rounded-full bg-brand-500" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom: Settings + User */}
      <div className="flex md:block items-center border-l md:border-l-0 md:border-t border-border p-2 md:space-y-0.5 shrink-0 h-full md:h-auto">
        <NavLink
          to="/app/settings"
          className={({ isActive }) =>
            cn(
              'nav-item',
              isActive && 'active',
              'w-14 h-14 md:w-auto md:h-auto flex-col md:flex-row justify-center md:justify-start px-0 md:px-3 text-[10px] md:text-sm gap-1 md:gap-3',
              !sidebarOpen && 'md:justify-center md:px-0'
            )
          }
          title={!sidebarOpen ? 'Settings' : undefined}
        >
          {({ isActive }) => (
            <>
              <Settings className="w-5 h-5 md:w-4 md:h-4 shrink-0 text-text-muted" />
              {sidebarOpen && <span className="hidden md:block">Settings</span>}
              {!sidebarOpen && (
                <span className={cn('md:hidden', isActive ? 'text-text-primary' : 'text-text-muted')}>
                  Settings
                </span>
              )}
            </>
          )}
        </NavLink>

        {/* User block */}
        <div className={cn(
          'hidden md:flex items-center gap-2.5 px-3 py-2 rounded-lg',
          !sidebarOpen && 'justify-center px-0'
        )}>
          <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
            <span className="text-brand-400 text-2xs font-semibold">
              {user?.name?.[0]?.toUpperCase() ?? 'U'}
            </span>
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-text-primary truncate">{user?.name}</p>
              <p className="text-2xs text-text-muted truncate">{user?.email}</p>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={handleLogout}
              className="p-1 rounded text-text-muted hover:text-text-primary hover:bg-surface-overlay transition-colors"
              title="Logout"
              aria-label="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-surface border border-border items-center justify-center text-text-muted hover:text-text-primary hover:border-brand-500/50 transition-all z-10"
        aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
      >
        {sidebarOpen ? (
          <ChevronLeft className="w-3 h-3" />
        ) : (
          <ChevronRight className="w-3 h-3" />
        )}
      </button>
    </aside>
  )
}
