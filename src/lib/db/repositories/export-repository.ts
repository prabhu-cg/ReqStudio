import { db } from '../database'
import { DexieRepository } from '../repository'
import type { CreateInput } from '@/types/entity'
import type { ExportRecord } from '@/types/document'

/** Download history is capped so a heavily-exported project cannot grow forever. */
const MAX_RECORDS_PER_PROJECT = 50

export class ExportRepository extends DexieRepository<ExportRecord> {
  constructor() {
    super(db.exports)
  }

  /** Newest first. */
  async listByProject(projectId: string, limit = MAX_RECORDS_PER_PROJECT): Promise<ExportRecord[]> {
    const records = await this.table.where('projectId').equals(projectId).toArray()
    return records
      .filter((record) => !record.deletedAt)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
  }

  async record(input: CreateInput<ExportRecord>): Promise<ExportRecord> {
    const created = await this.create(input)
    await this.trim(input.projectId)
    return created
  }

  async removeByProject(projectId: string): Promise<void> {
    await this.table.where('projectId').equals(projectId).delete()
  }

  private async trim(projectId: string): Promise<void> {
    const records = await this.table.where('projectId').equals(projectId).toArray()
    if (records.length <= MAX_RECORDS_PER_PROJECT) return
    const stale = records
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(0, records.length - MAX_RECORDS_PER_PROJECT)
    await this.bulkRemove(stale.map((record) => record.id))
  }
}

export const exportRepository = new ExportRepository()
