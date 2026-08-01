import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/primitives'
import { router } from './app/router'
import { ensureSampleProject } from '@/features/sample/services/sample-service'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root was not found')

// The built-in sample is restored whenever it is missing, so a first run — or a
// run after Reset Local Data — always has a worked example to look at. It never
// blocks the first paint; the live queries pick it up as soon as it lands.
void ensureSampleProject()

createRoot(container).render(
  <StrictMode>
    <TooltipProvider delayDuration={300} skipDelayDuration={0}>
      <RouterProvider router={router} />
    </TooltipProvider>
  </StrictMode>,
)
