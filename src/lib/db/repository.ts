import type { Table } from 'dexie'
import type { BaseEntity, CreateInput, UpdateInput } from '@/types/entity'
import { createId } from '@/lib/utils/id'
import { nowIso } from '@/lib/utils/date'

/**
 * Storage contract every repository satisfies.
 *
 * UI and feature code depend on this interface, never on Dexie. A Phase 2 cloud
 * adapter only has to provide another implementation.
 */
export interface Repository<T extends BaseEntity> {
  get(id: string): Promise<T | undefined>
  list(): Promise<T[]>
  create(input: CreateInput<T>): Promise<T>
  update(id: string, changes: UpdateInput<T>): Promise<T>
  remove(id: string): Promise<void>
  bulkRemove(ids: string[]): Promise<void>
}

/** Metadata applied to every newly created record. */
export function withCreateMeta<T extends BaseEntity>(input: CreateInput<T>): T {
  const timestamp = nowIso()
  return {
    ...(input as object),
    id: input.id ?? createId(),
    createdAt: timestamp,
    updatedAt: timestamp,
    deletedAt: null,
    revision: 1,
    syncState: 'local',
  } as T
}

/** Metadata applied to every mutation; bumps the revision for future sync diffs. */
export function withUpdateMeta<T extends BaseEntity>(current: T, changes: UpdateInput<T>): T {
  return {
    ...current,
    ...(changes as object),
    id: current.id,
    createdAt: current.createdAt,
    updatedAt: nowIso(),
    revision: current.revision + 1,
    syncState: current.syncState === 'synced' ? 'pending' : current.syncState,
  } as T
}

/** Generic Dexie-backed repository. Subclasses add query methods, not plumbing. */
export class DexieRepository<T extends BaseEntity> implements Repository<T> {
  protected readonly table: Table<T, string>

  constructor(table: Table<T, string>) {
    this.table = table
  }

  async get(id: string): Promise<T | undefined> {
    const record = await this.table.get(id)
    return record?.deletedAt ? undefined : record
  }

  async list(): Promise<T[]> {
    const records = await this.table.toArray()
    return records.filter((record) => !record.deletedAt)
  }

  async create(input: CreateInput<T>): Promise<T> {
    const record = withCreateMeta<T>(input)
    await this.table.add(record)
    return record
  }

  async update(id: string, changes: UpdateInput<T>): Promise<T> {
    const current = await this.table.get(id)
    if (!current) throw new RecordNotFoundError(id)
    const next = withUpdateMeta(current, changes)
    await this.table.put(next)
    return next
  }

  async remove(id: string): Promise<void> {
    await this.table.delete(id)
  }

  async bulkRemove(ids: string[]): Promise<void> {
    await this.table.bulkDelete(ids)
  }
}

export class RecordNotFoundError extends Error {
  constructor(id: string) {
    super(`Record "${id}" was not found`)
    this.name = 'RecordNotFoundError'
  }
}
