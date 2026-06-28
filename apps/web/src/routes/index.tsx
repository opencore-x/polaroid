import { createFileRoute } from '@tanstack/react-router'

import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col items-center justify-center gap-6 p-8 text-center">
      <h1 className="text-4xl font-semibold tracking-tight">Polaroid</h1>
      <p className="text-muted-foreground text-balance">
        Arrange photos polaroid-style with EXIF auto-captions and tile them onto
        A4 sheets for print-at-home. Private, client-side, free.
      </p>
      <Button>Get started</Button>
    </main>
  )
}
