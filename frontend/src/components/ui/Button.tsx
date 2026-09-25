import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ── Variants ───────────────────────────────────────────────────────────────────
const buttonVariants = cva(
  // Base styles shared by all variants
  [
    'inline-flex items-center justify-center gap-2 font-medium rounded-lg',
    'transition-all duration-150 cursor-pointer select-none',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1 focus-visible:ring-offset-bg',
    'disabled:opacity-50 disabled:cursor-not-allowed',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-brand-500 text-white',
          'hover:bg-brand-600 active:bg-brand-700',
          'shadow-brand/40',
        ],
        secondary: [
          'bg-surface-elevated text-text-primary border border-border',
          'hover:bg-surface-overlay hover:border-border',
          'active:bg-surface-overlay',
        ],
        ghost: [
          'bg-transparent text-text-secondary',
          'hover:bg-surface-overlay hover:text-text-primary',
          'active:bg-surface-overlay',
        ],
        danger: [
          'bg-red-500 text-white',
          'hover:bg-red-600 active:bg-red-700',
        ],
      },
      size: {
        sm: 'h-8 px-3 text-xs',
        md: 'h-9 px-4 text-sm',
        lg: 'h-11 px-5 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
)

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean
}

// ── Component ──────────────────────────────────────────────────────────────────
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2
            className={cn('animate-spin shrink-0', size === 'sm' ? 'size-3' : 'size-4')}
            aria-hidden="true"
          />
        )}
        {children}
      </button>
    )
  },
)

Button.displayName = 'Button'

export { Button, buttonVariants }
export default Button
