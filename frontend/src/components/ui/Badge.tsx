import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ── Variants ───────────────────────────────────────────────────────────────────
const badgeVariants = cva(
  'inline-flex items-center justify-center rounded-full font-medium leading-none whitespace-nowrap',
  {
    variants: {
      variant: {
        default: 'bg-surface-overlay text-text-secondary border border-border',
        success: 'bg-green-500/15 text-green-400 border border-green-500/25',
        warning: 'bg-amber-500/15 text-amber-400 border border-amber-500/25',
        danger: 'bg-red-500/15 text-red-400 border border-red-500/25',
        info: 'bg-blue-500/15 text-blue-400 border border-blue-500/25',
        muted: 'bg-surface-overlay text-text-muted border border-border-subtle',
      },
      size: {
        sm: 'text-2xs px-1.5 py-0.5 gap-0.5',
        md: 'text-xs px-2 py-0.5 gap-1',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

// ── Types ──────────────────────────────────────────────────────────────────────
export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

// ── Component ──────────────────────────────────────────────────────────────────
function Badge({ className, variant, size, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props}>
      {children}
    </span>
  )
}

export { Badge, badgeVariants }
export default Badge
