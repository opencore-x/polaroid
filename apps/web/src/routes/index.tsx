import { createFileRoute } from '@tanstack/react-router'

import { A4Preview } from '@/components/a4-preview'
import { AddPhotosFab } from '@/components/add-photos-fab'
import { OptionsPanel } from '@/components/options-panel'
import { PhotoFilmstrip } from '@/components/photo-filmstrip'
import { PhotoSidebar } from '@/components/photo-sidebar'
import { ProjectControls } from '@/components/project-controls'
import { ThemeToggle } from '@/components/theme-toggle'
import { usePhotoStore } from '@/stores/photo-store'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const hasPhotos = usePhotoStore((state) => state.photos.length > 0)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-7xl flex-col gap-5 p-4 sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-3xl font-semibold tracking-tight [font-variation-settings:'opsz'_144]">
            Polaroid
          </h1>
          <p className="text-muted-foreground text-sm">
            Edit each frame on the page — everything stays on your device.
          </p>
        </div>
        <div className="flex items-start gap-2">
          <ThemeToggle />
          <ProjectControls />
        </div>
      </header>

      {hasPhotos && <PhotoFilmstrip className="lg:hidden" />}

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:items-start">
        <aside className="hidden lg:flex lg:flex-col lg:self-stretch lg:rounded-lg lg:bg-black/[0.03] lg:p-3 lg:dark:bg-white/[0.04]">
          <PhotoSidebar />
        </aside>
        <div className="min-w-0">
          <A4Preview />
        </div>
        <aside className="lg:sticky lg:top-4">
          <OptionsPanel />
        </aside>
      </div>

      {hasPhotos && <AddPhotosFab className="lg:hidden" />}
    </main>
  )
}
