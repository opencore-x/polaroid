import { useState } from 'react'
import { ImageOff, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { type Photo, formatBytes } from '@/lib/photos'
import { usePhotoStore } from '@/stores/photo-store'

export function PhotoGrid() {
  const photos = usePhotoStore((state) => state.photos)
  const clear = usePhotoStore((state) => state.clear)

  if (photos.length === 0) return null

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-medium">
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </h2>
        <Button variant="ghost" size="sm" onClick={clear}>
          Clear all
        </Button>
      </div>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
        {photos.map((photo) => (
          <PhotoTile key={photo.id} photo={photo} />
        ))}
      </ul>
    </section>
  )
}

function PhotoTile({ photo }: { photo: Photo }) {
  const remove = usePhotoStore((state) => state.remove)
  const [failed, setFailed] = useState(false)

  return (
    <li className="group bg-muted relative aspect-square overflow-hidden rounded-md border">
      {failed ? (
        <div className="text-muted-foreground flex h-full flex-col items-center justify-center gap-1 p-2 text-center">
          <ImageOff className="size-5" />
          <span className="text-[10px] leading-tight">Preview unavailable</span>
        </div>
      ) : (
        <img
          src={photo.url}
          alt={photo.name}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      )}
      <Button
        type="button"
        variant="secondary"
        size="icon"
        aria-label={`Remove ${photo.name}`}
        onClick={() => remove(photo.id)}
        className="absolute top-1 right-1 size-7 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <X />
      </Button>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-1.5">
        <p className="truncate text-[10px] text-white">{photo.name}</p>
        <p className="text-[10px] text-white/70">{formatBytes(photo.size)}</p>
      </div>
    </li>
  )
}
