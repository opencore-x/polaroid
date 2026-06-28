import { createRootRoute, Outlet } from '@tanstack/react-router'

import { useSessionPersistence } from '@/hooks/use-session-persistence'

function RootLayout() {
  useSessionPersistence()
  return <Outlet />
}

export const Route = createRootRoute({
  component: RootLayout,
})
