import Modal from './Modal'
import Button from './Button'
import { cn } from '@/lib/utils'

// ── Types ──────────────────────────────────────────────────────────────────────
export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description?: string
  confirmLabel?: string
  cancelLabel?: string
  variant?: 'danger' | 'default'
  isLoading?: boolean
}

// ── Component ──────────────────────────────────────────────────────────────────
function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'default',
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} size="sm">
      {/* Optional supplemental description when not passed as modal prop */}
      {!description && (
        <p className="sr-only">
          Press {confirmLabel} to proceed or {cancelLabel} to cancel.
        </p>
      )}

      {/* Action row */}
      <div className={cn('flex items-center justify-end gap-2 mt-2')}>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          disabled={isLoading}
        >
          {cancelLabel}
        </Button>

        <Button
          variant={variant === 'danger' ? 'danger' : 'primary'}
          size="sm"
          onClick={onConfirm}
          isLoading={isLoading}
        >
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  )
}

export { ConfirmDialog }
export default ConfirmDialog
