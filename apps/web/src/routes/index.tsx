import { createFileRoute } from '@tanstack/react-router'

import { A4Preview } from '@/components/a4-preview'
import { OptionsPanel } from '@/components/options-panel'
import { PhotoDropzone } from '@/components/photo-dropzone'
import { PhotoStrip } from '@/components/photo-strip'
import { ProjectControls } from '@/components/project-controls'
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
          <h1 className="text-2xl font-semibold tracking-tight">Polaroid</h1>
          <p className="text-muted-foreground text-sm">
            Build polaroid-style print sheets — edit each frame on the page.
            Everything stays on your device.
          </p>
        </div>
        <ProjectControls />
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_minmax(0,1fr)_300px] lg:items-start">
        <aside className="flex flex-col gap-3">
          <PhotoDropzone compact={hasPhotos} />
          <PhotoStrip />
        </aside>
        <div className="min-w-0">
          <A4Preview />
        </div>
        <aside className="lg:sticky lg:top-4">
          <OptionsPanel />
        </aside>
      </div>
    </main>
  )
}
