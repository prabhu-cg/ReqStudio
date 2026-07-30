import { ConfirmDialog } from '@/components/common/confirm-dialog'
import { useUIStore } from '@/stores/ui-store'
import { usePage } from '@/features/projects/hooks/use-projects'
import { deletePage } from '../services/page-service'
import type { DrawerComponentProps } from '@/components/drawers/drawer-registry'

/** Destructive confirmation — a centred modal, not a drawer. */
export function DeletePageDialog({ state, open, onClose }: DrawerComponentProps<'page.delete'>) {
  const page = usePage(state.pageId)
  const toast = useUIStore((store) => store.toast)
  const closeAllDrawers = useUIStore((store) => store.closeAllDrawers)

  const name = page?.name || 'this page'

  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      title="Delete page"
      description={`“${name}” will be removed from the page requirements. This cannot be undone.`}
      confirmLabel="Delete page"
      onConfirm={async () => {
        await deletePage(state.pageId)
        toast({ title: 'Page deleted', description: name, variant: 'danger' })
        closeAllDrawers()
      }}
    />
  )
}
