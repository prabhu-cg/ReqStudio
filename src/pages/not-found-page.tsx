import { useNavigate } from 'react-router-dom'
import { Compass } from 'lucide-react'
import { EmptyState } from '@/components/common/empty-state'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  const navigate = useNavigate()

  return (
    <div className="rs-scroll-area h-full overflow-y-auto">
      <div className="rs-page p-4 lg:p-8">
      <EmptyState
        icon={Compass}
        title="Page not found"
        description="That address does not exist in ReqStudio."
        action={
          <Button variant="primary" onClick={() => navigate('/')}>
            Back to dashboard
          </Button>
        }
        />
      </div>
    </div>
  )
}
