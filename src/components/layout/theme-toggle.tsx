import { Moon, Sun } from 'lucide-react'
import { useSettingsStore, type ThemePreference } from '@/stores/settings-store'
import { cn } from '@/lib/utils/cn'

const OPTIONS: Array<{ value: ThemePreference; label: string; icon: typeof Sun }> = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
]

/** Segmented light / dark control. */
export function ThemeToggle({ className }: { className?: string }) {
  const theme = useSettingsStore((state) => state.theme)
  const setTheme = useSettingsStore((state) => state.setTheme)

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn('flex items-center gap-0.5 rounded-full border border-border bg-surface p-1', className)}
    >
      {OPTIONS.map((option) => {
        const Icon = option.icon
        const selected = theme === option.value
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${option.label} theme`}
            onClick={() => setTheme(option.value)}
            className={cn(
              'grid size-7 place-items-center rounded-full transition-colors',
              selected
                ? 'bg-primary-soft text-primary-text'
                : 'text-muted-foreground hover:text-foreground',
            )}
          >
            <Icon className="size-3.5" aria-hidden="true" />
          </button>
        )
      })}
    </div>
  )
}
