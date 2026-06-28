import { createRootRoute, Outlet } from '@tanstack/react-router'

import { TooltipProvider } from '@/components/ui/tooltip'
import { useSessionPersistence } from '@/hooks/use-session-persistence'

function RootLayout() {
  useSessionPersistence()
  return (
    <TooltipProvider delayDuration={300}>
      <Outlet />
    </TooltipProvider>
  )
}

export const Route = createRootRoute({
  component: RootLayout,
})
