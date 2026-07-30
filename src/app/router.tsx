import { createElement } from 'react'
import { createBrowserRouter, type RouteObject } from 'react-router-dom'
import { AppShell } from './app-shell'
import { RouteErrorBoundary } from './error-boundary'
import { DashboardPage } from '@/pages/dashboard-page'
import { ProjectsPage } from '@/pages/projects-page'
import { RecentPage } from '@/pages/recent-page'
import { SettingsPage } from '@/pages/settings-page'
import { TemplatesPage } from '@/pages/templates-page'
import { NotFoundPage } from '@/pages/not-found-page'
import {
  ProjectWorkspace,
  WorkspaceIndexRedirect,
} from '@/features/workspace/project-workspace'
import { workspaceTabs } from '@/features/workspace/workspace-tabs'

/** Workspace tab routes are generated from the tab registry. */
const workspaceTabRoutes: RouteObject[] = [
  { index: true, element: <WorkspaceIndexRedirect /> },
  ...workspaceTabs.map<RouteObject>((tab) => ({
    path: tab.path,
    element: createElement(tab.component),
  })),
]

const routes: RouteObject[] = [
  {
    path: '/',
    element: <AppShell />,
    errorElement: <RouteErrorBoundary />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'projects', element: <ProjectsPage /> },
      { path: 'recent', element: <RecentPage /> },
      {
        path: 'projects/:projectId',
        element: <ProjectWorkspace />,
        children: workspaceTabRoutes,
      },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]

export const router = createBrowserRouter(routes, {
  // Supports GitHub Pages project sites served from a sub-path.
  basename: import.meta.env.BASE_URL.replace(/\/$/, '') || undefined,
})
