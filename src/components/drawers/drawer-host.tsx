import { useEffect, useState, type ComponentType } from 'react'
import { useUIStore } from '@/stores/ui-store'
import type { DrawerState } from '@/types/drawer'
import { drawerRegistry, type DrawerComponentProps } from './drawer-registry'

/**
 * How long a closed drawer stays mounted so its exit animation can play.
 * The drawer slides out over 180ms; this leaves headroom, and Radix unmounts
 * the content itself as soon as the animation ends.
 */
const EXIT_MS = 300

// Each stack entry is an immutable object, so its identity is a stable key.
// That lets an entry keep the same React instance when it moves from the live
// stack to the leaving list, which is what lets the slide-out finish.
let nextId = 0
const ids = new WeakMap<DrawerState, number>()
function idOf(state: DrawerState): number {
  let id = ids.get(state)
  if (id === undefined) {
    id = ++nextId
    ids.set(state, id)
  }
  return id
}

const noop = () => {}

/**
 * Renders the drawer stack.
 *
 * Only the topmost drawer is mounted open; the ones below stay mounted but
 * closed so their state survives a nested drawer (e.g. Delete opened from Edit).
 *
 * A drawer removed from the stack is not unmounted at once. It is kept for
 * `EXIT_MS` with `open={false}` so it slides out instead of vanishing, and its
 * `onClose` is inert so a stray Escape during the exit cannot pop a second drawer.
 */
export function DrawerHost() {
  const drawers = useUIStore((state) => state.drawers)
  const closeDrawer = useUIStore((state) => state.closeDrawer)

  const [previous, setPrevious] = useState(drawers)
  const [leaving, setLeaving] = useState<DrawerState[]>([])

  // Derive the leaving list while rendering (the supported "adjust state on
  // change" pattern), so there is never a frame where the drawer is unmounted.
  if (previous !== drawers) {
    const removed = previous.filter((entry) => !drawers.includes(entry))
    setPrevious(drawers)
    if (removed.length > 0) setLeaving((current) => [...current, ...removed])
  }

  useEffect(() => {
    if (leaving.length === 0) return
    const timer = setTimeout(() => setLeaving([]), EXIT_MS)
    return () => clearTimeout(timer)
  }, [leaving])

  // One flat list, not two sibling lists: React matches keys only within a
  // single list, so an entry moving from "live" to "leaving" would otherwise
  // remount, and a freshly mounted closed drawer renders nothing at all.
  const entries = [
    ...drawers.map((state, index) => ({
      state,
      open: index === drawers.length - 1,
      onClose: closeDrawer,
    })),
    ...leaving.map((state) => ({ state, open: false, onClose: noop })),
  ]

  return (
    <>
      {entries.map(({ state, open, onClose }) => {
        const Component = drawerRegistry[state.type] as ComponentType<DrawerComponentProps>
        return <Component key={idOf(state)} state={state} open={open} onClose={onClose} />
      })}
    </>
  )
}
