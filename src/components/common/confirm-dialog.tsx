import { useState, type ReactNode } from 'react'
import { TriangleAlert } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

export interface ConfirmDialogProps {
  open: boolean
  onClose: () => void
  title: string
  description: string
  confirmLabel: string
  onConfirm: () => Promise<void> | void
  tone?: 'danger' | 'primary'
  children?: ReactNode
}

/**
 * The single confirmation surface for destructive, irreversible actions.
 *
 * Deleting a project or page, and resetting local data, all route through here.
 * Non-destructive editing stays in drawers.
 */
export function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  confirmLabel,
  onConfirm,
  tone = 'danger',
  children,
}: ConfirmDialogProps) {
  const [busy, setBusy] = useState(false)

  async function confirm() {
    setBusy(true)
    try {
      await onConfirm()
      onClose()
    } finally {
      setBusy(false)
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(next) => !next && !busy && onClose()}>
      <AlertDialogContent>
        <div className="flex gap-4">
          <span
            className={
              tone === 'danger'
                ? 'grid size-10 shrink-0 place-items-center rounded-full bg-danger-soft text-danger'
                : 'grid size-10 shrink-0 place-items-center rounded-full bg-primary-soft text-primary-text'
            }
          >
            <TriangleAlert className="size-5" aria-hidden="true" />
          </span>

          <div className="min-w-0 flex-1">
            <AlertDialogTitle>{title}</AlertDialogTitle>
            <AlertDialogDescription className="mt-2">{description}</AlertDialogDescription>
            {children ? <div className="mt-3">{children}</div> : null}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <AlertDialogCancel asChild>
            <Button variant="ghost" disabled={busy}>
              Cancel
            </Button>
          </AlertDialogCancel>
          {/* Not wrapped in AlertDialogAction: the dialog must stay open while the
              async delete runs, and closes only once it resolves. */}
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={confirm}
            loading={busy}
          >
            {confirmLabel}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
