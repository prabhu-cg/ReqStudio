import { useMemo } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/db'
import type { ActivityEvent, Project, ProjectPage } from '@/types/project'
import type { ReadinessReport } from '@/types/section'
import { computeReadiness } from '@/features/brief/lib/readiness'

export interface ProjectSummary {
  project: Project
  pages: ProjectPage[]
  pageCount: number
  readiness: ReadinessReport
}

/** All projects plus their pages, in one live query. */
export function useProjectSummaries(): ProjectSummary[] | undefined {
  const data = useLiveQuery(async () => {
    const [projects, pages] = await Promise.all([db.projects.toArray(), db.pages.toArray()])
    return { projects, pages }
  }, [])

  return useMemo(() => {
    if (!data) return undefined

    const pagesByProject = new Map<string, ProjectPage[]>()
    for (const page of data.pages) {
      if (page.deletedAt) continue
      const list = pagesByProject.get(page.projectId)
      if (list) list.push(page)
      else pagesByProject.set(page.projectId, [page])
    }

    return data.projects
      .filter((project) => !project.deletedAt)
      .map((project) => {
        const pages = (pagesByProject.get(project.id) ?? []).sort((a, b) => a.order - b.order)
        return {
          project,
          pages,
          pageCount: pages.length,
          readiness: computeReadiness(project, pages),
        }
      })
  }, [data])
}

export function useProject(projectId: string | undefined): Project | undefined | null {
  return useLiveQuery(async () => {
    if (!projectId) return null
    const project = await db.projects.get(projectId)
    return project && !project.deletedAt ? project : null
  }, [projectId])
}

export function useProjectPages(projectId: string | undefined): ProjectPage[] {
  const pages = useLiveQuery(async () => {
    if (!projectId) return []
    const result = await db.pages.where('projectId').equals(projectId).toArray()
    return result.filter((page) => !page.deletedAt).sort((a, b) => a.order - b.order)
  }, [projectId])

  return pages ?? []
}

export function usePage(pageId: string | undefined): ProjectPage | undefined | null {
  return useLiveQuery(async () => {
    if (!pageId) return null
    const page = await db.pages.get(pageId)
    return page && !page.deletedAt ? page : null
  }, [pageId])
}

export function useProjectActivity(projectId: string | undefined, limit = 100): ActivityEvent[] {
  const events = useLiveQuery(async () => {
    if (!projectId) return []
    const result = await db.activity.where('projectId').equals(projectId).toArray()
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, limit)
  }, [projectId, limit])

  return events ?? []
}

/** Live readiness for a single project — used across the workspace header. */
export function useProjectReadiness(
  project: Project | null | undefined,
  pages: ProjectPage[],
): ReadinessReport | null {
  return useMemo(() => (project ? computeReadiness(project, pages) : null), [project, pages])
}

/** Every tag in use, for the dashboard filter menu. */
export function useAllTags(summaries: ProjectSummary[] | undefined): string[] {
  return useMemo(() => {
    if (!summaries) return []
    const tags = new Set<string>()
    for (const { project } of summaries) project.tags.forEach((tag) => tags.add(tag))
    return [...tags].sort((a, b) => a.localeCompare(b))
  }, [summaries])
}
