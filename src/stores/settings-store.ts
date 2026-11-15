import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ThemePreference = 'light' | 'dark'
export type FontSizePreference = 'sm' | 'md' | 'lg'

export interface SettingsState {
  theme: ThemePreference
  fontSize: FontSizePreference
  autosaveEnabled: boolean
  /** Debounce window for autosave, in milliseconds. */
  autosaveDelay: number
  showCompletionHints: boolean
  setTheme: (theme: ThemePreference) => void
  setFontSize: (fontSize: FontSizePreference) => void
  setAutosaveEnabled: (enabled: boolean) => void
  setAutosaveDelay: (delay: number) => void
  setShowCompletionHints: (show: boolean) => void
  resetPreferences: () => void
}

const DEFAULTS = {
  theme: 'light' as ThemePreference,
  fontSize: 'md' as FontSizePreference,
  autosaveEnabled: true,
  autosaveDelay: 600,
  showCompletionHints: true,
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      setTheme: (theme) => set({ theme }),
      setFontSize: (fontSize) => set({ fontSize }),
      setAutosaveEnabled: (autosaveEnabled) => set({ autosaveEnabled }),
      setAutosaveDelay: (autosaveDelay) => set({ autosaveDelay }),
      setShowCompletionHints: (showCompletionHints) => set({ showCompletionHints }),
      resetPreferences: () => set({ ...DEFAULTS }),
    }),
    {
      // Key is also read by the inline theme script in index.html.
      name: 'reqstudio.settings',
      version: 2,
      // v1 offered a 'system' option; light is the default now.
      migrate: (persisted) => {
        const state = persisted as Partial<SettingsState> | undefined
        if (state && (state.theme as string) === 'system') state.theme = 'light'
        return state as SettingsState
      },
    },
  ),
)
