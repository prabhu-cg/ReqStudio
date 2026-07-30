import { useOutletContext } from 'react-router-dom'
import type { Project, ProjectPage } from '@/types/project'
import type { ReadinessReport } from '@/types/section'

export interface WorkspaceContext {
  project: Project
  pages: ProjectPage[]
  readiness: ReadinessReport
  /** Navigates to the Brief tab with a section selected. */
  goToSection: (sectionId: string) => void
}

/** Typed access to the workspace outlet context from any tab. */
export function useWorkspace(): WorkspaceContext {
  return useOutletContext<WorkspaceContext>()
}
