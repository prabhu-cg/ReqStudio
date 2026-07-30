import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useUIStore } from '@/stores/ui-store'
import { GlobalSearch } from './global-search'
import { ThemeToggle } from './theme-toggle'
import { SaveIndicator } from './save-indicator'

export function TopBar() {
  const setMobileNavOpen = useUIStore((state) => state.setMobileNavOpen)

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md lg:px-6">
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={() => setMobileNavOpen(true)}
        aria-label="Open navigation"
      >
        <Menu aria-hidden="true" />
      </Button>

      <div className="w-full max-w-sm shrink-0">
        <GlobalSearch />
      </div>

      <div className="flex-1" />

      <div className="flex shrink-0 items-center gap-3">
        <SaveIndicator className="hidden lg:flex" />
        <ThemeToggle />
      </div>
    </header>
  )
}
