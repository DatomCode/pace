import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, ChevronRight, TrendingUp } from 'lucide-react'

import { summariesApi } from '@/api/summaries'
import type { WeeklySummary } from '@/types'
import { Skeleton } from '@/components/ui/SkeletonLoader'
import { cn, formatWeekLabel, formatDate } from '@/lib/utils'

// ── Inline DonutProgress ────────────────────────────────────────────────────────
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

// ── Current week hero card ──────────────────────────────────────────────────────
function CurrentWeekCard({ summary }: { summary: WeeklySummary }) {
  const { stats } = summary
  const weekLabel = formatWeekLabel(summary.week_start, summary.week_end)
  const rate = Math.round(stats.completion_rate)
  const donutColor =
    rate >= 75 ? '#10b981' : rate >= 50 ? '#f59e0b' : '#ef4444'

  return (
    <div
      className="relative rounded-3xl overflow-hidden p-6 text-white"
      style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
      }}
    >
      {/* Decorative circles */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
      <div className="absolute -bottom-6 -left-6 w-24 h-24 rounded-full bg-white/10 pointer-events-none" />

      <div className="relative z-10 flex items-center justify-between gap-4">
        {/* Left: info */}
        <div className="flex-1 min-w-0">
          <span className="inline-block text-xs font-semibold bg-white/20 px-2.5 py-1 rounded-full mb-3">
            Current Week
          </span>
          <h2 className="text-lg font-bold mb-4 truncate">{weekLabel}</h2>

          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {stats.tasks_completed}
              </p>
              <p className="text-xs text-white/70">Tasks completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {stats.tasks_created}
              </p>
              <p className="text-xs text-white/70">Tasks created</p>
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums">
                {stats.scheduled_hours.toFixed(1)}h
              </p>
              <p className="text-xs text-white/70">Scheduled hours</p>
            </div>
          </div>
        </div>

        {/* Right: donut + percentage */}
        <div className="shrink-0 flex flex-col items-center gap-1">
          <div className="relative">
            <DonutProgress value={rate} size={88} strokeColor={donutColor} />
            <div className="absolute inset-0 flex items-center justify-center rotate-90">
              <span className="text-xl font-bold text-white">{rate}%</span>
            </div>
          </div>
          <span className="text-xs text-white/70 font-medium">Rate</span>
        </div>
      </div>
    </div>
  )
}

// ── Previous week card ─────────────────────────────────────────────────────────
function PreviousWeekRow({
  summary,
  onClick,
}: {
  summary: WeeklySummary
  onClick: () => void
}) {
  const { stats } = summary
  const rate = Math.round(stats.completion_rate)
  const rateColor =
    rate >= 75
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400'
      : rate >= 50
      ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400'
      : 'bg-red-100 text-red-600'

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full text-left',
        'rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm hover:shadow-md transition-all',
        'p-4 flex items-center gap-4',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
      )}
      aria-label={`View review for ${formatWeekLabel(summary.week_start, summary.week_end)}`}
    >
      {/* Icon */}
      <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center shrink-0">
        <TrendingUp className="w-5 h-5 text-brand-400" aria-hidden="true" />
      </div>

      {/* Date info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-text-primary truncate">
          {formatWeekLabel(summary.week_start, summary.week_end)}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          {formatDate(summary.week_start, 'EEE, MMM d')} –{' '}
          {formatDate(summary.week_end, 'EEE, MMM d')}
        </p>
      </div>

      {/* Completed count */}
      <div className="hidden sm:flex flex-col items-end shrink-0">
        <span className="text-sm font-bold text-text-primary tabular-nums">
          {stats.tasks_completed}
        </span>
        <span className="text-xs text-text-muted">done</span>
      </div>

      {/* Rate pill */}
      <span className={cn('text-xs font-semibold px-2.5 py-1 rounded-full shrink-0', rateColor)}>
        {rate}%
      </span>

      {/* Arrow */}
      <span className="text-xs font-semibold text-brand-500 shrink-0">
        View →
      </span>

      <ChevronRight className="size-4 text-text-disabled shrink-0 hidden sm:block" aria-hidden="true" />
    </button>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function ReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading reviews…">
      {/* Hero card skeleton */}
      <div className="rounded-3xl p-6 bg-surface-overlay animate-pulse h-40" />

      {/* List skeletons */}
      <div className="flex flex-col gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border p-4 flex items-center gap-4"
          >
            <Skeleton className="w-10 h-10 rounded-xl" />
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
            <Skeleton className="h-6 w-12 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Page component ─────────────────────────────────────────────────────────────
export default function ReviewsPage() {
  const navigate = useNavigate()

  const { data: listData, isLoading: listLoading } = useQuery({
    queryKey: ['summaries'],
    queryFn: summariesApi.list,
  })

  const { data: current, isLoading: currentLoading } = useQuery({
    queryKey: ['summaries', 'current'],
    queryFn: summariesApi.getCurrent,
  })

  const isLoading = listLoading || currentLoading
  const allSummaries = listData?.results ?? []

  // Exclude the current week from the previous list
  const previous = current
    ? allSummaries.filter((s) => s.id !== current.id)
    : allSummaries

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
        <Skeleton className="h-8 w-44 rounded-xl" />
        <ReviewsSkeleton />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-28">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Weekly Reviews</h1>
        <p className="mt-1 text-sm text-text-muted">Track your progress week by week.</p>
      </div>

      {/* ── Current week ──────────────────────────────────────────────────── */}
      {current ? (
        <div>
          <h2 className="text-base font-bold text-text-primary mb-3">This Week</h2>
          {current.stats.tasks_created === 0 &&
          current.stats.tasks_completed === 0 &&
          current.stats.scheduled_hours === 0 ? (
            <div className="rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm p-10 flex flex-col items-center justify-center text-center gap-3">
              <div
                className="w-16 h-16 rounded-3xl flex items-center justify-center"
                style={{
                  background:
                    'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
                }}
              >
                <BarChart3 className="w-8 h-8 text-white" strokeWidth={1.5} aria-hidden="true" />
              </div>
              <p className="text-sm font-bold text-text-primary">No activity yet this week</p>
              <p className="text-xs text-text-muted max-w-xs">
                Complete tasks and schedule events to see your weekly stats here.
              </p>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`/app/reviews/${current.id}`)}
              className="w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-3xl"
              aria-label={`View current week review: ${formatWeekLabel(current.week_start, current.week_end)}`}
            >
              <CurrentWeekCard summary={current} />
            </button>
          )}
        </div>
      ) : null}

      {/* ── Previous weeks ────────────────────────────────────────────────── */}
      {previous.length > 0 && (
        <div>
          <h2 className="text-base font-bold text-text-primary mb-3">Previous Weeks</h2>
          <div className="flex flex-col gap-3">
            {previous.map((summary) => (
              <PreviousWeekRow
                key={summary.id}
                summary={summary}
                onClick={() => navigate(`/app/reviews/${summary.id}`)}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ───────────────────────────────────────────────────── */}
      {!current && previous.length === 0 && (
        <div className="rounded-2xl bg-white dark:bg-surface border border-gray-100 dark:border-border shadow-sm p-12 flex flex-col items-center justify-center text-center gap-4">
          <div
            className="w-16 h-16 rounded-3xl flex items-center justify-center"
            style={{
              background:
                'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a78bfa 100%)',
            }}
          >
            <BarChart3 className="w-8 h-8 text-white" strokeWidth={1.5} aria-hidden="true" />
          </div>
          <div>
            <p className="text-base font-bold text-text-primary">No reviews yet</p>
            <p className="text-sm text-text-muted mt-1 max-w-xs">
              Weekly reviews are generated automatically. Keep using Pace and your first review will appear here.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
