import { Copy, Pin, PinOff, Trash2 } from 'lucide-react'
import { Drawer } from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label, Separator } from '@/components/ui/primitives'
import { useProject } from '../hooks/use-projects'
import { duplicateProject, setProjectStatus, togglePinned } from '../services/project-service'
import { STATUS_OPTIONS } from '../lib/project-display'
import { useUIStore } from '@/stores/ui-store'
import type { DrawerComponentProps } from '@/components/drawers/drawer-registry'
import type { ProjectStatus } from '@/types/project'

/** Per-project actions that are not part of the brief itself. */
export function ProjectSettingsDrawer({
  state,
  open,
  onClose,
}: DrawerComponentProps<'project.settings'>) {
  const project = useProject(state.projectId)
  const openDrawer = useUIStore((store) => store.openDrawer)
  const toast = useUIStore((store) => store.toast)

  return (
    <Drawer
      open={open}
      onOpenChange={(next) => !next && onClose()}
      title="Project settings"
      description={project?.name}
      size="md"
    >
      {!project ? (
        <p className="text-sm text-muted-foreground">This project is no longer available.</p>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Label htmlFor="project-status">Status</Label>
            <Select
              value={project.status}
              onValueChange={(value) => void setProjectStatus(project.id, value as ProjectStatus)}
            >
              <SelectTrigger id="project-status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Archived projects stay searchable but drop out of the default dashboard view.
            </p>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">
              Actions
            </h3>

            <Button
              variant="secondary"
              className="justify-start"
              onClick={() => void togglePinned(project.id)}
            >
              {project.pinned ? <PinOff aria-hidden="true" /> : <Pin aria-hidden="true" />}
              {project.pinned ? 'Unpin from dashboard' : 'Pin to dashboard'}
            </Button>

            <Button
              variant="secondary"
              className="justify-start"
              onClick={async () => {
                const copy = await duplicateProject(project.id)
                if (copy) toast({ title: 'Project duplicated', description: copy.name, variant: 'success' })
              }}
            >
              <Copy aria-hidden="true" />
              Duplicate project and pages
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col gap-3">
            <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-danger">
              Danger zone
            </h3>
            <p className="text-sm text-muted-foreground">
              Deleting removes the project and every page from this device permanently.
            </p>
            {/* Left-aligned like the action list above would read as another
                list row; a filled destructive button centres its label. */}
            <Button
              variant="danger"
              onClick={() => openDrawer({ type: 'project.delete', projectId: project.id })}
            >
              <Trash2 aria-hidden="true" />
              Delete project
            </Button>
          </div>
        </div>
      )}
    </Drawer>
  )
}
