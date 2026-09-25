import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ModalProps {
  open: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg'
}

// ── Size map ───────────────────────────────────────────────────────────────────
const sizeMap: Record<NonNullable<ModalProps['size']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
}

// ── Component ──────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, description, children, size = 'md' }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className={cn(
            'fixed inset-0 z-50',
            'bg-bg/60 backdrop-blur-sm',
            'data-[state=open]:animate-fade-in',
          )}
        />

        {/* Panel */}
        <Dialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2',
            'w-[calc(100%-2rem)]',
            sizeMap[size],
            'bg-surface border border-border rounded-2xl shadow-strong',
            'flex flex-col max-h-[90dvh]',
            'data-[state=open]:animate-fade-in',
            'focus:outline-none',
          )}
          aria-describedby={description ? 'modal-description' : undefined}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-4 px-6 pt-5 pb-4 border-b border-border shrink-0">
            <div className="flex flex-col gap-1 min-w-0">
              <Dialog.Title className="text-base font-semibold text-text-primary leading-snug">
                {title}
              </Dialog.Title>
              {description && (
                <Dialog.Description
                  id="modal-description"
                  className="text-sm text-text-muted"
                >
                  {description}
                </Dialog.Description>
              )}
            </div>

            <Dialog.Close
              onClick={onClose}
              className={cn(
                'shrink-0 flex items-center justify-center size-7 rounded-lg',
                'text-text-muted hover:text-text-primary hover:bg-surface-overlay',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              )}
              aria-label="Close dialog"
            >
              <X className="size-4" aria-hidden="true" />
            </Dialog.Close>
          </div>

          {/* Scrollable body */}
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {children}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

export { Modal }
export default Modal
