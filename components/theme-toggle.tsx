'use client'

import { Moon, Sun } from 'lucide-react'
import { THEME_STORAGE_KEY } from '@/lib/theme'

/**
 * Light / dark only — there is no "system" option. A 36px pill icon button
 * (moon in light mode, sun in dark). Both icons render and swap with CSS, so
 * there is no flash and no hydration mismatch; the choice lives on
 * `<html class="dark">` and in localStorage.
 */
export function ThemeToggle() {
  function toggle() {
    const dark = document.documentElement.classList.toggle('dark')
    try {
      localStorage.setItem(THEME_STORAGE_KEY, dark ? 'dark' : 'light')
    } catch {
      /* storage unavailable — the choice applies for this visit only */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle light and dark mode"
      className="grid size-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Moon className="size-4 dark:hidden" aria-hidden="true" />
      <Sun className="hidden size-4 dark:block" aria-hidden="true" />
    </button>
  )
}
