import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface DrawerProps {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  width?: 'md' | 'lg'
}

// ── Width map ──────────────────────────────────────────────────────────────────
const widthMap: Record<NonNullable<DrawerProps['width']>, string> = {
  md: 'w-[480px]',
  lg: 'w-[640px]',
}

// ── Component ──────────────────────────────────────────────────────────────────
function Drawer({ open, onClose, title, children, width = 'md' }: DrawerProps) {
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

        {/* Panel — slides in from the right */}
        <Dialog.Content
          className={cn(
            'fixed right-0 top-0 bottom-0 z-50',
            'max-w-[calc(100vw-1rem)]',
            widthMap[width],
            'bg-surface border-l border-border shadow-strong',
            'flex flex-col',
            'data-[state=open]:animate-slide-in-right',
            'focus:outline-none',
          )}
          // Drawer panels describe their title via the heading, no need for extra aria-describedby
          aria-describedby={undefined}
        >
          {/* Header */}
          <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-border shrink-0">
            <Dialog.Title className="text-base font-semibold text-text-primary truncate">
              {title}
            </Dialog.Title>

            <Dialog.Close
              onClick={onClose}
              className={cn(
                'shrink-0 flex items-center justify-center size-7 rounded-lg',
                'text-text-muted hover:text-text-primary hover:bg-surface-overlay',
                'transition-colors duration-150',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              )}
              aria-label="Close drawer"
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

export { Drawer }
export default Drawer
