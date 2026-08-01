import { useState } from 'react'
import { Drawer } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { Label, Separator, Switch } from '@/components/ui/primitives'
import { useUIStore } from '@/stores/ui-store'
import type { DrawerComponentProps } from '@/components/drawers/drawer-registry'
import type { Project } from '@/types/project'
import type { ExportOptions } from '@/types/document'
import { useProject } from '@/features/projects/hooks/use-projects'
import { useProjectDocument } from '@/features/documents/hooks/use-document'
import { saveExportOptions } from '@/features/documents/services/document-service'
import { defaultExportOptions } from '@/features/documents/lib/document-settings'

/**
 * Export settings.
 *
 * Controls what goes into the generated file. Every option applies to all four
 * formats, so the preview and the exports never diverge.
 */

interface OptionGroup {
  title: string
  options: Array<{ key: keyof ExportOptions; label: string; help: string }>
}

const GROUPS: OptionGroup[] = [
  {
    title: 'Front matter',
    options: [
      {
        key: 'includeCover',
        label: 'Cover page',
        help: 'Title, client, version and status on their own page.',
      },
      {
        key: 'includeDocumentInfo',
        label: 'Document information',
        help: 'The document control table that follows the cover.',
      },
      {
        key: 'includeToc',
        label: 'Table of contents',
        help: 'Generated from the sections, with page numbers and links.',
      },
    ],
  },
  {
    title: 'Content',
    options: [
      {
        key: 'includeExecutiveSummary',
        label: 'Executive summary',
        help: 'A one-page orientation assembled from the brief.',
      },
      {
        key: 'includeApprovals',
        label: 'Approvals section',
        help: 'Approval matrix and the sign-off block.',
      },
      {
        key: 'includeAppendix',
        label: 'Appendix',
        help: 'Completeness by section, outstanding answers and recommendations.',
      },
      {
        key: 'includeEmptySections',
        label: 'Unanswered fields',
        help: 'Show fields nobody has filled in, marked as not provided.',
      },
    ],
  },
  {
    title: 'Page furniture',
    options: [
      {
        key: 'headers',
        label: 'Running headers',
        help: 'Project name and version at the top of every page.',
      },
      {
        key: 'footers',
        label: 'Running footers',
        help: 'Footer text and generation date at the foot of every page.',
      },
      {
        key: 'pageNumbers',
        label: 'Page numbers',
        help: '“Page 3 of 24” in the footer of paginated formats.',
      },
    ],
  },
]

export function ExportSettingsDrawer({
  state,
  open,
  onClose,
}: DrawerComponentProps<'export.settings'>) {
  const project = useProject(state.projectId)
  const record = useProjectDocument(state.projectId)

  if (project === undefined || record === undefined) {
    return (
      <Drawer open={open} onOpenChange={(next) => !next && onClose()} title="Export settings">
        <p className="text-sm text-muted-foreground">Loading export settings…</p>
      </Drawer>
    )
  }

  if (!project) {
    return (
      <Drawer open={open} onOpenChange={(next) => !next && onClose()} title="Export settings">
        <p className="text-sm text-muted-foreground">This project is no longer available.</p>
      </Drawer>
    )
  }

  return (
    <ExportSettingsForm
      key={record?.id ?? 'defaults'}
      project={project}
      initial={record?.options ?? defaultExportOptions()}
      open={open}
      onClose={onClose}
    />
  )
}

function ExportSettingsForm({
  project,
  initial,
  open,
  onClose,
}: {
  project: Project
  initial: ExportOptions
  open: boolean
  onClose: () => void
}) {
  const toast = useUIStore((store) => store.toast)
  const [draft, setDraft] = useState<ExportOptions>(initial)
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await saveExportOptions(project, draft)
      toast({ title: 'Export settings saved', variant: 'success' })
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

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title="Export settings"
      description="What goes into the generated document."
      size="md"
      footer={
        <>
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
        {GROUPS.map((group, index) => (
          <section key={group.title} className="flex flex-col gap-4">
            {index > 0 ? <Separator className="-mt-2" /> : null}
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              {group.title}
            </h3>

            {group.options.map((option) => {
              const id = `export-option-${option.key}`
              return (
                <div key={option.key} className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <Label htmlFor={id}>{option.label}</Label>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {option.help}
                    </p>
                  </div>
                  <Switch
                    id={id}
                    checked={draft[option.key]}
                    onCheckedChange={(checked) =>
                      setDraft((current) => ({ ...current, [option.key]: checked }))
                    }
                  />
                </div>
              )
            })}
          </section>
        ))}
      </div>
    </Drawer>
  )
}
