import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { TooltipProvider } from '@/components/ui/primitives'
import { router } from './app/router'
import './index.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root was not found')

createRoot(container).render(
  <StrictMode>
    <TooltipProvider delayDuration={300} skipDelayDuration={0}>
      <RouterProvider router={router} />
    </TooltipProvider>
  </StrictMode>,
)
