import { useCallback } from 'react'
import { ImagePlus } from 'lucide-react'

import { PhotoStrip } from '@/components/photo-strip'
import { Button } from '@/components/ui/button'
import { useAddPhotos } from '@/hooks/use-add-photos'
import { useWindowFileDrop } from '@/hooks/use-window-file-drop'
import { PHOTO_ACCEPT } from '@/lib/upload'
import { usePhotoStore } from '@/stores/photo-store'

/**
 * Left rail: the reorderable photo strip, with an "Add photos" button pinned
 * to the bottom. The button only appears once there's at least one photo —
 * before that, the centre empty-state hero carries the add action.
 * Dragging a file anywhere over the app reveals a full-height drop pad here,
 * with the strip blurred behind it — and a drop is accepted wherever it lands.
 */
export function PhotoSidebar() {
  const addFiles = usePhotoStore((state) => state.addFiles)
  const hasPhotos = usePhotoStore((state) => state.photos.length > 0)
  const { inputRef, open, onChange } = useAddPhotos()

  const onFiles = useCallback((files: File[]) => addFiles(files), [addFiles])
  const dragging = useWindowFileDrop(onFiles)

  return (
    <div className="relative flex flex-1 flex-col gap-3">
      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_ACCEPT}
        multiple
        hidden
        onChange={onChange}
      />

      <PhotoStrip />

      {hasPhotos && (
        <div className="mt-auto pt-2 lg:sticky lg:bottom-4">
          <Button
            type="button"
            variant="outline"
            onClick={open}
            className="border-primary text-primary hover:bg-primary hover:text-primary-foreground w-full gap-2"
          >
            <ImagePlus className="size-4" />
            Add photos
          </Button>
        </div>
      )}

      {dragging && (
        <div className="bg-background/70 absolute inset-0 z-30 flex items-center justify-center rounded-lg backdrop-blur-sm">
          <div className="border-ring text-muted-foreground flex h-full w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed text-center">
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
