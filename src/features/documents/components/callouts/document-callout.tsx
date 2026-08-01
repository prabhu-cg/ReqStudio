import type { ReactNode } from 'react'
import { CircleCheck, Info, ShieldAlert, Sparkles, TriangleAlert } from 'lucide-react'
import type { CalloutTone } from '@/types/document'
import { cn } from '@/lib/utils/cn'

/**
 * The one callout component.
 *
 * Tones map onto the app's semantic tokens rather than raw colours so callouts
 * stay legible in dark mode and print correctly.
 */

const TONE_META: Record<
  CalloutTone,
  { icon: typeof Info; label: string; container: string; accent: string }
> = {
  info: {
    icon: Info,
    label: 'Information',
    container: 'border-info/30 bg-info-soft',
    accent: 'text-info',
  },
  success: {
    icon: CircleCheck,
    label: 'Success',
    container: 'border-success/30 bg-success-soft',
    accent: 'text-success',
  },
  warning: {
    icon: TriangleAlert,
    label: 'Warning',
    container: 'border-warning/30 bg-warning-soft',
    accent: 'text-warning',
  },
  risk: {
    icon: ShieldAlert,
    label: 'Risk',
    container: 'border-danger/30 bg-danger-soft',
    accent: 'text-danger',
  },
  future: {
    icon: Sparkles,
    label: 'Future scope',
    container: 'border-primary/30 bg-primary-soft',
    accent: 'text-primary-text',
  },
}

export function DocumentCallout({
  tone,
  title,
  children,
}: {
  tone: CalloutTone
  title?: string
  children: ReactNode
}) {
  const meta = TONE_META[tone]
  const Icon = meta.icon

  return (
    <aside
      data-print="section"
      className={cn('flex gap-3 rounded-card border px-4 py-3.5', meta.container)}
    >
      <Icon className={cn('mt-0.5 size-4 shrink-0', meta.accent)} aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <p className={cn('text-xs font-semibold uppercase tracking-[0.08em]', meta.accent)}>
          {title || meta.label}
        </p>
        <div className="mt-1 text-sm leading-relaxed text-foreground">{children}</div>
      </div>
    </aside>
  )
}
