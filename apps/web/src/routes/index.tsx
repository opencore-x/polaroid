import { createFileRoute } from '@tanstack/react-router'

import { A4Preview } from '@/components/a4-preview'
import { PhotoDropzone } from '@/components/photo-dropzone'
import { PhotoGrid } from '@/components/photo-grid'
import { ProjectControls } from '@/components/project-controls'
import { usePhotoStore } from '@/stores/photo-store'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const hasPhotos = usePhotoStore((state) => state.photos.length > 0)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-6 p-4 sm:gap-8 sm:p-8">
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-semibold tracking-tight">Polaroid</h1>
          <p className="text-muted-foreground text-sm">
            Add your photos to start building polaroid-style print sheets.
            Everything stays on your device.
          </p>
        </div>
        <ProjectControls />
      </header>

      <PhotoDropzone compact={hasPhotos} />
      <PhotoGrid />
      <A4Preview />
    </main>
  )
}
