import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { LayoutDashboard, CheckSquare, Plus, Calendar, BarChart3, ListTodo, Sparkles, FolderOpen, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function MobileBottomNav() {
  const [showCreateMenu, setShowCreateMenu] = useState(false)
  const navigate = useNavigate()

  const handleAction = (path: string) => {
    setShowCreateMenu(false)
    navigate(path)
  }

  return (
    <>
      {/* Create Action Menu Overlay */}
      {showCreateMenu && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden">
          <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={() => setShowCreateMenu(false)} />
          <div className="relative bg-surface border-t border-border rounded-t-2xl p-6 pb-12 animate-slide-up">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-text-primary">Create New</h3>
              <button onClick={() => setShowCreateMenu(false)} className="p-2 bg-surface-overlay rounded-full">
                <X className="w-5 h-5 text-text-muted" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => handleAction('/app/tasks')} className="flex flex-col items-center justify-center p-4 bg-brand-500/10 border border-brand-500/20 rounded-xl text-brand-400 gap-3">
                <CheckSquare className="w-6 h-6" />
                <span className="font-medium text-sm">Task</span>
              </button>
              <button onClick={() => handleAction('/app/ai')} className="flex flex-col items-center justify-center p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 gap-3">
                <Sparkles className="w-6 h-6" />
                <span className="font-medium text-sm">Plan with AI</span>
              </button>
              <button onClick={() => handleAction('/app/todos')} className="flex flex-col items-center justify-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400 gap-3">
                <ListTodo className="w-6 h-6" />
                <span className="font-medium text-sm">Todo</span>
              </button>
              <button onClick={() => handleAction('/app/projects')} className="flex flex-col items-center justify-center p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 gap-3">
                <FolderOpen className="w-6 h-6" />
                <span className="font-medium text-sm">Project</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="md:hidden flex items-center justify-between px-6 h-[72px] bg-surface border-t border-border shrink-0 pb-safe">
        
        {/* Dashboard */}
        <NavLink to="/app/dashboard" className={({isActive}) => cn("flex flex-col items-center gap-1", isActive ? "text-brand-400" : "text-text-muted")}>
          <LayoutDashboard className="w-6 h-6" />
          <span className="text-[10px] font-medium">Home</span>
        </NavLink>

        {/* Tasks/Organize */}
        <NavLink to="/app/tasks" className={({isActive}) => cn("flex flex-col items-center gap-1", isActive ? "text-brand-400" : "text-text-muted")}>
          <CheckSquare className="w-6 h-6" />
          <span className="text-[10px] font-medium">Tasks</span>
        </NavLink>

        {/* FAB + */}
        <div className="relative -top-5">
          <button 
            onClick={() => setShowCreateMenu(true)}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-brand-500 text-white shadow-lg shadow-brand-500/30 border-4 border-surface"
          >
            <Plus className="w-7 h-7" />
          </button>
        </div>

        {/* Schedule */}
        <NavLink to="/app/schedule" className={({isActive}) => cn("flex flex-col items-center gap-1", isActive ? "text-brand-400" : "text-text-muted")}>
          <Calendar className="w-6 h-6" />
          <span className="text-[10px] font-medium">Schedule</span>
        </NavLink>

        {/* Review */}
        <NavLink to="/app/reviews" className={({isActive}) => cn("flex flex-col items-center gap-1", isActive ? "text-brand-400" : "text-text-muted")}>
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px] font-medium">Review</span>
        </NavLink>

      </div>
    </>
  )
}
