import { useEffect } from 'react'
import { Check, Info, TriangleAlert, X } from 'lucide-react'
import { useUIStore, type Toast } from '@/stores/ui-store'
import { cn } from '@/lib/utils/cn'

const TOAST_DURATION = 4500

const ICONS = {
  default: Info,
  success: Check,
  danger: TriangleAlert,
}

export function Toaster() {
  const toasts = useUIStore((state) => state.toasts)

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-12 right-4 z-100 flex w-full max-w-sm flex-col gap-2"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  )
}

function ToastItem({ toast }: { toast: Toast }) {
  const dismiss = useUIStore((state) => state.dismissToast)
  const Icon = ICONS[toast.variant]

  useEffect(() => {
    const timer = setTimeout(() => dismiss(toast.id), TOAST_DURATION)
    return () => clearTimeout(timer)
  }, [toast.id, dismiss])

  return (
    <div
      role="status"
      className={cn(
        'pointer-events-auto flex items-start gap-3 rounded-card border border-border bg-surface-raised p-4 shadow-raised',
        'animate-[rise_220ms_cubic-bezier(0.22,1,0.36,1)]',
      )}
    >
      <Icon
        className={cn(
          'mt-0.5 size-4 shrink-0',
          toast.variant === 'success' && 'text-success',
          toast.variant === 'danger' && 'text-danger',
          toast.variant === 'default' && 'text-muted-foreground',
        )}
        aria-hidden="true"
      />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{toast.title}</p>
        {toast.description ? (
          <p className="mt-0.5 text-xs text-muted-foreground">{toast.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => dismiss(toast.id)}
        className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        aria-label="Dismiss notification"
      >
        <X className="size-3.5" aria-hidden="true" />
      </button>
    </div>
  )
}
