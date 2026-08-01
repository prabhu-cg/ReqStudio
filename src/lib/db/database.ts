import Dexie, { type Table } from 'dexie'
import type { ActivityEvent, Project, ProjectPage } from '@/types/project'
import type { ExportRecord, ProjectDocument } from '@/types/document'

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
  documents!: Table<ProjectDocument, string>
  exports!: Table<ExportRecord, string>

  constructor(name = 'reqstudio') {
    super(name)

    this.version(1).stores({
      projects: 'id, name, client, status, type, priority, pinned, updatedAt, createdAt, deletedAt',
      pages: 'id, projectId, [projectId+order], name, updatedAt, deletedAt',
      activity: 'id, projectId, [projectId+createdAt], type, createdAt',
    })

    // Phase 2. Both tables are additive — no upgrade function is needed because
    // no existing store or record shape changed.
    this.version(2).stores({
      documents: 'id, &projectId, updatedAt, deletedAt',
      exports: 'id, projectId, [projectId+createdAt], format, createdAt, deletedAt',
    })
  }
}

export const db = new ReqStudioDatabase()

/** Removes every local record. Backing the Settings → Reset Local Data action. */
export async function resetDatabase(): Promise<void> {
  await db.transaction('rw', db.projects, db.pages, db.activity, db.documents, db.exports, async () => {
    await Promise.all([
      db.projects.clear(),
      db.pages.clear(),
      db.activity.clear(),
      db.documents.clear(),
      db.exports.clear(),
    ])
  })
}

export async function estimateStorage(): Promise<{ usage: number; quota: number } | null> {
  if (typeof navigator === 'undefined' || !navigator.storage?.estimate) return null
  const { usage = 0, quota = 0 } = await navigator.storage.estimate()
  return { usage, quota }
}
