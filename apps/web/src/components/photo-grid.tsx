import { X } from 'lucide-react'

import { CaptionFontControl } from '@/components/caption-font-control'
import { FrameControls } from '@/components/frame-controls'
import { Polaroid } from '@/components/polaroid'
import { Button } from '@/components/ui/button'
import { type Photo } from '@/lib/photos'
import { usePhotoStore } from '@/stores/photo-store'

export function PhotoGrid() {
  const photos = usePhotoStore((state) => state.photos)
  const clear = usePhotoStore((state) => state.clear)

  if (photos.length === 0) return null

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium">
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <CaptionFontControl />
          <FrameControls />
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear all
          </Button>
        </div>
      </div>
      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <PhotoTile key={photo.id} photo={photo} />
        ))}
      </ul>
    </section>
  )
}

function PhotoTile({ photo }: { photo: Photo }) {
  const remove = usePhotoStore((state) => state.remove)

  return (
    <li className="group relative">
      <Polaroid photo={photo} />
      <Button
        type="button"
        variant="secondary"
        size="icon"
        aria-label={`Remove ${photo.name}`}
        onClick={() => remove(photo.id)}
        className="absolute top-1.5 right-1.5 size-7 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <X />
      </Button>
    </li>
  )
}
