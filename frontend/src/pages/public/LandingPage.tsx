import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CheckSquare,
  Calendar,
  BarChart3,
  Sparkles,
  Clock,
  Target,
  ChevronRight,
  Check,
} from 'lucide-react'

// â”€â”€ Hero mock dashboard preview â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function DashboardPreview() {
  return (
    <div className="relative rounded-2xl border border-border bg-surface shadow-strong overflow-hidden">
      {/* Mini topbar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-surface-elevated">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-amber-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/50" />
        </div>
        <div className="flex-1 h-5 bg-surface-overlay rounded mx-8" />
      </div>

      <div className="flex h-[380px]">
        {/* Mini sidebar */}
        <div className="w-12 border-r border-border bg-surface-elevated flex flex-col items-center py-4 gap-4">
          <div className="w-7 h-7 rounded-lg gradient-brand flex items-center justify-center">
            <span className="text-white text-xs font-bold">P</span>
          </div>
          {[CheckSquare, Calendar, BarChart3, Sparkles].map((Icon, i) => (
            <div
              key={i}
              className={`w-7 h-7 rounded-lg flex items-center justify-center ${i === 0 ? 'bg-brand-500/20' : ''}`}
            >
              <Icon className={`w-3.5 h-3.5 ${i === 0 ? 'text-brand-400' : 'text-text-disabled'}`} />
            </div>
          ))}
        </div>

        {/* Main content preview */}
        <div className="flex-1 p-5 overflow-hidden">
          {/* Greeting */}
          <div className="mb-4">
            <div className="text-base font-semibold text-text-primary">Good morning, Enoch</div>
            <div className="text-xs text-text-muted mt-0.5">Friday, September 25</div>
          </div>

          {/* Progress */}
          <div className="card p-3 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-secondary">Today's Progress</span>
              <span className="text-xs text-brand-400 font-semibold">6 of 8 done</span>
            </div>
            <div className="h-1.5 bg-surface-overlay rounded-full overflow-hidden">
              <div className="h-full rounded-full gradient-brand" style={{ width: '75%' }} />
            </div>
          </div>

          {/* Task list preview */}
          <div className="space-y-2">
            {[
              { title: 'Design task management UI', status: 'in_progress', priority: 'high', done: false },
              { title: 'Build authentication endpoints', status: 'todo', priority: 'urgent', done: false },
              { title: 'Set up CI/CD pipeline', status: 'completed', priority: 'high', done: true },
              { title: 'Write API documentation', status: 'todo', priority: 'medium', done: false },
            ].map((task, i) => (
              <div key={i} className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg ${task.done ? 'opacity-50' : 'bg-surface-overlay/50'}`}>
                <div className={`w-4 h-4 rounded flex items-center justify-center border ${
                  task.done
                    ? 'bg-green-500/20 border-green-500/40'
                    : task.status === 'in_progress'
                    ? 'border-blue-400/60'
                    : 'border-border'
                }`}>
                  {task.done && <Check className="w-2.5 h-2.5 text-green-400" />}
                </div>
                <span className={`text-xs flex-1 ${task.done ? 'line-through text-text-muted' : 'text-text-secondary'}`}>
                  {task.title}
                </span>
                <span className={`text-2xs px-1.5 py-0.5 rounded-full font-medium ${
                  task.priority === 'urgent' ? 'bg-red-500/10 text-red-400' :
                  task.priority === 'high' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>
                  {task.priority}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel preview */}
        <div className="w-36 border-l border-border p-3 hidden xl:block">
          <div className="text-2xs font-semibold text-text-disabled uppercase tracking-wider mb-2">Today</div>
          {[
            { time: '9:00', title: 'Deep work', color: 'bg-brand-500' },
            { time: '11:30', title: 'Standup', color: 'bg-green-500' },
            { time: '14:00', title: 'UI Review', color: 'bg-amber-500' },
          ].map((event, i) => (
            <div key={i} className="flex items-center gap-2 mb-2">
              <div className="text-2xs text-text-disabled w-8 shrink-0">{event.time}</div>
              <div className={`w-0.5 h-4 rounded-full ${event.color} opacity-60`} />
              <div className="text-2xs text-text-muted truncate">{event.title}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// â”€â”€ Feature card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function FeatureCard({
  icon: Icon,
  title,
  description,
  color,
}: {
  icon: React.ElementType
  title: string
  description: string
  color: string
}) {
  return (
    <div className="card p-6 hover:border-brand-500/30 transition-colors">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-2">{title}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
    </div>
  )
}

// â”€â”€ Stage step â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
function Stage({
  number,
  label,
  description,
  active,
  className,
}: {
  number: string
  label: string
  description: string
  active?: boolean
  className?: string
}) {
  return (
    <div className={`card p-6 flex-1 hover:border-brand-500/30 transition-colors text-left ${className || ''}`}>
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${active ? 'bg-brand-500/10 text-brand-500' : 'bg-surface-elevated text-text-muted'}`}>
        <span className="text-sm font-bold">{number}</span>
      </div>
      <h3 className="text-base font-semibold text-text-primary mb-2">{label}</h3>
      <p className="text-sm text-text-muted leading-relaxed">{description}</p>
    </div>
  )
}

// â”€â”€ Main Landing Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export default function LandingPage() {
  return (
    <div className="min-h-[100dvh] w-full max-w-[100vw] overflow-x-hidden bg-bg">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-bg/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity"><div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center"><span className="text-white font-bold text-sm">P</span></div><span className="font-semibold text-text-primary">Pace</span></Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="text-sm text-text-muted hover:text-text-primary transition-colors px-3 py-1.5"
            >
              Sign in
            </Link>
            <Link
              to="/register"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-500 hover:bg-brand-600 text-white text-sm font-medium transition-colors"
            >
              Get started
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-16">
        <div className="text-center mb-16">
          
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight text-balance">
            Plan your work.{' '}
            <span className="text-transparent bg-clip-text gradient-brand">Get things done.</span>
          </h1>
          <p className="text-lg text-text-muted max-w-2xl mx-auto mb-10 leading-relaxed">
            Pace is a personal productivity command center. Plan tasks, schedule your time,
            execute your work, and review your progress â€” all in one focused workspace.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/register"
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold transition-all shadow-brand hover:shadow-none"
            >
              Start for free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="px-6 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:border-brand-500/30 font-medium transition-all"
            >
              Sign in
            </Link>
          </div>
        </div>

        {/* Dashboard preview */}
        {/* Illustration */}
        <div className="relative mt-16 max-w-5xl mx-auto rounded-2xl overflow-hidden border border-border shadow-strong bg-surface group">
          <img 
            src="/assets/landing_illustration.jpg" 
            alt="Pace Productivity Illustration" 
            className="w-full h-auto object-cover opacity-95 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-[1.01]" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/40 via-transparent to-transparent pointer-events-none mix-blend-overlay" />
        </div>
      </section>

      {/* Plan â†’ Schedule â†’ Execute â†’ Review */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-4">One clear workflow</h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Pace structures your productivity around four simple stages, so you always
            know where you are and what comes next.
          </p>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory pb-6 -mx-6 px-6 gap-4 md:overflow-visible md:snap-none md:pb-0 md:mx-0 md:px-0 scrollbar-hide">
          <Stage className="flex-none w-[85vw] md:flex-1 md:w-auto snap-center" number="01" label="Plan" description="Break goals into tasks and projects. Use AI to generate a task list from any goal." active />
          <div className="hidden md:flex items-center justify-center shrink-0 self-center">
            <ChevronRight className="w-5 h-5 text-text-disabled" />
          </div>
          <Stage className="flex-none w-[85vw] md:flex-1 md:w-auto snap-center" number="02" label="Schedule" description="Block time for your tasks. Build a daily schedule and stay on top of what's coming." />
          <div className="hidden md:flex items-center justify-center shrink-0 self-center">
            <ChevronRight className="w-5 h-5 text-text-disabled" />
          </div>
          <Stage className="flex-none w-[85vw] md:flex-1 md:w-auto snap-center" number="03" label="Execute" description="Your dashboard answers: what needs attention right now? Work your list." />
          <div className="hidden md:flex items-center justify-center shrink-0 self-center">
            <ChevronRight className="w-5 h-5 text-text-disabled" />
          </div>
          <Stage className="flex-none w-[85vw] md:flex-1 md:w-auto snap-center" number="04" label="Review" description="See what you completed each week. Understand your patterns without judgment." />
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-text-primary mb-4">Everything you need, nothing you don't</h2>
          <p className="text-text-muted max-w-xl mx-auto">
            Pace is focused on what matters. No team features, no complex workflows â€” just a clean personal system.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <FeatureCard
            icon={CheckSquare}
            color="bg-brand-500/15 text-brand-400"
            title="Task Management"
            description="Create, prioritize, and track tasks with status, priority, due dates, and estimated duration."
          />
          <FeatureCard
            icon={FolderOpenIcon}
            color="bg-green-500/15 text-green-400"
            title="Projects"
            description="Group related tasks into projects. See progress at a glance with completion rates."
          />
          <FeatureCard
            icon={Calendar}
            color="bg-blue-500/15 text-blue-400"
            title="Schedule"
            description="Plan your day with a visual timeline. Get warned about overlapping events before they cause problems."
          />
          <FeatureCard
            icon={Sparkles}
            color="bg-purple-500/15 text-purple-400"
            title="AI Task Generation"
            description="Describe a goal, get a suggested task list. Review, edit, and accept what makes sense â€” you always decide."
          />
          <FeatureCard
            icon={BarChart3}
            color="bg-amber-500/15 text-amber-400"
            title="Weekly Reviews"
            description="See what you completed each week with AI-powered analysis of your patterns and progress."
          />
          <FeatureCard
            icon={Clock}
            color="bg-red-500/15 text-red-400"
            title="Todos"
            description="Keep small actions separate from tasks. Quick to add, easy to check off, out of your way."
          />
        </div>
      </section>

      {/* AI section */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            
            <h2 className="text-3xl font-bold text-text-primary mb-4">
              Turn any goal into an actionable plan
            </h2>
            <p className="text-text-muted leading-relaxed mb-6">
              Type your goal, and Pace generates a suggested task list. Each suggestion is
              editable â€” you can accept, modify, or reject any task before it's created.
              AI assists, you decide.
            </p>
            <ul className="space-y-3">
              {[
                'Describe your goal in plain language',
                'Review AI-generated task suggestions',
                'Edit, accept, or reject each suggestion',
                'Confirm to create your selected tasks',
              ].map((step, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-brand-500/20 border border-brand-500/30 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-brand-400" />
                  </div>
                  <span className="text-sm text-text-secondary">{step}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* AI flow preview */}
          <div className="card p-6 space-y-3">
            <div className="text-xs text-text-muted mb-4">AI suggested tasks for: Build a task management app</div>
            {[
              { title: 'Design database schema', accepted: true, priority: 'high' },
              { title: 'Set up authentication', accepted: true, priority: 'urgent' },
              { title: 'Build task endpoints', accepted: true, priority: 'high' },
              { title: 'Add input validation', accepted: false, priority: 'medium' },
              { title: 'Write tests', accepted: true, priority: 'medium' },
            ].map((task, i) => (
              <div key={i} className={`flex items-center gap-3 px-3 py-2 rounded-lg ${task.accepted ? 'bg-surface-overlay' : 'opacity-40'}`}>
                <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${task.accepted ? 'bg-brand-500/20 border-brand-500/40' : 'border-border'}`}>
                  {task.accepted && <Check className="w-2.5 h-2.5 text-brand-400" />}
                </div>
                <span className={`text-sm flex-1 ${task.accepted ? 'text-text-secondary' : 'text-text-disabled line-through'}`}>
                  {task.title}
                </span>
                <span className={`text-2xs px-1.5 py-0.5 rounded-full ${
                  task.priority === 'urgent' ? 'bg-red-500/10 text-red-400' :
                  task.priority === 'high' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-blue-500/10 text-blue-400'
                }`}>{task.priority}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <span className="text-xs text-text-muted">4 of 5 selected</span>
              <button className="px-3 py-1.5 rounded-lg bg-brand-500 text-white text-xs font-medium">
                Create 4 tasks
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 border-t border-border text-center">
        <div className="max-w-xl mx-auto">
          <Target className="w-10 h-10 text-brand-400 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-text-primary mb-4">
            Know what to do today
          </h2>
          <p className="text-text-muted mb-8 leading-relaxed">
            Pace gives you one clear place to see what needs attention, organize your time,
            do the work, and understand what actually happened.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-semibold text-base transition-all shadow-brand hover:shadow-none"
          >
            Get started for free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-md gradient-brand flex items-center justify-center">
              <span className="text-white font-bold text-xs">P</span>
            </div>
            <span className="text-sm font-medium text-text-primary">Pace</span>
          </div>
          <p className="text-xs text-text-muted">
            Plan â†’ Schedule â†’ Execute â†’ Review
          </p>
          <div className="flex items-center gap-4">
            <Link to="/login" className="text-xs text-text-muted hover:text-text-secondary transition-colors">
              Sign in
            </Link>
            <Link to="/register" className="text-xs text-text-muted hover:text-text-secondary transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Missing icon fix â€” react-router's Link doesn't have this, use folder icon from lucide
function FolderOpenIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m6 14 1.5-2.9A2 2 0 0 1 9.24 10H20a2 2 0 0 1 1.94 2.5l-1.54 6a2 2 0 0 1-1.95 1.5H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h3.9a2 2 0 0 1 1.69.9l.81 1.2a2 2 0 0 0 1.67.9H18a2 2 0 0 1 2 2v2" />
    </svg>
  )
}
