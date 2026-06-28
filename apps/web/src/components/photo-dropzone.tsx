import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { ImagePlus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { usePhotoStore } from '@/stores/photo-store'

export function PhotoDropzone({ compact = false }: { compact?: boolean }) {
  const addFiles = usePhotoStore((state) => state.addFiles)

  const onDrop = useCallback(
    (accepted: File[]) => {
      addFiles(accepted)
    },
    [addFiles],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/webp': ['.webp'],
      'image/heic': ['.heic'],
      'image/heif': ['.heif'],
    },
  })

  return (
    <div
      {...getRootProps()}
      className={cn(
        'border-input hover:border-ring hover:bg-accent/40 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-center transition-colors',
        compact ? 'p-4' : 'p-10',
        isDragActive && 'border-ring bg-accent',
      )}
    >
      <input {...getInputProps()} />
      <ImagePlus
        className={cn('text-muted-foreground', compact ? 'size-5' : 'size-8')}
      />
      <div>
        <p className="text-sm font-medium">
          {isDragActive
            ? 'Drop your photos…'
            : 'Drag photos here, or click to browse'}
        </p>
        {!compact && (
          <p className="text-muted-foreground mt-1 text-xs">
            JPEG, PNG, WebP, HEIC — processed on your device, never uploaded
          </p>
        )}
      </div>
    </div>
  )
}
