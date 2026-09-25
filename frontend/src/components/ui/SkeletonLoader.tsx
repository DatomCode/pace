import { cn } from '@/lib/utils'

// ── Base skeleton block ────────────────────────────────────────────────────────
interface SkeletonProps {
  className?: string
}

function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn('skeleton', className)}
      aria-hidden="true"
    />
  )
}

// ── Task row skeleton ──────────────────────────────────────────────────────────
function TaskSkeleton() {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b border-border-subtle last:border-0"
      aria-hidden="true"
    >
      {/* Checkbox */}
      <Skeleton className="size-4 rounded shrink-0" />

      {/* Title + meta */}
      <div className="flex-1 min-w-0 flex flex-col gap-1.5">
        <Skeleton className="h-3.5 w-2/3 rounded" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-16 rounded-full" />
          <Skeleton className="h-3 w-12 rounded-full" />
        </div>
      </div>

      {/* Right badges */}
      <div className="flex items-center gap-2 shrink-0">
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-10 rounded-full" />
      </div>
    </div>
  )
}

// ── Card skeleton ──────────────────────────────────────────────────────────────
function CardSkeleton() {
  return (
    <div
      className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4"
      aria-hidden="true"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-4 w-16 rounded" />
      </div>

      {/* Body lines */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3 w-full rounded" />
        <Skeleton className="h-3 w-4/5 rounded" />
        <Skeleton className="h-3 w-2/3 rounded" />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-6 w-6 rounded-full shrink-0" />
        <Skeleton className="h-3 w-24 rounded" />
      </div>
    </div>
  )
}

// ── Dashboard skeleton ─────────────────────────────────────────────────────────
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-label="Loading dashboard…" aria-busy="true">
      {/* Stat cards row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3.5 w-20 rounded" />
              <Skeleton className="size-8 rounded-lg" />
            </div>
            <Skeleton className="h-7 w-12 rounded" />
            <Skeleton className="h-3 w-16 rounded" />
          </div>
        ))}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Main task list */}
        <div className="lg:col-span-2 bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <Skeleton className="h-4 w-28 rounded" />
          </div>
          <div className="divide-y divide-border-subtle">
            {Array.from({ length: 5 }).map((_, i) => (
              <TaskSkeleton key={i} />
            ))}
          </div>
        </div>

        {/* Sidebar card */}
        <div className="flex flex-col gap-4">
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>

      {/* Progress section */}
      <div className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4">
        <Skeleton className="h-4 w-36 rounded" />
        <div className="flex flex-col gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-3 w-24 rounded shrink-0" />
              <Skeleton className="flex-1 h-1.5 rounded-full" />
              <Skeleton className="h-3 w-8 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export { Skeleton, TaskSkeleton, CardSkeleton, DashboardSkeleton }
