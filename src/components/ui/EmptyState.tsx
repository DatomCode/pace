import type { LucideProps } from 'lucide-react'
import { cn } from '@/lib/utils'
import Button from './Button'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface EmptyStateProps {
  icon: React.ComponentType<LucideProps>
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

// ── Component ──────────────────────────────────────────────────────────────────
function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center py-16 px-6',
        className,
      )}
    >
      {/* Icon circle */}
      <div className="flex items-center justify-center size-16 rounded-2xl bg-surface-overlay border border-border mb-5">
        <Icon
          className="size-7 text-text-muted"
          strokeWidth={1.5}
          aria-hidden="true"
        />
      </div>

      {/* Text */}
      <h3 className="text-base font-semibold text-text-primary mb-1.5">{title}</h3>
      {description && (
        <p className="text-sm text-text-muted max-w-xs text-balance leading-relaxed">
          {description}
        </p>
      )}

      {/* Action */}
      {action && (
        <Button
          variant="secondary"
          size="sm"
          onClick={action.onClick}
          className="mt-5"
        >
          {action.label}
        </Button>
      )}
    </div>
  )
}

export { EmptyState }
export default EmptyState
