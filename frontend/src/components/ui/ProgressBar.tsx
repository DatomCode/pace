import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ProgressBarProps {
  /** Value between 0 and 100 */
  value: number
  className?: string
  /** Show percentage label to the right */
  showLabel?: boolean
  color?: 'brand' | 'green' | 'amber' | 'red'
}

// ── Color map ──────────────────────────────────────────────────────────────────
const colorMap: Record<NonNullable<ProgressBarProps['color']>, string> = {
  brand: 'bg-brand-500',
  green: 'bg-green-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
}

// ── Component ──────────────────────────────────────────────────────────────────
function ProgressBar({
  value,
  className,
  showLabel = false,
  color = 'brand',
}: ProgressBarProps) {
  // Clamp to [0, 100]
  const clamped = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="flex-1 h-1.5 bg-surface-overlay rounded-full overflow-hidden"
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            colorMap[color],
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>

      {showLabel && (
        <span className="text-xs tabular-nums text-text-muted w-8 text-right shrink-0">
          {Math.round(clamped)}%
        </span>
      )}
    </div>
  )
}

export { ProgressBar }
export default ProgressBar
