import type { ComponentType } from 'react'
import type { DrawerState, DrawerType } from '@/types/drawer'
import { ProjectFormDrawer } from '@/features/projects/drawers/project-form-drawer'
import { ProjectDetailsDrawer } from '@/features/projects/drawers/project-details-drawer'
import { ProjectSettingsDrawer } from '@/features/projects/drawers/project-settings-drawer'
import { DeleteProjectDialog } from '@/features/projects/drawers/delete-project-dialog'
import { PageFormDrawer } from '@/features/pages/drawers/page-form-drawer'
import { DeletePageDialog } from '@/features/pages/drawers/delete-page-dialog'
import { DocumentSettingsDrawer } from '@/features/exports/drawers/document-settings-drawer'
import { ExportSettingsDrawer } from '@/features/exports/drawers/export-settings-drawer'

export interface DrawerComponentProps<T extends DrawerType = DrawerType> {
  state: Extract<DrawerState, { type: T }>
  open: boolean
  onClose: () => void
}

/**
 * Maps a drawer state variant to its component.
 *
 * Registering a new overlay is a one-line change here plus a variant in
 * `types/drawer.ts` — no host component edits.
 *
 * Nearly every entry renders a right-side `Drawer`. The exception is destructive
 * confirmation (`*.delete`), which renders a centred `ConfirmDialog`: those need
 * to interrupt the work rather than sit beside it.
 */
export const drawerRegistry: {
  [K in DrawerType]: ComponentType<DrawerComponentProps<K>>
} = {
  'project.create': ProjectFormDrawer,
  'project.edit': ProjectFormDrawer,
  'project.details': ProjectDetailsDrawer,
  'project.settings': ProjectSettingsDrawer,
  'project.delete': DeleteProjectDialog,
  'page.create': PageFormDrawer,
  'page.edit': PageFormDrawer,
  'page.delete': DeletePageDialog,
  'document.settings': DocumentSettingsDrawer,
  'export.settings': ExportSettingsDrawer,
}
