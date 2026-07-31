import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import * as Popover from '@radix-ui/react-popover'
import { CornerDownLeft, FileText, Search, X } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { matchesQuery } from '@/lib/utils/text'
import { useProjectSummaries } from '@/features/projects/hooks/use-projects'
import { useProjectStore } from '@/stores/project-store'
import { Badge } from '@/components/ui/badge'
import { STATUS_META } from '@/features/projects/lib/project-display'

interface Result {
  id: string
  title: string
  subtitle: string
  to: string
  status: keyof typeof STATUS_META
}

const MAX_RESULTS = 8

/** Routes that render a project collection the search term can filter directly. */
const LIST_ROUTES = new Set(['/projects', '/recent'])

/**
 * The single search box in the product.
 *
 * On a route that shows a filterable project collection it filters that
 * collection live. Anywhere else — including the dashboard, which is a summary
 * rather than a list — it behaves as a jump-to palette. Either way there is one
 * input, one piece of state, and ⌘K always lands here.
 */
export function GlobalSearch() {
  const location = useLocation()
  const navigate = useNavigate()
  const summaries = useProjectSummaries()

  const search = useProjectStore((state) => state.search)
  const setSearch = useProjectStore((state) => state.setSearch)

  const [activeIndex, setActiveIndex] = useState(0)
  const [focused, setFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtersList = LIST_ROUTES.has(location.pathname)

  const results = useMemo<Result[]>(() => {
    if (!summaries) return []
    return summaries
      .filter(({ project, pages }) =>
        matchesQuery(
          search,
          project.name,
          project.client,
          project.description,
          project.tags.join(' '),
          pages.map((page) => page.name).join(' '),
        ),
      )
      .slice(0, MAX_RESULTS)
      .map(({ project, pageCount, readiness }) => ({
        id: project.id,
        title: project.name,
        subtitle: [project.client || 'No client', `${pageCount} pages`, `${readiness.score}% ready`].join(
          ' · ',
        ),
        to: `/projects/${project.id}`,
        status: project.status,
      }))
  }, [summaries, search])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        inputRef.current?.focus()
        inputRef.current?.select()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // The palette only appears where the term cannot already filter the page.
  const showResults = !filtersList && focused && search.trim().length > 0

  function go(result: Result) {
    navigate(result.to)
    setSearch('')
    setFocused(false)
    inputRef.current?.blur()
  }

  return (
    <Popover.Root open={showResults} onOpenChange={(open) => !open && setFocused(false)}>
      <Popover.Anchor asChild>
        <div className="relative w-full">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <input
            ref={inputRef}
            type="text"
            role={filtersList ? undefined : 'combobox'}
            aria-expanded={filtersList ? undefined : showResults}
            aria-controls={filtersList ? undefined : 'global-search-results'}
            aria-label={filtersList ? 'Filter projects' : 'Search projects'}
            placeholder={filtersList ? 'Filter projects, clients, tags, pages…' : 'Search projects…'}
            value={search}
            onFocus={() => setFocused(true)}
            onBlur={() => window.setTimeout(() => setFocused(false), 120)}
            onChange={(event) => {
              setSearch(event.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={(event) => {
              if (event.key === 'Escape') {
                setSearch('')
                inputRef.current?.blur()
                return
              }
              if (!showResults) return
              if (event.key === 'ArrowDown') {
                event.preventDefault()
                setActiveIndex((index) => Math.min(index + 1, results.length - 1))
              } else if (event.key === 'ArrowUp') {
                event.preventDefault()
                setActiveIndex((index) => Math.max(index - 1, 0))
              } else if (event.key === 'Enter' && results[activeIndex]) {
                event.preventDefault()
                go(results[activeIndex]!)
              }
            }}
            className="h-9 w-full rounded-control border border-border bg-surface-raised pl-9 pr-16 text-sm shadow-xs transition-colors placeholder:text-muted-foreground/80 hover:border-border-strong focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/35"
          />

          {search ? (
            <button
              type="button"
              onClick={() => {
                setSearch('')
                inputRef.current?.focus()
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label="Clear search"
            >
              <X className="size-3.5" aria-hidden="true" />
            </button>
          ) : (
            <kbd className="pointer-events-none absolute right-2.5 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-surface-raised px-1.5 py-0.5 font-sans text-[10px] font-medium text-muted-foreground sm:block">
              ⌘K
            </kbd>
          )}
        </div>
      </Popover.Anchor>

      <Popover.Portal>
        <Popover.Content
          id="global-search-results"
          align="start"
          sideOffset={6}
          onOpenAutoFocus={(event) => event.preventDefault()}
          className="z-90 w-[var(--radix-popover-trigger-width)] min-w-[22rem] overflow-hidden rounded-[10px] border border-border bg-surface-raised shadow-raised data-[state=open]:animate-[fade-in_120ms_ease-out]"
        >
          {results.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-muted-foreground">
              No projects match “{search.trim()}”
            </p>
          ) : (
            <ul role="listbox" aria-label="Search results" className="max-h-80 overflow-y-auto p-1.5">
              {results.map((result, index) => (
                <li key={result.id}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseEnter={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => go(result)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-control px-3 py-2 text-left transition-colors',
                      index === activeIndex ? 'bg-muted' : 'hover:bg-muted/60',
                    )}
                  >
                    <FileText className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{result.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {result.subtitle}
                      </span>
                    </span>
                    <Badge tone={STATUS_META[result.status].tone}>
                      {STATUS_META[result.status].label}
                    </Badge>
                    {index === activeIndex ? (
                      <CornerDownLeft className="size-3.5 shrink-0 text-muted-foreground" aria-hidden="true" />
                    ) : null}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
