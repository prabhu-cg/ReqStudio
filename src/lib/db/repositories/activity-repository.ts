import { db } from '../database'
import { DexieRepository } from '../repository'
import type { ActivityEvent, ActivityType } from '@/types/project'
import type { CreateInput } from '@/types/entity'

const MAX_EVENTS_PER_PROJECT = 200

export class ActivityRepository extends DexieRepository<ActivityEvent> {
  constructor() {
    super(db.activity)
  }

  async listByProject(projectId: string, limit = 100): Promise<ActivityEvent[]> {
    const events = await this.table.where('projectId').equals(projectId).toArray()
    return events
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, limit)
  }

  async record(
    projectId: string,
    type: ActivityType,
    summary: string,
    detail: string | null = null,
  ): Promise<void> {
    await this.create({ projectId, type, summary, detail } as CreateInput<ActivityEvent>)
    await this.trim(projectId)
  }

  async removeByProject(projectId: string): Promise<void> {
    await this.table.where('projectId').equals(projectId).delete()
  }

  /** Keeps the log bounded so a long-lived project cannot grow without limit. */
  private async trim(projectId: string): Promise<void> {
    const events = await this.table.where('projectId').equals(projectId).toArray()
    if (events.length <= MAX_EVENTS_PER_PROJECT) return
    const stale = events
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(0, events.length - MAX_EVENTS_PER_PROJECT)
    await this.bulkRemove(stale.map((event) => event.id))
  }
}

export const activityRepository = new ActivityRepository()
