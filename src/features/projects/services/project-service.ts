import {
  activityRepository,
  documentRepository,
  exportRepository,
  pageRepository,
  projectRepository,
} from '@/lib/db'
import type { Project, ProjectStatus } from '@/types/project'
import type { SectionValues } from '@/types/field'
import type { UpdateInput } from '@/types/entity'
import type { NewProjectInput } from '@/lib/db/repositories/project-repository'
import { getSection } from '@/features/brief/sections'
import { isSampleProject } from '@/features/sample/lib/sample-project'

/**
 * Project use-cases.
 *
 * All business rules live here — components call these functions and never talk
 * to a repository directly, which is what keeps the UI swappable and the storage
 * layer replaceable.
 */

/** Brief edits are noisy; collapse repeated edits to one entry per window. */
const BRIEF_ACTIVITY_WINDOW_MS = 5 * 60 * 1000

export async function createProject(input: NewProjectInput): Promise<Project> {
  const project = await projectRepository.createProject(input)
  await activityRepository.record(
    project.id,
    'project.created',
    `Project created`,
    project.client ? `Client: ${project.client}` : null,
  )
  return project
}

export async function updateProject(
  id: string,
  changes: UpdateInput<Project>,
): Promise<Project> {
  const before = await projectRepository.get(id)
  const project = await projectRepository.update(id, changes)

  if (before && changes.status && changes.status !== before.status) {
    await activityRepository.record(
      id,
      'project.status-changed',
      `Status changed to ${changes.status}`,
      `Previously ${before.status}`,
    )
  } else {
    await activityRepository.record(id, 'project.updated', 'Project details updated')
  }

  return project
}

export async function setProjectStatus(id: string, status: ProjectStatus): Promise<Project> {
  return updateProject(id, { status })
}

export async function togglePinned(id: string): Promise<void> {
  const project = await projectRepository.get(id)
  if (!project) return
  await projectRepository.setPinned(id, !project.pinned)
}

export async function deleteProject(id: string): Promise<void> {
  // The sample ships with the app rather than belonging to the user. The UI
  // hides every delete affordance for it; this is the backstop.
  if (isSampleProject(id)) {
    throw new Error('The built-in sample project cannot be deleted.')
  }

  await pageRepository.removeByProject(id)
  await activityRepository.removeByProject(id)
  await documentRepository.removeByProject(id)
  await exportRepository.removeByProject(id)
  await projectRepository.remove(id)
}

export async function duplicateProject(id: string): Promise<Project | undefined> {
  const copy = await projectRepository.duplicate(id)
  if (!copy) return undefined

  const pages = await pageRepository.listByProject(id)
  for (const page of pages) {
    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      deletedAt: _deletedAt,
      revision: _revision,
      syncState: _syncState,
      projectId: _projectId,
      ...rest
    } = page
    await pageRepository.createPage({ ...rest, projectId: copy.id })
  }

  await activityRepository.record(copy.id, 'project.created', 'Project duplicated')
  return copy
}

export async function openProject(id: string): Promise<void> {
  await projectRepository.touch(id)
}

export async function saveBriefSection(
  projectId: string,
  sectionId: string,
  values: SectionValues,
): Promise<void> {
  await projectRepository.saveSection(projectId, sectionId, values)
  await recordBriefActivity(projectId, sectionId)
}

async function recordBriefActivity(projectId: string, sectionId: string): Promise<void> {
  const section = getSection(sectionId)
  const title = section?.title ?? sectionId
  const recent = await activityRepository.listByProject(projectId, 10)
  const lastForSection = recent.find(
    (event) => event.type === 'brief.updated' && event.detail === sectionId,
  )

  if (lastForSection) {
    const age = Date.now() - new Date(lastForSection.createdAt).getTime()
    if (age < BRIEF_ACTIVITY_WINDOW_MS) return
  }

  await activityRepository.record(projectId, 'brief.updated', `${title} updated`, sectionId)
}
