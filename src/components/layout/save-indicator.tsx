import { Check, CloudOff, Loader2, TriangleAlert } from 'lucide-react'
import { useUIStore } from '@/stores/ui-store'
import { useSettingsStore } from '@/stores/settings-store'
import { formatRelative } from '@/lib/utils/date'
import { cn } from '@/lib/utils/cn'

/** "Saving… / Saved ✓" — the only save affordance in the product. */
export function SaveIndicator({ className }: { className?: string }) {
  const status = useUIStore((state) => state.saveStatus)
  const lastSavedAt = useUIStore((state) => state.lastSavedAt)
  const autosaveEnabled = useSettingsStore((state) => state.autosaveEnabled)

  const content = (() => {
    if (!autosaveEnabled) {
      return {
        icon: <CloudOff className="size-3.5" aria-hidden="true" />,
        label: 'Autosave off',
        tone: 'text-warning',
      }
    }
    switch (status) {
      case 'saving':
        return {
          icon: <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />,
          label: 'Saving…',
          tone: 'text-muted-foreground',
        }
      case 'saved':
        return {
          icon: <Check className="size-3.5" aria-hidden="true" />,
          label: 'Saved',
          tone: 'text-success',
        }
      case 'error':
        return {
          icon: <TriangleAlert className="size-3.5" aria-hidden="true" />,
          label: 'Save failed',
          tone: 'text-danger',
        }
      default:
        return {
          icon: <Check className="size-3.5 opacity-40" aria-hidden="true" />,
          label: lastSavedAt ? `Saved ${formatRelative(lastSavedAt)}` : 'All changes saved locally',
          tone: 'text-muted-foreground',
        }
    }
  })()

  return (
    <p
      className={cn('flex items-center gap-1.5 text-xs font-medium', content.tone, className)}
      role="status"
      aria-live="polite"
    >
      {content.icon}
      <span>{content.label}</span>
    </p>
  )
}
