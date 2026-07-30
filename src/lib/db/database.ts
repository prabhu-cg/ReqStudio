import Dexie, { type Table } from 'dexie'
import type { ActivityEvent, Project, ProjectPage } from '@/types/project'

/**
 * IndexedDB schema.
 *
 * Version history is append-only: every future change adds a new `.version()`
 * block with its own upgrade function so existing local data survives upgrades.
 */
export class ReqStudioDatabase extends Dexie {
  projects!: Table<Project, string>
  pages!: Table<ProjectPage, string>
  activity!: Table<ActivityEvent, string>

  constructor(name = 'reqstudio') {
    super(name)

    this.version(1).stores({
      projects: 'id, name, client, status, type, priority, pinned, updatedAt, createdAt, deletedAt',
      pages: 'id, projectId, [projectId+order], name, updatedAt, deletedAt',
      activity: 'id, projectId, [projectId+createdAt], type, createdAt',
    })
  }
}

export const db = new ReqStudioDatabase()

/** Removes every local record. Backing the Settings → Reset Local Data action. */
export async function resetDatabase(): Promise<void> {
  await db.transaction('rw', db.projects, db.pages, db.activity, async () => {
    await Promise.all([db.projects.clear(), db.pages.clear(), db.activity.clear()])
  })
}

export async function estimateStorage(): Promise<{ usage: number; quota: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null
  const { usage = 0, quota = 0 } = await navigator.storage.estimate()
  return { usage, quota }
}
