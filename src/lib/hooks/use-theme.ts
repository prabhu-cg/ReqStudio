import { useEffect } from 'react'
import { useSettingsStore } from '@/stores/settings-store'

/** Applies theme and font-size preferences to the document element. */
export function useThemeEffect(): void {
  const theme = useSettingsStore((state) => state.theme)
  const fontSize = useSettingsStore((state) => state.fontSize)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    document.documentElement.dataset.fontSize = fontSize
  }, [fontSize])
}
