import { NavLink, useMatch } from 'react-router-dom'
import {
  Clock,
  FolderKanban,
  LayoutDashboard,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  type LucideIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { Button } from '@/components/ui/button'
import { Wordmark, Logo } from './logo'
import { useUIStore } from '@/stores/ui-store'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/primitives'

interface NavItem {
  to: string
  label: string
  icon: LucideIcon
  end?: boolean
  disabled?: boolean
  badge?: string
}

/** Navigation is data-driven so future phases add an entry, not a branch. */
const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/projects', label: 'Projects', icon: FolderKanban },
  { to: '/recent', label: 'Recent', icon: Clock },
  { to: '/templates', label: 'Templates', icon: Layers, disabled: true, badge: 'Soon' },
]

/** Pinned to the bottom of the rail, above the collapse control. */
const FOOTER_NAV_ITEMS: NavItem[] = [{ to: '/settings', label: 'Settings', icon: Settings }]

export function LeftNav({ onNavigate }: { onNavigate?: () => void }) {
  const collapsed = useUIStore((state) => state.navCollapsed)
  const toggleNav = useUIStore((state) => state.toggleNav)

  return (
    <nav
      aria-label="Primary"
      className={cn(
        'flex h-full flex-col border-r border-border bg-surface transition-[width] duration-200',
        collapsed ? 'w-[68px]' : 'w-60',
      )}
    >
      <div className={cn('flex h-14 items-center px-3', collapsed && 'justify-center')}>
        {collapsed ? <Logo className="h-7" /> : <Wordmark className="px-1" />}
      </div>

      <ul className="flex flex-1 flex-col gap-1 px-3 py-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavItemLink item={item} collapsed={collapsed} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>

      <ul className="flex flex-col gap-1 px-3 pb-2">
        {FOOTER_NAV_ITEMS.map((item) => (
          <li key={item.to}>
            <NavItemLink item={item} collapsed={collapsed} onNavigate={onNavigate} />
          </li>
        ))}
      </ul>

      <div className="border-t border-border p-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleNav}
          className={cn('w-full', collapsed ? 'h-10 justify-center px-0' : 'justify-start')}
          aria-label={collapsed ? 'Expand navigation' : 'Collapse navigation'}
        >
          {collapsed ? (
            <PanelLeftOpen aria-hidden="true" />
          ) : (
            <>
              <PanelLeftClose aria-hidden="true" />
              Collapse
            </>
          )}
        </Button>
      </div>
    </nav>
  )
}

function NavItemLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: NavItem
  collapsed: boolean
  onNavigate?: () => void
}) {
  const Icon = item.icon

  // Active state is resolved here rather than through NavLink's function-form
  // `className`: when collapsed the link is wrapped in <TooltipTrigger asChild>,
  // and Radix's Slot merges className as a string — which would stringify the
  // function instead of calling it, dropping every class on the element.
  const isActive = Boolean(useMatch({ path: item.to, end: item.end ?? false }))

  // A fixed square when collapsed keeps every icon — nav, settings, collapse —
  // on the same vertical axis as the logo.
  const baseClasses = cn(
    'flex items-center rounded-[8px] text-sm font-medium transition-colors',
    collapsed ? 'h-10 w-full justify-center px-0' : 'gap-3 px-3 py-2',
  )

  if (item.disabled) {
    const content = (
      <span
        aria-disabled="true"
        title={`${item.label} — coming in a future release`}
        className={cn(baseClasses, 'cursor-not-allowed text-muted-foreground/60')}
      >
        <Icon className="size-4 shrink-0" aria-hidden="true" />
        {!collapsed ? (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                {item.badge}
              </span>
            ) : null}
          </>
        ) : null}
      </span>
    )

    return collapsed ? (
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent side="right">{item.label} — coming soon</TooltipContent>
      </Tooltip>
    ) : (
      content
    )
  }

  const link = (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        baseClasses,
        isActive
          ? 'bg-primary-soft text-primary-text'
          : 'text-muted-foreground hover:bg-muted hover:text-foreground',
      )}
    >
      <Icon className="size-4 shrink-0" aria-hidden="true" />
      {!collapsed ? <span className="flex-1">{item.label}</span> : null}
    </NavLink>
  )

  return collapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  ) : (
    link
  )
}
