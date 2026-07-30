/**
 * Shared shape for every persisted record.
 *
 * `revision` and `syncState` are unused by Phase 1 but written on every mutation
 * so a future cloud-sync adapter can diff local and remote records without a
 * data migration.
 */
export interface BaseEntity {
  id: string
  createdAt: string
  updatedAt: string
  /** Soft-delete marker. Phase 1 hard-deletes, but readers already filter on it. */
  deletedAt: string | null
  revision: number
  syncState: SyncState
}

export type SyncState = 'local' | 'pending' | 'synced'

/** Fields the caller never supplies — the repository owns them. */
export type EntityMeta = keyof BaseEntity

export type CreateInput<T extends BaseEntity> = Omit<T, EntityMeta> & Partial<Pick<T, 'id'>>

export type UpdateInput<T extends BaseEntity> = Partial<Omit<T, EntityMeta>>
