import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  ArrowLeft,
  BarChart3,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock,
  CheckSquare,
  ListTodo,
  TrendingUp,
  Sparkles,
  Plus,
} from 'lucide-react'
import { summariesApi } from '@/api/summaries'
import Button from '@/components/ui/Button'
import { formatWeekLabel } from '@/lib/utils'

// ── DonutProgress ──────────────────────────────────────────────────────────────
function DonutProgress({
  value,
  size = 80,
  strokeColor = '#6366f1',
}: {
  value: number
  size?: number
  strokeColor?: string
}) {
  const r = (size - 10) / 2
  const circ = 2 * Math.PI * r
  const offset = circ - (value / 100) * circ
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      className="-rotate-90"
    >
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="8"
        className="dark:stroke-border"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={strokeColor}
        strokeWidth="8"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s ease' }}
      />
    </svg>
  )
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
}: {
  title: string
  value: string | number
  icon: React.ElementType
  iconBg: string
}) {
  return (
    <div className="rounded-2xl bg-surface-overlay p-3 text-center flex flex-col items-center gap-2">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconBg}`}>
        <Icon className="w-4 h-4" aria-hidden="true" />
      </div>
      <p className="text-xl font-bold text-text-primary tabular-nums">{value}</p>
      <p className="text-xs text-text-muted leading-tight">{title}</p>
    </div>
  )
}

// ── AI Section card ────────────────────────────────────────────────────────────
function AiSection({
  title,
  borderColor,
  children,
}: {
  title: string
  borderColor: string
  children: React.ReactNode
}) {
  return (
    <div
      className={`rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm p-5 border-l-4 ${borderColor}`}
    >
      <h3 className="text-sm font-bold text-text-primary mb-3">{title}</h3>
      {children}
    </div>
  )
}

export default function ReviewDetailPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: summary, isLoading, isError } = useQuery({
    queryKey: ['summary', id],
    queryFn: () => summariesApi.get(id!),
    enabled: !!id,
  })

  const retryMutation = useMutation({
    mutationFn: () => summariesApi.retryAnalysis(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['summary', id] })
    },
  })

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
        <div className="h-4 bg-surface-overlay rounded-xl w-32 animate-pulse" />
        <div className="h-8 bg-surface-overlay rounded-xl w-64 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-24 bg-surface-overlay rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-surface-overlay rounded-2xl animate-pulse" />
      </div>
    )
  }

  if (isError || !summary) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28 text-center pt-20">
        <div className="w-16 h-16 rounded-3xl bg-red-100 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        <h2 className="text-xl font-bold text-text-primary">Review not found</h2>
        <p className="text-text-muted">We couldn't load this weekly review.</p>
        <Link to="/app/reviews">
          <Button>Back to all reviews</Button>
        </Link>
      </div>
    )
  }

  const { stats, analysis, analysis_status } = summary
  const rate = Math.round(stats.completion_rate)
  const donutColor =
    rate >= 75 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* ── Back link ──────────────────────────────────────────────────────── */}
      <Link
        to="/app/reviews"
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-500 hover:text-brand-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        All Reviews
      </Link>

      {/* ── Week header ────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">
          Week of {formatWeekLabel(summary.week_start, summary.week_end)}
        </h1>
        <p className="text-sm text-text-muted mt-1">Your weekly performance summary</p>
      </div>

      {/* ── Completion rate donut ───────────────────────────────────────────── */}
      <div className="rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm p-5 flex flex-col items-center gap-3">
        <div className="relative">
          <DonutProgress value={rate} size={120} strokeColor={donutColor} />
          <div className="absolute inset-0 flex flex-col items-center justify-center rotate-90">
            <span className="text-2xl font-bold text-text-primary">{rate}%</span>
            <span className="text-xs text-text-muted font-semibold uppercase tracking-wider">Done</span>
          </div>
        </div>
        <p className="text-sm text-text-muted text-center">
          {stats.tasks_completed} of {stats.tasks_created} planned tasks completed this week
        </p>
      </div>

      {/* ── Stats grid ─────────────────────────────────────────────────────── */}
      <div>
        <h2 className="text-base font-bold text-text-primary mb-3">Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatCard
            title="Tasks Completed"
            value={stats.tasks_completed}
            icon={CheckSquare}
            iconBg="bg-emerald-500/10 text-emerald-500"
          />
          <StatCard
            title="Tasks Created"
            value={stats.tasks_created}
            icon={Plus}
            iconBg="bg-blue-500/10 text-blue-500"
          />
          <StatCard
            title="Overdue Tasks"
            value={stats.tasks_overdue}
            icon={AlertCircle}
            iconBg="bg-red-500/10 text-red-500"
          />
          <StatCard
            title="Todos Finished"
            value={stats.todos_completed}
            icon={ListTodo}
            iconBg="bg-violet-500/10 text-violet-500"
          />
          <StatCard
            title="Scheduled Hours"
            value={`${stats.scheduled_hours}h`}
            icon={Clock}
            iconBg="bg-amber-500/10 text-amber-500"
          />
          <StatCard
            title="Task Hours Logged"
            value={`${stats.completed_task_hours}h`}
            icon={TrendingUp}
            iconBg="bg-brand-500/10 text-brand-400"
          />
        </div>
      </div>

      {/* ── AI Analysis ────────────────────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-5 h-5 text-brand-400" aria-hidden="true" />
          <h2 className="text-base font-bold text-text-primary">AI Insights</h2>
        </div>

        {analysis_status === 'pending' && (
          <div className="rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm p-10 flex flex-col items-center gap-3 text-center">
            <RefreshCw className="w-8 h-8 text-brand-400 animate-spin" />
            <p className="text-sm text-text-muted">Generating your weekly insights…</p>
          </div>
        )}

        {analysis_status === 'unavailable' && (
          <div className="rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm p-8 flex flex-col items-center gap-3 text-center">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-amber-500" />
            </div>
            <p className="text-sm font-bold text-text-primary">Insights unavailable</p>
            <p className="text-xs text-text-muted">
              We couldn't generate the AI analysis for this week.
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => retryMutation.mutate()}
              isLoading={retryMutation.isPending}
            >
              Retry analysis
            </Button>
          </div>
        )}

        {analysis_status === 'available' && analysis && (
          <div className="space-y-4">
            {/* Overview */}
            {analysis.overview && (
              <AiSection title="Overview" borderColor="border-l-brand-500">
                <p className="text-sm text-text-secondary leading-relaxed">{analysis.overview}</p>
              </AiSection>
            )}

            {/* Wins */}
            {analysis.wins && analysis.wins.length > 0 && (
              <AiSection title="🏆 Wins" borderColor="border-l-emerald-500">
                <ul className="space-y-2">
                  {analysis.wins.map((w, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" aria-hidden="true" />
                      {w}
                    </li>
                  ))}
                </ul>
              </AiSection>
            )}

            {/* Challenges */}
            {analysis.challenges && analysis.challenges.length > 0 && (
              <AiSection title="⚡ Challenges" borderColor="border-l-red-500">
                <ul className="space-y-2">
                  {analysis.challenges.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" aria-hidden="true" />
                      {c}
                    </li>
                  ))}
                </ul>
              </AiSection>
            )}

            {/* Patterns */}
            {analysis.patterns && analysis.patterns.length > 0 && (
              <AiSection title="📊 Observed Patterns" borderColor="border-l-violet-500">
                <ul className="space-y-2">
                  {analysis.patterns.map((p, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-text-muted">
                      <TrendingUp className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" aria-hidden="true" />
                      {p}
                    </li>
                  ))}
                </ul>
              </AiSection>
            )}

            {/* Recommendation */}
            {analysis.recommendation && (
              <AiSection title="💡 Recommendation for Next Week" borderColor="border-l-amber-500">
                <p className="text-sm text-text-secondary leading-relaxed">
                  {analysis.recommendation}
                </p>
              </AiSection>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
