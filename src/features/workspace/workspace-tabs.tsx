import type { ComponentType } from 'react'
import { Activity, FileText, LayoutDashboard, ScrollText, type LucideIcon } from 'lucide-react'
import { OverviewTab } from './tabs/overview-tab'
import { BriefTab } from './tabs/brief-tab'
import { PreviewTab } from './tabs/preview-tab'
import { ActivityTab } from './tabs/activity-tab'

export interface WorkspaceTab {
  id: string
  /** Route segment beneath `/projects/:projectId`. */
  path: string
  label: string
  icon: LucideIcon
  component: ComponentType
  /** Exactly one tab is the index route. */
  index?: boolean
}

/**
 * Workspace tab registry.
 *
 * Adding a tab in a future phase (Sitemap, Complexity, AI Prompts…) means adding
 * an entry here — the router, the tab bar and deep links all follow.
 */
export const workspaceTabs: readonly WorkspaceTab[] = [
  {
    id: 'overview',
    path: 'overview',
    label: 'Overview',
    icon: LayoutDashboard,
    component: OverviewTab,
    index: true,
  },
  { id: 'brief', path: 'brief', label: 'Brief', icon: FileText, component: BriefTab },
  { id: 'preview', path: 'preview', label: 'Preview', icon: ScrollText, component: PreviewTab },
  { id: 'activity', path: 'activity', label: 'Activity', icon: Activity, component: ActivityTab },
]
