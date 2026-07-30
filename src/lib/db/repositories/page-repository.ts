import { db } from '../database'
import { DexieRepository } from '../repository'
import type { CreateInput } from '@/types/entity'
import type { ProjectPage } from '@/types/project'

export type NewPageInput = Omit<CreateInput<ProjectPage>, 'order'> & { order?: number }

export const EMPTY_PAGE: Omit<CreateInput<ProjectPage>, 'projectId' | 'order'> = {
  name: '',
  purpose: '',
  audience: '',
  summary: '',
  businessGoal: '',
  primaryCta: '',
  secondaryCta: '',
  contentRequirements: [],
  requiredComponents: [],
  dependencies: [],
  seoNotes: '',
  accessibilityNotes: '',
  analytics: '',
  internalNotes: '',
}

export class PageRepository extends DexieRepository<ProjectPage> {
  constructor() {
    super(db.pages)
  }

  async listByProject(projectId: string): Promise<ProjectPage[]> {
    const pages = await this.table.where('projectId').equals(projectId).toArray()
    return pages.filter((page) => !page.deletedAt).sort((a, b) => a.order - b.order)
  }

  async countByProject(projectId: string): Promise<number> {
    return this.table.where('projectId').equals(projectId).count()
  }

  async createPage(input: NewPageInput): Promise<ProjectPage> {
    const order = input.order ?? (await this.nextOrder(input.projectId))
    return this.create({ ...EMPTY_PAGE, ...input, order } as CreateInput<ProjectPage>)
  }

  /** Persists a new page order; `orderedIds` is the full list in display order. */
  async reorder(orderedIds: string[]): Promise<void> {
    const updatedAt = new Date().toISOString()
    await db.transaction('rw', this.table, async () => {
      for (const [index, id] of orderedIds.entries()) {
        await this.table.where({ id }).modify({ order: index, updatedAt })
      }
    })
  }

  async removeByProject(projectId: string): Promise<void> {
    await this.table.where('projectId').equals(projectId).delete()
  }

  private async nextOrder(projectId: string): Promise<number> {
    const pages = await this.listByProject(projectId)
    return pages.length === 0 ? 0 : Math.max(...pages.map((page) => page.order)) + 1
  }
}

export const pageRepository = new PageRepository()
