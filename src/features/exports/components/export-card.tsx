import { Download, Lock } from 'lucide-react'
import type { DocumentStatistics } from '@/types/document'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { estimateFileSize, formatBytes } from '@/features/documents/lib/statistics'
import { cn } from '@/lib/utils/cn'
import type { Exporter } from '../services/export-registry'

/**
 * One export format.
 *
 * Cards are generated from the registry, so a format added in a later phase
 * appears here without touching this component.
 */
export function ExportCard({
  exporter,
  statistics,
  fileName,
  busy,
  disabled,
  locked,
  lockedReason,
  onExport,
}: {
  exporter: Exporter
  statistics: DocumentStatistics
  fileName: string
  busy: boolean
  disabled: boolean
  /** Unavailable for this project rather than merely busy. */
  locked?: boolean
  lockedReason?: string
  onExport: () => void
}) {
  const Icon = exporter.icon

  return (
    <div
      className={cn(
        'flex flex-col gap-4 rounded-card border border-border bg-surface-raised p-5 shadow-card',
        locked && 'opacity-70',
      )}
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className={cn(
            'flex size-10 shrink-0 items-center justify-center rounded-control',
            locked ? 'bg-muted text-muted-foreground' : 'bg-primary-soft text-primary-text',
          )}
        >
          <Icon className="size-5" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold tracking-tight">{exporter.label}</h3>
            <Badge tone="outline">.{exporter.extension}</Badge>
            {locked ? (
              <Badge tone="neutral">
                <Lock aria-hidden="true" />
                Locked
              </Badge>
            ) : null}
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {exporter.description}
          </p>
        </div>
      </div>

      <dl className="flex flex-wrap gap-x-6 gap-y-1 border-t border-border pt-3 text-xs text-muted-foreground">
        <div className="flex gap-1.5">
          <dt>File</dt>
          <dd className="font-medium text-foreground">{fileName}</dd>
        </div>
        <div className="flex gap-1.5">
          <dt>Approx. size</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {formatBytes(estimateFileSize(exporter.id, statistics))}
          </dd>
        </div>
      </dl>

      {locked ? (
        <div className="flex flex-col gap-2">
          <Button variant="secondary" disabled className="w-full">
            <Lock aria-hidden="true" />
            Not available here
          </Button>
          {lockedReason ? (
            <p className="text-xs leading-relaxed text-muted-foreground">{lockedReason}</p>
          ) : null}
        </div>
      ) : (
        <Button
          variant="primary"
          onClick={onExport}
          loading={busy}
          disabled={disabled}
          className="w-full"
        >
          {busy ? null : <Download aria-hidden="true" />}
          {busy ? `Generating ${exporter.label}…` : `Export ${exporter.label}`}
        </Button>
      )}
    </div>
  )
}
