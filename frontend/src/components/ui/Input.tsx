import { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  leftIcon?: React.ReactNode
}

// ── Component ──────────────────────────────────────────────────────────────────
const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, leftIcon, id, type = 'text', disabled, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id ?? generatedId
    const errorId = `${inputId}-error`

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="text-sm font-medium text-text-secondary select-none"
          >
            {label}
          </label>
        )}

        <div className="relative">
          {leftIcon && (
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none flex items-center"
              aria-hidden="true"
            >
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            type={type}
            disabled={disabled}
            aria-invalid={!!error}
            aria-describedby={error ? errorId : undefined}
            className={cn(
              // Base
              'w-full h-9 rounded-lg text-sm bg-surface-overlay text-text-primary',
              'border border-border placeholder:text-text-disabled',
              'transition-colors duration-150',
              // Focus
              'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-0 focus:border-brand-500',
              // Error
              error && 'border-red-500 focus:ring-red-500',
              // Disabled
              'disabled:opacity-50 disabled:cursor-not-allowed',
              // Left icon padding
              leftIcon ? 'pl-9 pr-3' : 'px-3',
              className,
            )}
            {...props}
          />
        </div>

        {error && (
          <p id={errorId} role="alert" className="text-xs text-red-400 flex items-center gap-1">
            {error}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'

export { Input }
export default Input
