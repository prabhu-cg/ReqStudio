import { create } from 'zustand'
import type { DrawerState } from '@/types/drawer'
import { createId } from '@/lib/utils/id'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

export interface Toast {
  id: string
  title: string
  description?: string
  variant: 'default' | 'success' | 'danger'
}

export interface UIState {
  /** Drawer stack — the last entry is on top, so a drawer can open another. */
  drawers: DrawerState[]
  navCollapsed: boolean
  mobileNavOpen: boolean
  saveStatus: SaveStatus
  lastSavedAt: string | null
  toasts: Toast[]

  openDrawer: (drawer: DrawerState) => void
  replaceDrawer: (drawer: DrawerState) => void
  closeDrawer: () => void
  closeAllDrawers: () => void

  setNavCollapsed: (collapsed: boolean) => void
  toggleNav: () => void
  setMobileNavOpen: (open: boolean) => void

  setSaveStatus: (status: SaveStatus) => void

  toast: (toast: Omit<Toast, 'id'> | string) => void
  dismissToast: (id: string) => void
}

export const useUIStore = create<UIState>()((set) => ({
  drawers: [],
  navCollapsed: false,
  mobileNavOpen: false,
  saveStatus: 'idle',
  lastSavedAt: null,
  toasts: [],

  openDrawer: (drawer) => set((state) => ({ drawers: [...state.drawers, drawer] })),
  replaceDrawer: (drawer) => set((state) => ({ drawers: [...state.drawers.slice(0, -1), drawer] })),
  closeDrawer: () => set((state) => ({ drawers: state.drawers.slice(0, -1) })),
  closeAllDrawers: () => set({ drawers: [] }),

  setNavCollapsed: (navCollapsed) => set({ navCollapsed }),
  toggleNav: () => set((state) => ({ navCollapsed: !state.navCollapsed })),
  setMobileNavOpen: (mobileNavOpen) => set({ mobileNavOpen }),

  setSaveStatus: (saveStatus) =>
    set((state) => ({
      saveStatus,
      lastSavedAt: saveStatus === 'saved' ? new Date().toISOString() : state.lastSavedAt,
    })),

  toast: (input) => {
    const toast: Toast =
      typeof input === 'string'
        ? { id: createId(), title: input, variant: 'default' }
        : { id: createId(), ...input }
    set((state) => ({ toasts: [...state.toasts, toast] }))
  },
  dismissToast: (id) => set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export const selectTopDrawer = (state: UIState): DrawerState | undefined =>
  state.drawers[state.drawers.length - 1]
