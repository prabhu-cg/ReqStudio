import { useLocation, useNavigate } from 'react-router-dom'
import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useUIStore } from '@/stores/ui-store'
import { useProject, useProjectPages } from '../hooks/use-projects'
import { deleteProject } from '../services/project-service'
import type { DrawerComponentProps } from '@/components/drawers/drawer-registry'
import { pluralize } from '@/lib/utils/text'

/** Destructive confirmation — a centred modal, not a drawer. */
export function DeleteProjectDialog({
  state,
  open,
  onClose,
}: DrawerComponentProps<'project.delete'>) {
  const project = useProject(state.projectId)
  const pages = useProjectPages(state.projectId)
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useUIStore((store) => store.toast)
  const closeAllDrawers = useUIStore((store) => store.closeAllDrawers)

  const name = project?.name || 'this project'

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Delete project"
      description={`“${name}” and its ${pluralize(pages.length, 'page')} will be permanently removed from this device. This cannot be undone.`}
      confirmLabel="Delete project"
      onConfirm={async () => {
        try {
          await deleteProject(state.projectId)
        } catch (error) {
          // The only project that refuses deletion is the built-in sample, and
          // every route to this dialog is already hidden for it.
          toast({
            title: 'Could not delete this project',
            description: error instanceof Error ? error.message : undefined,
            variant: 'danger',
          })
          closeAllDrawers()
          return
        }

        toast({ title: 'Project deleted', description: name, variant: 'danger' })
        closeAllDrawers()
        if (location.pathname.startsWith(`/projects/${state.projectId}`)) {
          navigate('/projects')
        }
      }}
    >
      <p className="text-sm text-muted-foreground">
        ReqStudio stores everything locally, so there is no server-side copy to restore from.
      </p>
    </ConfirmDialog>
  )
}
