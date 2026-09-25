import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { BarChart3, ChevronRight, TrendingUp } from 'lucide-react'

import { summariesApi } from '@/api/summaries'
import type { WeeklySummary } from '@/types'
import { EmptyState } from '@/components/ui/EmptyState'
import { ProgressBar } from '@/components/ui/ProgressBar'
import { Skeleton } from '@/components/ui/SkeletonLoader'
import { Badge } from '@/components/ui/Badge'
import { cn, formatWeekLabel, formatDate } from '@/lib/utils'

// ── Current week featured card ─────────────────────────────────────────────────
function CurrentWeekCard({ summary }: { summary: WeeklySummary }) {
  const { stats } = summary
  const weekLabel = formatWeekLabel(summary.week_start, summary.week_end)

  const statItems = [
    { label: 'Tasks completed', value: stats.tasks_completed },
    { label: 'Tasks created', value: stats.tasks_created },
    { label: 'Completion rate', value: `${Math.round(stats.completion_rate)}%` },
    { label: 'Scheduled hours', value: `${stats.scheduled_hours.toFixed(1)}h` },
  ]

  return (
    <div
      className={cn(
        'relative bg-surface border border-border rounded-2xl p-6 overflow-hidden',
        'shadow-soft',
      )}
    >
      {/* Accent orb */}
      <div
        className="absolute -top-10 -right-10 w-40 h-40 rounded-full opacity-10 pointer-events-none"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative z-10">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="info" size="sm">Current week</Badge>
            </div>
            <h2 className="text-lg font-bold text-text-primary">{weekLabel}</h2>
          </div>
          <div className="flex items-center justify-center size-10 rounded-xl bg-brand-500/10 shrink-0">
            <TrendingUp className="size-5 text-brand-400" aria-hidden="true" />
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {statItems.map((item) => (
            <div key={item.label} className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-text-primary tabular-nums">
                {item.value}
              </span>
              <span className="text-xs text-text-muted leading-tight">{item.label}</span>
            </div>
          ))}
        </div>

        {/* Completion rate bar */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">
              {Math.round(stats.completion_rate)}% of planned tasks were completed
            </span>
          </div>
          <ProgressBar
            value={stats.completion_rate}
            color={
              stats.completion_rate >= 75
                ? 'green'
                : stats.completion_rate >= 50
                ? 'brand'
                : 'amber'
            }
          />
        </div>
      </div>
    </div>
  )
}

// ── Previous week row ─────────────────────────────────────────────────────────
function PreviousWeekRow({
  summary,
  onClick,
}: {
  summary: WeeklySummary
  onClick: () => void
}) {
  const { stats } = summary

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-4 px-4 py-3.5',
        'border-b border-border-subtle last:border-0',
        'hover:bg-surface-overlay transition-colors duration-150',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-inset',
        'text-left cursor-pointer',
      )}
      aria-label={`View review for ${formatWeekLabel(summary.week_start, summary.week_end)}`}
    >
      {/* Date range */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-text-primary truncate">
          {formatWeekLabel(summary.week_start, summary.week_end)}
        </p>
        <p className="text-xs text-text-muted mt-0.5">
          {formatDate(summary.week_start, 'EEE, MMM d')} –{' '}
          {formatDate(summary.week_end, 'EEE, MMM d')}
        </p>
      </div>

      {/* Completed */}
      <div className="hidden sm:flex flex-col items-end shrink-0 w-20">
        <span className="text-sm font-semibold text-text-primary tabular-nums">
          {stats.tasks_completed}
        </span>
        <span className="text-xs text-text-muted">completed</span>
      </div>

      {/* Completion rate */}
      <div className="hidden md:flex flex-col items-end shrink-0 w-20">
        <span
          className={cn(
            'text-sm font-semibold tabular-nums',
            stats.completion_rate >= 75
              ? 'text-green-400'
              : stats.completion_rate >= 50
              ? 'text-amber-400'
              : 'text-red-400',
          )}
        >
          {Math.round(stats.completion_rate)}%
        </span>
        <span className="text-xs text-text-muted">rate</span>
      </div>

      {/* Scheduled hours */}
      <div className="hidden lg:flex flex-col items-end shrink-0 w-20">
        <span className="text-sm font-semibold text-text-primary tabular-nums">
          {stats.scheduled_hours.toFixed(1)}h
        </span>
        <span className="text-xs text-text-muted">scheduled</span>
      </div>

      <ChevronRight className="size-4 text-text-disabled shrink-0" aria-hidden="true" />
    </button>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────────
function ReviewsSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true" aria-label="Loading reviews…">
      {/* Featured card skeleton */}
      <div className="bg-surface border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between mb-5">
          <div className="flex flex-col gap-2">
            <Skeleton className="h-4 w-20 rounded-full" />
            <Skeleton className="h-5 w-48 rounded" />
          </div>
          <Skeleton className="size-10 rounded-xl" />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex flex-col gap-1.5">
              <Skeleton className="h-7 w-12 rounded" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          ))}
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Table skeleton */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <Skeleton className="h-4 w-32 rounded" />
        </div>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-border-subtle last:border-0">
            <div className="flex-1 flex flex-col gap-1.5">
              <Skeleton className="h-4 w-40 rounded" />
              <Skeleton className="h-3 w-28 rounded" />
            </div>
            <Skeleton className="h-4 w-12 rounded hidden sm:block" />
            <Skeleton className="h-4 w-10 rounded hidden md:block" />
            <Skeleton className="h-4 w-10 rounded hidden lg:block" />
            <Skeleton className="size-4 rounded" />
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
      <div className="page-container">
        <div className="mb-8">
          <Skeleton className="h-7 w-40 rounded mb-2" />
          <Skeleton className="h-4 w-60 rounded" />
        </div>
        <ReviewsSkeleton />
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Weekly Reviews</h1>
          <p className="mt-1 text-sm text-text-muted">
            Track your progress week by week.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-6">
        {/* ── Current week ─────────────────────────────────────────────────── */}
        {current ? (
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-disabled mb-3 px-1">
              This Week
            </h2>
            {current.stats.tasks_created === 0 &&
            current.stats.tasks_completed === 0 &&
            current.stats.scheduled_hours === 0 ? (
              <div
                className={cn(
                  'bg-surface border border-border rounded-2xl p-8',
                  'flex flex-col items-center justify-center text-center',
                )}
              >
                <BarChart3
                  className="size-10 text-text-disabled mb-3"
                  strokeWidth={1.5}
                  aria-hidden="true"
                />
                <p className="text-sm font-medium text-text-secondary">
                  No activity was recorded this week.
                </p>
                <p className="text-xs text-text-muted mt-1">
                  Complete tasks and schedule events to see your stats here.
                </p>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => navigate(`/app/reviews/${current.id}`)}
                className={cn(
                  'w-full text-left',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 rounded-2xl',
                )}
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
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-disabled mb-3 px-1">
              Previous Weeks
            </h2>

            {/* Table header */}
            <div className="bg-surface border border-border rounded-xl overflow-hidden">
              <div className="hidden sm:flex items-center gap-4 px-4 py-2.5 border-b border-border bg-surface-overlay">
                <span className="flex-1 text-xs font-semibold text-text-disabled uppercase tracking-wider">
                  Week
                </span>
                <span className="hidden sm:block w-20 text-right text-xs font-semibold text-text-disabled uppercase tracking-wider">
                  Completed
                </span>
                <span className="hidden md:block w-20 text-right text-xs font-semibold text-text-disabled uppercase tracking-wider">
                  Rate
                </span>
                <span className="hidden lg:block w-20 text-right text-xs font-semibold text-text-disabled uppercase tracking-wider">
                  Scheduled
                </span>
                <span className="w-4" aria-hidden="true" />
              </div>

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
          <EmptyState
            icon={BarChart3}
            title="No reviews yet"
            description="Weekly reviews are generated automatically. Keep using Pace and your first review will appear here."
          />
        )}
      </div>
    </div>
  )
}
