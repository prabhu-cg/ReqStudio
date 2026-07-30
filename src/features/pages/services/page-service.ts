import { activityRepository, pageRepository } from '@/lib/db'
import type { ProjectPage } from '@/types/project'
import type { UpdateInput } from '@/types/entity'
import type { NewPageInput } from '@/lib/db/repositories/page-repository'

export async function createPage(input: NewPageInput): Promise<ProjectPage> {
  const page = await pageRepository.createPage(input)
  await activityRepository.record(
    page.projectId,
    'page.created',
    `Page added: ${page.name || 'Untitled page'}`,
  )
  return page
}

export async function updatePage(
  id: string,
  changes: UpdateInput<ProjectPage>,
): Promise<ProjectPage> {
  return pageRepository.update(id, changes)
}

export async function deletePage(id: string): Promise<void> {
  const page = await pageRepository.get(id)
  await pageRepository.remove(id)
  if (page) {
    await activityRepository.record(
      page.projectId,
      'page.deleted',
      `Page removed: ${page.name || 'Untitled page'}`,
    )
  }
}

export async function duplicatePage(id: string): Promise<ProjectPage | undefined> {
  const source = await pageRepository.get(id)
  if (!source) return undefined

  const {
    id: _id,
    createdAt: _createdAt,
    updatedAt: _updatedAt,
    deletedAt: _deletedAt,
    revision: _revision,
    syncState: _syncState,
    order: _order,
    ...rest
  } = source

  return createPage({ ...rest, name: `${source.name} (copy)` })
}

/** Moves a page one position up or down within its project. */
export async function movePage(page: ProjectPage, direction: -1 | 1): Promise<void> {
  const pages = await pageRepository.listByProject(page.projectId)
  const index = pages.findIndex((candidate) => candidate.id === page.id)
  const target = index + direction
  if (index < 0 || target < 0 || target >= pages.length) return

  const reordered = [...pages]
  const [moved] = reordered.splice(index, 1)
  reordered.splice(target, 0, moved!)
  await pageRepository.reorder(reordered.map((item) => item.id))
}
