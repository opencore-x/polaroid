import { useCallback, useState } from 'react'
import { type FileRejection, useDropzone } from 'react-dropzone'
import { ImagePlus } from 'lucide-react'

import { PhotoStrip } from '@/components/photo-strip'
import { Button } from '@/components/ui/button'
import { usePhotoStore } from '@/stores/photo-store'

/**
 * Left rail: an "Add photos" button on top, the reorderable strip below.
 * The whole rail is a drop target — but stays a clean button until you drag,
 * when a square drop pad fades in over a blurred strip.
 */
export function PhotoSidebar() {
  const addFiles = usePhotoStore((state) => state.addFiles)
  const [rejectedCount, setRejectedCount] = useState(0)

  const onDrop = useCallback(
    (accepted: File[], rejections: FileRejection[]) => {
      if (accepted.length > 0) addFiles(accepted)
      setRejectedCount(rejections.length)
    },
    [addFiles],
  )

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    noClick: true,
    noKeyboard: true,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif'],
    },
  })

  return (
    <div {...getRootProps()} className="relative flex flex-1 flex-col gap-3">
      <input {...getInputProps()} />

      <Button type="button" onClick={open} className="w-full gap-2">
        <ImagePlus className="size-4" />
        Add photos
      </Button>

      {rejectedCount > 0 && (
        <p className="text-destructive text-xs">
          {rejectedCount} file{rejectedCount > 1 ? 's' : ''} skipped — only
          images are supported.
        </p>
      )}

      <PhotoStrip />

      {isDragActive && (
        <div className="bg-background/70 absolute inset-0 z-30 flex items-start justify-center rounded-lg backdrop-blur-sm">
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
