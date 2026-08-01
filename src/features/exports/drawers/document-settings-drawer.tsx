import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Input, Textarea } from '@/components/ui/input'
import { Label, Separator } from '@/components/ui/primitives'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useUIStore } from '@/stores/ui-store'
import type { DrawerComponentProps } from '@/components/drawers/drawer-registry'
import type { Project } from '@/types/project'
import type {
  DateFormatPattern,
  DocumentSettings,
  MarginPreset,
  PageSize,
} from '@/types/document'
import { DATE_FORMATS, MARGIN_PRESETS, PAGE_SIZES } from '@/types/document'
import { useProject } from '@/features/projects/hooks/use-projects'
import { useProjectDocument } from '@/features/documents/hooks/use-document'
import {
  resetDocumentSettings,
  saveDocumentSettings,
} from '@/features/documents/services/document-service'
import { formatDocDate } from '@/features/documents/lib/format-value'
import { MARGIN_LABELS, PAGE_SIZE_LABELS } from '@/features/documents/lib/page-metrics'
import {
  defaultDocumentSettings,
  normaliseVersion,
} from '@/features/documents/lib/document-settings'

/**
 * Document settings.
 *
 * Identity and page setup for the generated document, kept separate from the
 * brief's own content: changing the footer text should never look like an edit
 * to the requirements.
 */
export function DocumentSettingsDrawer({
  state,
  open,
  onClose,
}: DrawerComponentProps<'document.settings'>) {
  const project = useProject(state.projectId)
  const record = useProjectDocument(state.projectId)

  // `undefined` from either live query means the read is still in flight.
  if (project === undefined || record === undefined) {
    return (
      <Drawer open={open} onOpenChange={(next) => !next && onClose()} title="Document settings">
        <p className="text-sm text-muted-foreground">Loading document settings…</p>
      </Drawer>
    )
  }

  if (!project) {
    return (
      <Drawer open={open} onOpenChange={(next) => !next && onClose()} title="Document settings">
        <p className="text-sm text-muted-foreground">This project is no longer available.</p>
      </Drawer>
    )
  }

  return (
    <DocumentSettingsForm
      // Remounting on the stored record reseeds the form from the source of
      // truth without an effect that writes state during render.
      key={record?.id ?? 'defaults'}
      project={project}
      initial={record?.settings ?? defaultDocumentSettings(project)}
      open={open}
      onClose={onClose}
    />
  )
}

function DocumentSettingsForm({
  project,
  initial,
  open,
  onClose,
}: {
  project: Project
  initial: DocumentSettings
  open: boolean
  onClose: () => void
}) {
  const toast = useUIStore((store) => store.toast)
  const [draft, setDraft] = useState<DocumentSettings>(initial)
  const [saving, setSaving] = useState(false)

  const update = <K extends keyof DocumentSettings>(key: K, value: DocumentSettings[K]) => {
    setDraft((current) => ({ ...current, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveDocumentSettings(project, { ...draft, version: normaliseVersion(draft.version) })
      toast({ title: 'Document settings saved', variant: 'success' })
      onClose()
    } catch (error) {
      toast({
        title: 'Could not save the settings',
        description: error instanceof Error ? error.message : undefined,
        variant: 'danger',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleReset = async () => {
    try {
      const restored = await resetDocumentSettings(project)
      setDraft(restored.settings)
      toast({ title: 'Document settings reset to defaults', variant: 'default' })
    } catch (error) {
      toast({
        title: 'Could not reset the settings',
        description: error instanceof Error ? error.message : undefined,
        variant: 'danger',
      })
    }
  }

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title="Document settings"
      description="Identity, page setup and footer text for every generated document."
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={handleReset} disabled={saving}>
            <RotateCcw aria-hidden="true" />
            Reset
          </Button>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={saving}>
            Save settings
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-6">
        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Identity
          </h3>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-title">Document title</Label>
            <Input
              id="doc-title"
              value={draft.documentTitle}
              onChange={(event) => update('documentTitle', event.target.value)}
              placeholder={`${project.name} — Requirements Brief`}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-version">Version</Label>
              <Input
                id="doc-version"
                value={draft.version}
                onChange={(event) => update('version', event.target.value)}
                placeholder="1.0"
                inputMode="decimal"
              />
              <p className="text-xs text-muted-foreground">
                Advances automatically after every export.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-logo">Logo placeholder</Label>
              <Input
                id="doc-logo"
                value={draft.logoText}
                onChange={(event) => update('logoText', event.target.value.slice(0, 3))}
                placeholder="RS"
                maxLength={3}
              />
              <p className="text-xs text-muted-foreground">
                Up to three characters, shown in the cover mark.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-company">Company / organisation</Label>
              <Input
                id="doc-company"
                value={draft.company}
                onChange={(event) => update('company', event.target.value)}
                placeholder="Your studio"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-prepared">Prepared by</Label>
              <Input
                id="doc-prepared"
                value={draft.preparedBy}
                onChange={(event) => update('preparedBy', event.target.value)}
                placeholder={project.designer || 'Lead designer'}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-approved">Approved by</Label>
            <Input
              id="doc-approved"
              value={draft.approvedBy}
              onChange={(event) => update('approvedBy', event.target.value)}
              placeholder="Client sign-off"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-footer">Footer text</Label>
            <Textarea
              id="doc-footer"
              rows={2}
              value={draft.footerText}
              onChange={(event) => update('footerText', event.target.value)}
              placeholder="Confidential — prepared for internal review"
            />
          </div>
        </section>

        <Separator />

        <section className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
            Page setup
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-page-size">Page size</Label>
              <Select
                value={draft.pageSize}
                onValueChange={(value) => update('pageSize', value as PageSize)}
              >
                <SelectTrigger id="doc-page-size">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PAGE_SIZES.map((size) => (
                    <SelectItem key={size} value={size}>
                      {PAGE_SIZE_LABELS[size]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="doc-margins">Margins</Label>
              <Select
                value={draft.margins}
                onValueChange={(value) => update('margins', value as MarginPreset)}
              >
                <SelectTrigger id="doc-margins">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MARGIN_PRESETS.map((preset) => (
                    <SelectItem key={preset} value={preset}>
                      {MARGIN_LABELS[preset]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="doc-date-format">Date format</Label>
            <Select
              value={draft.dateFormat}
              onValueChange={(value) => update('dateFormat', value as DateFormatPattern)}
            >
              <SelectTrigger id="doc-date-format">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DATE_FORMATS.map((pattern) => (
                  <SelectItem key={pattern} value={pattern}>
                    {formatDocDate(new Date().toISOString(), pattern)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <p className="text-xs leading-relaxed text-muted-foreground">
            Page size and margins apply to the PDF and Word exports, and to the estimated page count
            shown in the preview. HTML and Markdown are not paginated.
          </p>
        </section>
      </div>
    </Drawer>
  )
}
