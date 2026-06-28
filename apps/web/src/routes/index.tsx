import { createFileRoute } from '@tanstack/react-router'

import { A4Preview } from '@/components/a4-preview'
import { PhotoDropzone } from '@/components/photo-dropzone'
import { PhotoStrip } from '@/components/photo-strip'
import { ProjectControls } from '@/components/project-controls'
import { SettingsToolbar } from '@/components/settings-toolbar'
import { usePhotoStore } from '@/stores/photo-store'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const hasPhotos = usePhotoStore((state) => state.photos.length > 0)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-6xl flex-col gap-5 p-4 sm:p-6">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Polaroid</h1>
          <p className="text-muted-foreground text-sm">
            Build polaroid-style print sheets — edit each frame right on the
            page. Everything stays on your device.
          </p>
        </div>
        <ProjectControls />
      </header>

      {hasPhotos && <SettingsToolbar />}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr] lg:items-start">
        <aside className="flex flex-col gap-3">
          <PhotoDropzone compact={hasPhotos} />
          <PhotoStrip />
        </aside>
        <div className="lg:sticky lg:top-4">
          <A4Preview />
        </div>
      </div>
    </main>
  )
}
