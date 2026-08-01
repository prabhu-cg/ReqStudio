import { db } from '../database'
import { DexieRepository } from '../repository'
import type { CreateInput, UpdateInput } from '@/types/entity'
import type { ProjectDocument } from '@/types/document'

/**
 * Per-project document configuration.
 *
 * One record per project, created lazily the first time a project's document is
 * configured or exported. The repository stays free of defaults so the document
 * feature owns what a "new" configuration looks like.
 */
export class DocumentRepository extends DexieRepository<ProjectDocument> {
  constructor() {
    super(db.documents)
  }

  async getByProject(projectId: string): Promise<ProjectDocument | undefined> {
    const record = await this.table.where('projectId').equals(projectId).first()
    return record?.deletedAt ? undefined : record
  }

  /** Returns the existing record, or creates one from `initial`. */
  async ensure(
    projectId: string,
    initial: Omit<CreateInput<ProjectDocument>, 'projectId'>,
  ): Promise<ProjectDocument> {
    const existing = await this.getByProject(projectId)
    if (existing) return existing
    return this.create({ ...initial, projectId } as CreateInput<ProjectDocument>)
  }

  async updateByProject(
    projectId: string,
    changes: UpdateInput<ProjectDocument>,
  ): Promise<ProjectDocument | undefined> {
    const existing = await this.getByProject(projectId)
    if (!existing) return undefined
    return this.update(existing.id, changes)
  }

  async removeByProject(projectId: string): Promise<void> {
    await this.table.where('projectId').equals(projectId).delete()
  }
}

export const documentRepository = new DocumentRepository()
