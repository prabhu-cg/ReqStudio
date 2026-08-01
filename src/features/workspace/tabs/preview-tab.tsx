import { useCallback, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ChevronsDownUp,
  ChevronsUpDown,
  Download,
  Eye,
  EyeOff,
  Printer,
  Search,
  Settings2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useUIStore } from '@/stores/ui-store'
import { matchesQuery } from '@/lib/utils/text'
import { DocumentRenderer } from '@/features/documents/components/document-renderer'
import {
  useDocumentConfiguration,
  useDocumentModel,
  useProjectDocument,
} from '@/features/documents/hooks/use-document'
import { sectionText } from '@/features/documents/lib/statistics'
import { PreviewOutline } from '@/features/preview/components/preview-outline'
import { PreviewZoom } from '@/features/preview/components/preview-toolbar'
import { DEFAULT_ZOOM_INDEX, zoomAt } from '@/features/preview/lib/zoom'
import { useWorkspace } from '../workspace-context'

/**
 * The Preview tab.
 *
 * Renders the compiled document exactly as the exporters will write it, with
 * the reading affordances a long brief needs: a sticky contents rail, search,
 * zoom and collapsible sections.
 */
export function PreviewTab() {
  const { project, pages, readiness, readOnly } = useWorkspace()
  const openDrawer = useUIStore((state) => state.openDrawer)

  const record = useProjectDocument(project.id)
  const stored = useDocumentConfiguration(project, record)

  const [query, setQuery] = useState('')
  const [showEmpty, setShowEmpty] = useState(false)
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(new Set())
  const [zoomIndex, setZoomIndex] = useState(DEFAULT_ZOOM_INDEX)
  const [activeId, setActiveId] = useState<string | null>(null)

  // Showing unanswered fields is a reading preference, not a document setting,
  // so it overlays the stored options rather than being written back.
  const configuration = useMemo(
    () =>
      showEmpty
        ? { ...stored, options: { ...stored.options, includeEmptySections: true } }
        : stored,
    [stored, showEmpty],
  )

  const model = useDocumentModel(project, pages, readiness, configuration)

  const visible = useMemo(() => {
    if (!query.trim()) return new Set(model.sections.map((section) => section.id))
    return new Set(
      model.sections
        .filter((section) => matchesQuery(query, sectionText(section)))
        .map((section) => section.id),
    )
  }, [query, model.sections])

  // The highlighted entry belongs to the previous result set, so searching
  // clears it rather than leaving it pointing at a section that is now hidden.
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value)
    setActiveId(null)
  }, [])

  const scrollTo = useCallback((sectionId: string) => {
    setCollapsed((current) => {
      if (!current.has(sectionId)) return current
      const next = new Set(current)
      next.delete(sectionId)
      return next
    })
    setActiveId(sectionId)
    // Let the section expand before measuring where it sits.
    requestAnimationFrame(() => {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const toggleSection = useCallback((sectionId: string, open: boolean) => {
    setCollapsed((current) => {
      const next = new Set(current)
      if (open) next.delete(sectionId)
      else next.add(sectionId)
      return next
    })
  }, [])

  const allCollapsed = model.sections.length > 0 && collapsed.size >= model.sections.length

  const toggleAll = useCallback(() => {
    setCollapsed((current) =>
      current.size >= model.sections.length
        ? new Set()
        : new Set(model.sections.map((section) => section.id)),
    )
  }, [model.sections])

  const visibleCount = useMemo(
    () => model.sections.filter((section) => visible.has(section.id)).length,
    [model.sections, visible],
  )

  return (
    <div className="grid grid-cols-1 gap-8 xl:grid-cols-[17rem_minmax(0,1fr)]">
      <aside
        data-print="hide"
        className="xl:sticky xl:top-4 xl:max-h-[calc(var(--rs-tab-h,100dvh)-4rem)] xl:overflow-y-auto"
      >
        <div className="flex flex-col gap-4 rounded-card border border-border bg-surface-raised p-4">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(event) => handleQueryChange(event.target.value)}
              placeholder="Search this document…"
              aria-label="Search the document"
              className="pl-9"
            />
          </div>

          <PreviewOutline
            sections={model.sections}
            visible={visible}
            activeId={activeId}
            onSelect={scrollTo}
          />

          <div className="flex flex-col gap-2 border-t border-border pt-4">
            <PreviewZoom index={zoomIndex} onChange={setZoomIndex} />

            <Button variant="secondary" size="sm" onClick={toggleAll}>
              {allCollapsed ? (
                <ChevronsUpDown aria-hidden="true" />
              ) : (
                <ChevronsDownUp aria-hidden="true" />
              )}
              {allCollapsed ? 'Expand all' : 'Collapse all'}
            </Button>

            <Button variant="secondary" size="sm" onClick={() => setShowEmpty((value) => !value)}>
              {showEmpty ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
              {showEmpty ? 'Hide empty fields' : 'Show empty fields'}
            </Button>

            {readOnly ? null : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => openDrawer({ type: 'document.settings', projectId: project.id })}
              >
                <Settings2 aria-hidden="true" />
                Document settings
              </Button>
            )}

            <Button variant="secondary" size="sm" onClick={() => window.print()}>
              <Printer aria-hidden="true" />
              Print
            </Button>

            <Button variant="primary" size="sm" asChild>
              <Link to="../exports">
                <Download aria-hidden="true" />
                Export
              </Link>
            </Button>
          </div>

          <p className="border-t border-border pt-3 text-xs leading-relaxed text-muted-foreground">
            {model.statistics.pages} estimated {model.statistics.pages === 1 ? 'page' : 'pages'} ·{' '}
            {model.statistics.words.toLocaleString()} words
          </p>
        </div>
      </aside>

      <div className="min-w-0">
        {query.trim() && visibleCount === 0 ? (
          <p className="rounded-card border border-border bg-surface-raised py-16 text-center text-sm text-muted-foreground">
            Nothing in this document matches “{query.trim()}”.
          </p>
        ) : (
          <div style={{ zoom: zoomAt(zoomIndex) }}>
            <DocumentRenderer
              model={model}
              collapsed={collapsed}
              onToggleSection={toggleSection}
              visible={visible}
              interactive
            />
          </div>
        )}
      </div>
    </div>
  )
}
