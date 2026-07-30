import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import * as Dialog from '@radix-ui/react-dialog'
import { LeftNav } from '@/components/layout/left-nav'
import { TopBar } from '@/components/layout/top-bar'
import { StatusBar } from '@/components/layout/status-bar'
import { DrawerHost } from '@/components/drawers/drawer-host'
import { Toaster } from '@/components/common/toaster'
import { useUIStore } from '@/stores/ui-store'
import { useThemeEffect } from '@/lib/hooks/use-theme'

export function AppShell() {
  useThemeEffect()

  const location = useLocation()
  const mobileNavOpen = useUIStore((state) => state.mobileNavOpen)
  const setMobileNavOpen = useUIStore((state) => state.setMobileNavOpen)

  // Close the mobile drawer navigation whenever the route changes.
  useEffect(() => {
    setMobileNavOpen(false)
  }, [location.pathname, setMobileNavOpen])

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-100 focus:rounded-[8px] focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground"
      >
        Skip to main content
      </a>

      <div className="flex min-h-0 flex-1">
        <div className="hidden lg:block">
          <LeftNav />
        </div>

        <Dialog.Root open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-60 bg-foreground/25 backdrop-blur-[2px] data-[state=open]:animate-[fade-in_150ms_ease-out] lg:hidden" />
            <Dialog.Content className="fixed inset-y-0 left-0 z-70 w-60 outline-none data-[state=open]:animate-[fade-in_180ms_ease-out] lg:hidden">
              <Dialog.Title className="sr-only">Navigation</Dialog.Title>
              <Dialog.Description className="sr-only">
                Move between the dashboard, projects and settings.
              </Dialog.Description>
              <LeftNav onNavigate={() => setMobileNavOpen(false)} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>

        <div className="flex min-w-0 flex-1 flex-col">
          <TopBar />
          {/* Routes own their own scrolling: the project workspace pins its
              header and scrolls only the active tab, which it cannot do if the
              shell scrolls everything as one document. */}
          <main id="main-content" className="min-h-0 flex-1 overflow-hidden">
            <Outlet />
          </main>
        </div>
      </div>

      <StatusBar />
      <DrawerHost />
      <Toaster />
    </div>
  )
}
