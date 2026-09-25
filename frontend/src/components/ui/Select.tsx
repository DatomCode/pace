import { useId } from 'react'
import * as RadixSelect from '@radix-ui/react-select'
import { ChevronDown, Check } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface SelectOption {
  value: string
  label: string
}

export interface SelectProps {
  label?: string
  error?: string
  placeholder?: string
  value?: string
  onValueChange?: (value: string) => void
  options: SelectOption[]
  disabled?: boolean
  className?: string
  id?: string
}

// ── Component ──────────────────────────────────────────────────────────────────
function Select({
  label,
  error,
  placeholder = 'Select…',
  value,
  onValueChange,
  options,
  disabled,
  className,
  id,
}: SelectProps) {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const errorId = `${selectId}-error`

  return (
    <div className={cn('flex flex-col gap-1.5 w-full', className)}>
      {label && (
        <label
          htmlFor={selectId}
          className="text-sm font-medium text-text-secondary select-none"
        >
          {label}
        </label>
      )}

      <RadixSelect.Root
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
      >
        {/* Trigger */}
        <RadixSelect.Trigger
          id={selectId}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          className={cn(
            'inline-flex items-center justify-between gap-2',
            'w-full h-9 px-3 rounded-lg text-sm',
            'bg-surface-overlay text-text-primary border border-border',
            'transition-colors duration-150',
            'focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500',
            error && 'border-red-500 focus:ring-red-500',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'data-[placeholder]:text-text-disabled',
          )}
        >
          <RadixSelect.Value placeholder={placeholder} />
          <RadixSelect.Icon asChild>
            <ChevronDown className="size-4 text-text-muted shrink-0" aria-hidden="true" />
          </RadixSelect.Icon>
        </RadixSelect.Trigger>

        {/* Dropdown portal */}
        <RadixSelect.Portal>
          <RadixSelect.Content
            position="popper"
            sideOffset={4}
            className={cn(
              'z-[60] min-w-[var(--radix-select-trigger-width)]',
              'bg-surface-elevated border border-border rounded-xl shadow-strong',
              'overflow-hidden',
              'animate-fade-in',
            )}
          >
            <RadixSelect.Viewport className="p-1">
              {options.map((option) => (
                <RadixSelect.Item
                  key={option.value}
                  value={option.value}
                  className={cn(
                    'relative flex items-center gap-2 px-3 py-2 pr-8',
                    'text-sm text-text-primary rounded-lg cursor-pointer select-none',
                    'transition-colors duration-100',
                    'hover:bg-surface-overlay focus:bg-surface-overlay',
                    'data-[highlighted]:bg-surface-overlay data-[highlighted]:outline-none',
                    'data-[disabled]:opacity-40 data-[disabled]:cursor-not-allowed',
                  )}
                >
                  <RadixSelect.ItemText>{option.label}</RadixSelect.ItemText>
                  <RadixSelect.ItemIndicator className="absolute right-2 flex items-center">
                    <Check className="size-3.5 text-brand-500" aria-hidden="true" />
                  </RadixSelect.ItemIndicator>
                </RadixSelect.Item>
              ))}
            </RadixSelect.Viewport>
          </RadixSelect.Content>
        </RadixSelect.Portal>
      </RadixSelect.Root>

      {error && (
        <p id={errorId} role="alert" className="text-xs text-red-400">
          {error}
        </p>
      )}
    </div>
  )
}

export { Select }
export default Select
