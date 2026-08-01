import { History, RefreshCw } from 'lucide-react'
import type { ExportRecord } from '@/types/document'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { EmptyState } from '@/components/common/empty-state'
import { formatBytes } from '@/features/documents/lib/statistics'
import { formatRelative } from '@/lib/utils/date'

/**
 * Download history.
 *
 * Stored locally alongside the project. Regenerating produces a fresh file from
 * the brief as it stands today — the original bytes are not kept, because
 * holding every past export in IndexedDB would grow without limit.
 */

const FORMAT_LABELS: Record<string, string> = {
  pdf: 'PDF',
  docx: 'Word',
  markdown: 'Markdown',
  html: 'HTML',
  bundle: 'All formats',
}

export function ExportHistory({
  records,
  busyId,
  onRegenerate,
}: {
  records: ExportRecord[]
  busyId: string | null
  onRegenerate: (record: ExportRecord) => void
}) {
  return (
    <section
      aria-labelledby="export-history"
      className="rounded-card border border-border bg-surface-raised shadow-card"
    >
      <div className="flex items-center justify-between gap-4 border-b border-border px-5 py-4">
        <h2 id="export-history" className="text-sm font-semibold tracking-tight">
          Version history
        </h2>
        {records.length > 0 ? (
          <span className="text-xs text-muted-foreground">
            {records.length} {records.length === 1 ? 'export' : 'exports'}
          </span>
        ) : null}
      </div>

      {records.length === 0 ? (
        <div className="px-5 py-8">
          <EmptyState
            icon={History}
            title="No exports yet"
            description="Every document you generate is listed here with its version, so you can regenerate it later."
          />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {records.map((record) => (
            <li key={record.id} className="flex items-center gap-4 px-5 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-sm font-medium">{record.fileName}</span>
                  <Badge tone="primary">v{record.version}</Badge>
                </div>
                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {[
                    FORMAT_LABELS[record.format] ?? record.format,
                    formatBytes(record.size),
                    `${record.pages} ${record.pages === 1 ? 'page' : 'pages'}`,
                    formatRelative(record.createdAt),
                  ].join(' · ')}
                </p>
              </div>

              <Button
                variant="secondary"
                size="sm"
                loading={busyId === record.id}
                onClick={() => onRegenerate(record)}
              >
                {busyId === record.id ? null : <RefreshCw aria-hidden="true" />}
                Regenerate
              </Button>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
