import { db, projectRepository } from '@/lib/db'
import { duplicateProject } from '@/features/projects/services/project-service'
import type { Project, ProjectPage } from '@/types/project'
import type { ProjectDocument } from '@/types/document'
import {
  SAMPLE_DOCUMENT_SETTINGS,
  SAMPLE_EXPORT_OPTIONS,
  SAMPLE_PAGES,
  SAMPLE_PROJECT,
  SAMPLE_PROJECT_ID,
  SAMPLE_TIMESTAMPS,
} from '../lib/sample-project'

/**
 * Sample project seeding.
 *
 * Runs at every start and is idempotent: the sample is written only when it is
 * missing, so a user who has opened it keeps their `lastOpenedAt` and the
 * record is not rewritten on every launch. Because it is restored whenever it
 * is absent, clearing local data brings it back rather than losing it.
 */

const DOCUMENT_RECORD_ID = `${SAMPLE_PROJECT_ID}-document`

function projectRecord(): Project {
  return {
    ...SAMPLE_PROJECT,
    createdAt: SAMPLE_TIMESTAMPS.createdAt,
    updatedAt: SAMPLE_TIMESTAMPS.updatedAt,
    deletedAt: null,
    revision: 1,
    syncState: 'local',
  }
}

function pageRecords(): ProjectPage[] {
  return SAMPLE_PAGES.map((page) => ({
    ...page,
    projectId: SAMPLE_PROJECT_ID,
    createdAt: SAMPLE_TIMESTAMPS.createdAt,
    updatedAt: SAMPLE_TIMESTAMPS.updatedAt,
    deletedAt: null,
    revision: 1,
    syncState: 'local',
  }))
}

function documentRecord(): ProjectDocument {
  return {
    id: DOCUMENT_RECORD_ID,
    projectId: SAMPLE_PROJECT_ID,
    settings: SAMPLE_DOCUMENT_SETTINGS,
    options: SAMPLE_EXPORT_OPTIONS,
    version: SAMPLE_DOCUMENT_SETTINGS.version,
    lastGeneratedAt: null,
    createdAt: SAMPLE_TIMESTAMPS.createdAt,
    updatedAt: SAMPLE_TIMESTAMPS.updatedAt,
    deletedAt: null,
    revision: 1,
    syncState: 'local',
  }
}

/**
 * Ensures the sample project, its pages and its document settings match what
 * ships with this build.
 *
 * The content is rewritten on every start rather than only when missing. The
 * sample is read-only, so there is never a local edit to lose, and rewriting is
 * what lets a change to the shipped brief reach people who already have the old
 * one. `pinned` and `lastOpenedAt` are the only fields a reader can affect, so
 * they are carried across. Timestamps are fixed constants, so the record does
 * not appear to change every time the app opens.
 *
 * Failures are logged rather than thrown: a missing sample is a degraded
 * welcome, not a reason to stop the application from starting.
 */
export async function ensureSampleProject(): Promise<void> {
  try {
    const existing = await db.projects.get(SAMPLE_PROJECT_ID)

    await db.transaction('rw', db.projects, db.pages, db.documents, async () => {
      await db.projects.put({
        ...projectRecord(),
        pinned: existing?.pinned ?? false,
        lastOpenedAt: existing?.lastOpenedAt ?? null,
      })

      // Replaced wholesale so a page removed from the shipped sample does not
      // linger, and a partially deleted sample heals.
      await db.pages.where('projectId').equals(SAMPLE_PROJECT_ID).delete()
      await db.pages.bulkPut(pageRecords())

      await db.documents.put(documentRecord())
    })
  } catch (error) {
    console.error('[reqstudio] could not seed the sample project', error)
  }
}

/**
 * Copies the sample into an ordinary, editable project.
 *
 * The copy gets a fresh id, so none of the read-only rules — which key off the
 * reserved sample id — apply to it. The `sample` tag is dropped so the copy does
 * not masquerade as the built-in example in filters.
 */
export async function duplicateSampleForEditing(): Promise<Project | undefined> {
  const copy = await duplicateProject(SAMPLE_PROJECT_ID)
  if (!copy) return undefined

  return projectRepository.update(copy.id, {
    name: 'Northwind Rebuild (my copy)',
    tags: copy.tags.filter((tag) => tag !== 'sample'),
    status: 'draft',
  })
}

/** Restores the sample to its shipped state, discarding any local drift. */
export async function restoreSampleProject(): Promise<void> {
  await db.transaction('rw', db.projects, db.pages, db.documents, db.exports, async () => {
    await db.pages.where('projectId').equals(SAMPLE_PROJECT_ID).delete()
    await db.exports.where('projectId').equals(SAMPLE_PROJECT_ID).delete()
    await db.projects.put(projectRecord())
    await db.pages.bulkPut(pageRecords())
    await db.documents.put(documentRecord())
  })
}
