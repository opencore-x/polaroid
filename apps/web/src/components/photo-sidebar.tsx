import { useCallback, useRef } from 'react'
import { ImagePlus } from 'lucide-react'

import { PhotoStrip } from '@/components/photo-strip'
import { Button } from '@/components/ui/button'
import { useWindowFileDrop } from '@/hooks/use-window-file-drop'
import { usePhotoStore } from '@/stores/photo-store'

const ACCEPT =
  'image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif'

/**
 * Left rail: the reorderable photo strip, with an "Add photos" button pinned
 * to the bottom. The button only appears once there's at least one photo —
 * before that, the centre empty-state hero carries the add action.
 * Dragging a file anywhere over the app reveals a square drop pad here, with
 * the strip blurred behind it — and a drop is accepted wherever it lands.
 */
export function PhotoSidebar() {
  const addFiles = usePhotoStore((state) => state.addFiles)
  const hasPhotos = usePhotoStore((state) => state.photos.length > 0)
  const inputRef = useRef<HTMLInputElement>(null)

  const onFiles = useCallback((files: File[]) => addFiles(files), [addFiles])
  const dragging = useWindowFileDrop(onFiles)

  return (
    <div className="relative flex flex-1 flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        multiple
        hidden
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length > 0) addFiles(files)
          event.target.value = ''
        }}
      />

      <PhotoStrip />

      {hasPhotos && (
        <Button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-auto w-full gap-2"
        >
          <ImagePlus className="size-4" />
          Add photos
        </Button>
      )}

      {dragging && (
        <div className="bg-background/70 absolute inset-0 z-30 flex items-center justify-center rounded-lg backdrop-blur-sm">
          <div className="border-ring text-muted-foreground flex aspect-square w-full max-w-[220px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center">
            <ImagePlus className="size-8" />
            <p className="text-foreground text-sm font-medium">
              Drop your photos…
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
