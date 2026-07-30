/**
 * Every editing surface in ReqStudio is a right-side drawer — never a modal
 * dialog — so the page behind stays visible and in context.
 *
 * Adding a drawer means adding a variant here and registering a component in
 * `components/drawers/drawer-registry.tsx`.
 */
export type DrawerState =
  | { type: 'project.create' }
  | { type: 'project.edit'; projectId: string }
  | { type: 'project.details'; projectId: string }
  | { type: 'project.settings'; projectId: string }
  | { type: 'project.delete'; projectId: string }
  | { type: 'page.create'; projectId: string }
  | { type: 'page.edit'; projectId: string; pageId: string }
  | { type: 'page.delete'; projectId: string; pageId: string }

export type DrawerType = DrawerState['type']

export type DrawerProps<T extends DrawerType> = Extract<DrawerState, { type: T }>
