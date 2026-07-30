import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ProjectPriority, ProjectStatus, ProjectType } from '@/types/project'

export const PROJECT_SORTS = [
  'updated-desc',
  'updated-asc',
  'created-desc',
  'name-asc',
  'name-desc',
  'readiness-desc',
  'readiness-asc',
  'target-asc',
] as const
export type ProjectSort = (typeof PROJECT_SORTS)[number]

export const PROJECT_SORT_LABELS: Record<ProjectSort, string> = {
  'updated-desc': 'Last updated',
  'updated-asc': 'Least recently updated',
  'created-desc': 'Newest first',
  'name-asc': 'Name A–Z',
  'name-desc': 'Name Z–A',
  'readiness-desc': 'Readiness high to low',
  'readiness-asc': 'Readiness low to high',
  'target-asc': 'Target date',
}

export interface ProjectViewState {
  search: string
  statuses: ProjectStatus[]
  types: ProjectType[]
  priorities: ProjectPriority[]
  tags: string[]
  sort: ProjectSort
  layout: 'grid' | 'list'

  setSearch: (search: string) => void
  toggleStatus: (status: ProjectStatus) => void
  toggleType: (type: ProjectType) => void
  togglePriority: (priority: ProjectPriority) => void
  toggleTag: (tag: string) => void
  setSort: (sort: ProjectSort) => void
  setLayout: (layout: 'grid' | 'list') => void
  clearFilters: () => void
}

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((item) => item !== value) : [...list, value]
}

const EMPTY_FILTERS = {
  search: '',
  statuses: [] as ProjectStatus[],
  types: [] as ProjectType[],
  priorities: [] as ProjectPriority[],
  tags: [] as string[],
}

export const useProjectStore = create<ProjectViewState>()(
  persist(
    (set) => ({
      ...EMPTY_FILTERS,
      sort: 'updated-desc',
      layout: 'grid',

      setSearch: (search) => set({ search }),
      toggleStatus: (status) => set((state) => ({ statuses: toggle(state.statuses, status) })),
      toggleType: (type) => set((state) => ({ types: toggle(state.types, type) })),
      togglePriority: (priority) =>
        set((state) => ({ priorities: toggle(state.priorities, priority) })),
      toggleTag: (tag) => set((state) => ({ tags: toggle(state.tags, tag) })),
      setSort: (sort) => set({ sort }),
      setLayout: (layout) => set({ layout }),
      clearFilters: () => set({ ...EMPTY_FILTERS }),
    }),
    {
      name: 'reqstudio.project-view',
      version: 1,
      // Filters and layout persist; the search box always starts empty.
      partialize: (state) => ({
        statuses: state.statuses,
        types: state.types,
        priorities: state.priorities,
        tags: state.tags,
        sort: state.sort,
        layout: state.layout,
      }),
    },
  ),
)

export const selectActiveFilterCount = (state: ProjectViewState): number =>
  state.statuses.length + state.types.length + state.priorities.length + state.tags.length
