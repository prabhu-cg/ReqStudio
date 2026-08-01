import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { Eye, FileArchive, Info, Printer, Settings2, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useUIStore } from '@/stores/ui-store'
import type { ExportFormatId, ExportRecord } from '@/types/document'
import {
  useDocumentConfiguration,
  useDocumentModel,
  useExportHistory,
  useProjectDocument,
} from '@/features/documents/hooks/use-document'
import { formatVersion, nextVersion } from '@/features/documents/lib/document-settings'
import { exporters } from '@/features/exports/services/export-registry'
import { ExportError, regenerate, runBundleExport, runExport } from '@/features/exports/services/export-service'
import { buildFileName } from '@/features/exports/lib/file-name'
import { ExportCard } from '@/features/exports/components/export-card'
import { ExportHistory } from '@/features/exports/components/export-history'
import { DocumentStatisticsPanel } from '@/features/exports/components/document-statistics-panel'
import { SAMPLE_EXPORT_FORMATS } from '@/features/sample/lib/sample-project'
import { useWorkspace } from '../workspace-context'

/**
 * The Exports tab.
 *
 * The dashboard for turning a brief into a file: every available format, what
 * the document currently contains, and what has been generated before.
 */
export function ExportsTab() {
  const { project, pages, readiness, readOnly } = useWorkspace()
  const openDrawer = useUIStore((state) => state.openDrawer)
  const toast = useUIStore((state) => state.toast)

  const record = useProjectDocument(project.id)
  const configuration = useDocumentConfiguration(project, record)
  const model = useDocumentModel(project, pages, readiness, configuration)
  const history = useExportHistory(project.id)

  const [busyFormat, setBusyFormat] = useState<ExportFormatId | 'bundle' | null>(null)
  const [busyRecordId, setBusyRecordId] = useState<string | null>(null)

  const report = useCallback(
    (error: unknown) => {
      const message =
        error instanceof ExportError || error instanceof Error
          ? error.message
          : 'The export failed for an unknown reason.'
      toast({ title: 'Export failed', description: message, variant: 'danger' })
      console.error('[reqstudio] export failed', error)
    },
    [toast],
  )

  const handleExport = useCallback(
    async (format: ExportFormatId) => {
      setBusyFormat(format)
      try {
        const result = await runExport(project, model, format)
        toast({
          title: `${result.fileName} downloaded`,
          description: `Saved as v${result.version}. The next export will be ${formatVersion(nextVersion(result.version))}.`,
          variant: 'success',
        })
      } catch (error) {
        report(error)
      } finally {
        setBusyFormat(null)
      }
    },
    [project, model, toast, report],
  )

  const handleBundle = useCallback(async () => {
    setBusyFormat('bundle')
    try {
      const result = await runBundleExport(project, model)
      toast({ title: `${result.fileName} downloaded`, variant: 'success' })
    } catch (error) {
      report(error)
    } finally {
      setBusyFormat(null)
    }
  }, [project, model, toast, report])

  const handleRegenerate = useCallback(
    async (entry: ExportRecord) => {
      setBusyRecordId(entry.id)
      try {
        const result = await regenerate(project, model, entry)
        toast({ title: `${result.fileName} downloaded`, variant: 'success' })
      } catch (error) {
        report(error)
      } finally {
        setBusyRecordId(null)
      }
    },
    [project, model, toast, report],
  )

  const busy = busyFormat !== null || busyRecordId !== null

  // The sample is a showcase for the PDF output; the other formats are there to
  // be used on the reader's own projects.
  const isAllowed = (format: ExportFormatId) =>
    !readOnly || SAMPLE_EXPORT_FORMATS.includes(format)

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight">Exports</h1>
            <Badge tone="primary">{model.meta.version}</Badge>
          </div>
          <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
            {readOnly
              ? 'This is the built-in sample. Export the PDF to see exactly what ReqStudio produces from a completed brief.'
              : 'Generate a client-ready document from this brief. Every export is recorded below and advances the document version.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link to="../preview">
              <Eye aria-hidden="true" />
              Preview
            </Link>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => window.print()}>
            <Printer aria-hidden="true" />
            Print
          </Button>
          {readOnly ? null : (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openDrawer({ type: 'export.settings', projectId: project.id })}
              >
                <SlidersHorizontal aria-hidden="true" />
                Export settings
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openDrawer({ type: 'document.settings', projectId: project.id })}
              >
                <Settings2 aria-hidden="true" />
                Document settings
              </Button>
            </>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="flex flex-col gap-6">
          {readOnly ? (
            <aside className="flex gap-3 rounded-card border border-info/30 bg-info-soft px-4 py-3.5">
              <Info className="mt-0.5 size-4 shrink-0 text-info" aria-hidden="true" />
              <div className="min-w-0 text-sm leading-relaxed">
                <p className="font-semibold text-info">Sample project</p>
                <p className="mt-1 text-foreground">
                  The PDF export is enabled here so you can see the finished document. Word,
                  Markdown, HTML and the combined archive are available on your own projects —
                  duplicate this sample to try them.
                </p>
              </div>
            </aside>
          ) : null}

          <section aria-labelledby="export-formats" className="flex flex-col gap-4">
            <h2 id="export-formats" className="text-sm font-semibold tracking-tight">
              Available formats
            </h2>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {exporters.map((exporter) => (
                <ExportCard
                  key={exporter.id}
                  exporter={exporter}
                  statistics={model.statistics}
                  fileName={buildFileName(
                    model.meta.projectName,
                    configuration.settings.version,
                    exporter.extension,
                  )}
                  busy={busyFormat === exporter.id}
                  disabled={busy}
                  locked={!isAllowed(exporter.id)}
                  lockedReason="Available on your own projects. Duplicate this sample to try it."
                  onExport={() => void handleExport(exporter.id)}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 rounded-card border border-dashed border-border bg-surface p-5">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold tracking-tight">Every format at once</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  A single .zip containing the PDF, Word, Markdown and HTML versions.
                </p>
              </div>
              <Button
                variant="secondary"
                onClick={() => void handleBundle()}
                loading={busyFormat === 'bundle'}
                disabled={busy || readOnly}
              >
                {busyFormat === 'bundle' ? null : <FileArchive aria-hidden="true" />}
                Download all
              </Button>
            </div>
          </section>

          {readOnly ? (
            <section className="rounded-card border border-border bg-surface-raised p-5 shadow-card">
              <h2 className="text-sm font-semibold tracking-tight">Version history</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                The sample stays at v1.0 — exporting it does not advance its version or add to a
                history. On your own projects, every export is recorded here with its version and
                can be regenerated.
              </p>
            </section>
          ) : (
            <ExportHistory
              records={history}
              busyId={busyRecordId}
              onRegenerate={(entry) => void handleRegenerate(entry)}
            />
          )}
        </div>

        <aside className="flex flex-col gap-6">
          <DocumentStatisticsPanel
            statistics={model.statistics}
            lastGeneratedAt={record?.lastGeneratedAt ?? null}
          />

          <section className="rounded-card border border-border bg-surface-raised p-5 shadow-card">
            <h2 className="text-sm font-semibold tracking-tight">In this document</h2>
            <ul className="mt-3 flex flex-col gap-1.5 text-sm text-muted-foreground">
              {model.sections
                .filter((section) => section.level === 1)
                .map((section) => (
                  <li key={section.id} className="flex items-baseline gap-2">
                    <span className="tabular-nums text-primary-text">{section.number}</span>
                    <span className="min-w-0 flex-1 truncate">{section.title}</span>
                    <span className="tabular-nums text-xs">p.{section.page}</span>
                  </li>
                ))}
            </ul>
            <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
              Change what is included with Export settings.
            </p>
          </section>
        </aside>
      </div>
    </div>
  )
}
