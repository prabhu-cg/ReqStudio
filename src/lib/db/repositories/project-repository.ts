import { db } from '../database'
import { DexieRepository } from '../repository'
import type { BriefData, Project } from '@/types/project'
import type { SectionValues } from '@/types/field'
import type { CreateInput } from '@/types/entity'
import { nowIso } from '@/lib/utils/date'

export type NewProjectInput = Omit<CreateInput<Project>, 'brief' | 'pinned' | 'lastOpenedAt'> &
  Partial<Pick<Project, 'brief' | 'pinned' | 'lastOpenedAt'>>

export class ProjectRepository extends DexieRepository<Project> {
  constructor() {
    super(db.projects)
  }

  async createProject(input: NewProjectInput): Promise<Project> {
    return this.create({
      brief: {},
      pinned: false,
      lastOpenedAt: null,
      ...input,
    } as CreateInput<Project>)
  }

  /**
   * Merges one section's values into the brief.
   *
   * Section data is stored as a map so a section added in a later phase writes
   * alongside existing data without a schema migration.
   */
  async saveSection(
    projectId: string,
    sectionId: string,
    values: SectionValues,
  ): Promise<Project> {
    const current = await this.table.get(projectId)
    if (!current) throw new Error(`Project "${projectId}" was not found`)

    const brief: BriefData = { ...current.brief, [sectionId]: values }
    return this.update(projectId, { brief })
  }

  async setPinned(projectId: string, pinned: boolean): Promise<Project> {
    return this.update(projectId, { pinned })
  }

  /**
   * Touched on workspace open so the dashboard can surface recent work.
   *
   * A partial update rather than a read-modify-write: the latter raced with the
   * sample-project seeding that also runs at start-up, and wrote back a stale
   * copy of the whole record over it. `update` no-ops when the row is missing.
   */
  async touch(projectId: string): Promise<void> {
    await this.table.update(projectId, { lastOpenedAt: nowIso() })
  }

  async duplicate(projectId: string): Promise<Project | undefined> {
    const source = await this.get(projectId)
    if (!source) return undefined

    const {
      id: _id,
      createdAt: _createdAt,
      updatedAt: _updatedAt,
      deletedAt: _deletedAt,
      revision: _revision,
      syncState: _syncState,
      ...rest
    } = source

    return this.create({
      ...rest,
      name: `${source.name} (copy)`,
      pinned: false,
      lastOpenedAt: null,
    } as CreateInput<Project>)
  }
}

export const projectRepository = new ProjectRepository()
