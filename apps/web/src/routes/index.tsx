import { createFileRoute } from '@tanstack/react-router'

import { A4Preview } from '@/components/a4-preview'
import { PhotoDropzone } from '@/components/photo-dropzone'
import { PhotoGrid } from '@/components/photo-grid'
import { usePhotoStore } from '@/stores/photo-store'

export const Route = createFileRoute('/')({
  component: Home,
})

function Home() {
  const hasPhotos = usePhotoStore((state) => state.photos.length > 0)

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-4xl flex-col gap-8 p-6 sm:p-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight">Polaroid</h1>
        <p className="text-muted-foreground text-sm">
          Add your photos to start building polaroid-style A4 sheets. Everything
          stays on your device.
        </p>
      </header>

      <PhotoDropzone compact={hasPhotos} />
      <PhotoGrid />
      <A4Preview />
    </main>
  )
}
