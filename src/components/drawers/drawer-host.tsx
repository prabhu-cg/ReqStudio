import type { ComponentType } from 'react'
import { useUIStore } from '@/stores/ui-store'
import { drawerRegistry, type DrawerComponentProps } from './drawer-registry'

/**
 * Renders the drawer stack.
 *
 * Only the topmost drawer is mounted open; the ones below stay mounted but
 * closed so their state survives a nested drawer (e.g. Delete opened from Edit).
 */
export function DrawerHost() {
  const drawers = useUIStore((state) => state.drawers)
  const closeDrawer = useUIStore((state) => state.closeDrawer)

  return (
    <>
      {drawers.map((state, index) => {
        const Component = drawerRegistry[state.type] as ComponentType<DrawerComponentProps>
        const isTop = index === drawers.length - 1
        return (
          <Component
            key={`${state.type}-${index}`}
            state={state}
            open={isTop}
            onClose={closeDrawer}
          />
        )
      })}
    </>
  )
}
