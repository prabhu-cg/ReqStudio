import { isRouteErrorResponse, useNavigate, useRouteError } from 'react-router-dom'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Route-level error screen. Local data is never touched by a render failure. */
export function RouteErrorBoundary() {
  const error = useRouteError()
  const navigate = useNavigate()

  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
      ? error.message
      : 'An unexpected error occurred.'

  return (
    <div className="grid min-h-dvh place-items-center bg-background p-6 text-foreground">
      <div className="max-w-md text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-danger-soft text-danger">
          <TriangleAlert className="size-6" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-bold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{message}</p>
        <p className="mt-4 text-xs text-muted-foreground">
          Your projects are stored locally and are unaffected.
        </p>
        <div className="mt-6 flex justify-center gap-2">
          <Button variant="secondary" onClick={() => window.location.reload()}>
            Reload
          </Button>
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to dashboard
          </Button>
        </div>
      </div>
    </div>
  )
}
