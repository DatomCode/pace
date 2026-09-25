import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, BarChart3, RefreshCw, AlertCircle, CheckCircle2, Clock, CheckSquare, ListTodo, TrendingUp, Sparkles, Plus } from 'lucide-react'
import { summariesApi } from '@/api/summaries'
import Button from '@/components/ui/Button'
import ProgressBar from '@/components/ui/ProgressBar'
import { formatWeekLabel } from '@/lib/utils'

function StatCard({ title, value, icon: Icon, colorClass }: { title: string, value: string | number, icon: React.ElementType, colorClass: string }) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-text-muted">{title}</span>
        <div className={`p-2 rounded-lg ${colorClass}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
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
    }
  })

  if (isLoading) {
    return (
      <div className="page-container max-w-4xl space-y-6">
        <div className="h-4 bg-surface-overlay rounded w-32 animate-pulse" />
        <div className="h-10 bg-surface-overlay rounded w-64 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => <div key={i} className="h-28 bg-surface-overlay rounded-xl animate-pulse" />)}
        </div>
        <div className="h-64 bg-surface-overlay rounded-xl animate-pulse" />
      </div>
    )
  }

  if (isError || !summary) {
    return (
      <div className="page-container text-center py-20">
        <AlertCircle className="w-10 h-10 text-red-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-text-primary mb-2">Review not found</h2>
        <p className="text-text-muted mb-6">We couldn't load this weekly review.</p>
        <Link to="/app/reviews">
          <Button>Back to all reviews</Button>
        </Link>
      </div>
    )
  }

  const { stats, analysis, analysis_status } = summary
  const rateColor = stats.completion_rate >= 75 ? 'green' : stats.completion_rate >= 50 ? 'amber' : 'red'

  return (
    <div className="page-container max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <Link to="/app/reviews" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-6">
          <ArrowLeft className="w-4 h-4" /> All Reviews
        </Link>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-brand-400" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary">Weekly Review</h1>
        </div>
        <p className="text-text-muted ml-13">
          {formatWeekLabel(summary.week_start, summary.week_end)}
        </p>
      </div>

      {/* Progress hero */}
      <div className="card p-6 md:p-8 flex flex-col md:flex-row items-center gap-8">
        <div className="flex-1 w-full text-center md:text-left">
          <h2 className="text-xl font-semibold text-text-primary mb-2">
            You completed {Math.round(stats.completion_rate)}% of your planned tasks.
          </h2>
          <p className="text-sm text-text-muted mb-6">
            {stats.tasks_completed} out of {stats.tasks_created} tasks finished this week.
          </p>
          <ProgressBar value={stats.completion_rate} color={rateColor} className="h-3" />
        </div>
        <div className="shrink-0 w-32 h-32 rounded-full border-8 border-surface-overlay flex items-center justify-center flex-col relative"
             style={{ borderColor: stats.completion_rate >= 75 ? 'var(--color-green-500)' : 'var(--color-border)' }}>
          <span className="text-3xl font-bold text-text-primary">{Math.round(stats.completion_rate)}%</span>
          <span className="text-2xs text-text-muted uppercase tracking-wider font-semibold">Done</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Tasks Completed" value={stats.tasks_completed} icon={CheckSquare} colorClass="bg-green-500/10 text-green-400" />
        <StatCard title="Tasks Created" value={stats.tasks_created} icon={Plus} colorClass="bg-blue-500/10 text-blue-400" />
        <StatCard title="Overdue Tasks" value={stats.tasks_overdue} icon={AlertCircle} colorClass="bg-red-500/10 text-red-400" />
        <StatCard title="Todos Finished" value={stats.todos_completed} icon={ListTodo} colorClass="bg-purple-500/10 text-purple-400" />
        <StatCard title="Scheduled Hours" value={`${stats.scheduled_hours}h`} icon={Clock} colorClass="bg-amber-500/10 text-amber-400" />
        <StatCard title="Task Hours Logged" value={`${stats.completed_task_hours}h`} icon={TrendingUp} colorClass="bg-brand-500/10 text-brand-400" />
      </div>

      {/* AI Analysis */}
      <div className="card p-6 md:p-8 border-brand-500/20 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />

        <div className="flex items-center gap-2 mb-6">
          <Sparkles className="w-5 h-5 text-brand-400" />
          <h2 className="text-xl font-semibold text-text-primary">AI Insights</h2>
        </div>

        {analysis_status === 'pending' && (
          <div className="py-12 text-center">
            <RefreshCw className="w-8 h-8 text-brand-400 animate-spin mx-auto mb-4" />
            <p className="text-text-muted">Generating your weekly insights...</p>
          </div>
        )}

        {analysis_status === 'unavailable' && (
          <div className="py-8 text-center bg-surface-overlay/50 rounded-xl">
            <AlertCircle className="w-8 h-8 text-amber-400 mx-auto mb-3" />
            <p className="text-text-secondary font-medium mb-1">Insights unavailable</p>
            <p className="text-sm text-text-muted mb-4">We couldn't generate the AI analysis for this week.</p>
            <Button variant="secondary" size="sm" onClick={() => retryMutation.mutate()} isLoading={retryMutation.isPending}>
              Retry analysis
            </Button>
          </div>
        )}

        {analysis_status === 'available' && analysis && (
          <div className="space-y-8 relative">
            {analysis.overview && (
              <div>
                <p className="text-base text-text-secondary leading-relaxed">{analysis.overview}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-6">
              {analysis.wins && analysis.wins.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-green-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Wins
                  </h3>
                  <ul className="space-y-2">
                    {analysis.wins.map((w, i) => (
                      <li key={i} className="text-sm text-text-muted pl-5 relative before:content-[''] before:absolute before:left-1.5 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-green-500/40">
                        {w}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.challenges && analysis.challenges.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" /> Challenges
                  </h3>
                  <ul className="space-y-2">
                    {analysis.challenges.map((c, i) => (
                      <li key={i} className="text-sm text-text-muted pl-5 relative before:content-[''] before:absolute before:left-1.5 before:top-2 before:w-1.5 before:h-1.5 before:rounded-full before:bg-red-500/40">
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {analysis.patterns && analysis.patterns.length > 0 && (
              <div className="space-y-3 pt-6 border-t border-border-subtle">
                <h3 className="text-sm font-semibold text-brand-400">Observed Patterns</h3>
                <ul className="grid gap-2">
                  {analysis.patterns.map((p, i) => (
                    <li key={i} className="flex items-start gap-3 bg-surface-overlay/30 p-3 rounded-lg text-sm text-text-secondary">
                      <TrendingUp className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {analysis.recommendation && (
              <div className="bg-brand-500/5 border border-brand-500/20 p-5 rounded-xl">
                <h3 className="text-sm font-semibold text-brand-400 mb-2">Recommendation for next week</h3>
                <p className="text-sm text-text-secondary leading-relaxed">{analysis.recommendation}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
