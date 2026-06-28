import { Check, RotateCcw, Trash2 } from 'lucide-react'

import { MAX_CROP_SCALE, MIN_CROP_SCALE } from '@/lib/crop'
import { BORDER_COLORS } from '@/lib/layout'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor-store'
import { usePhotoStore } from '@/stores/photo-store'

/** Controls for the frame currently selected on the sheet. */
export function SheetInspector() {
  const selectedId = useEditorStore((state) => state.selectedId)
  const select = useEditorStore((state) => state.select)
  const photo = usePhotoStore((state) =>
    state.photos.find((item) => item.id === selectedId),
  )
  const setCrop = usePhotoStore((state) => state.setCrop)
  const setPhotoBorder = usePhotoStore((state) => state.setPhotoBorder)
  const remove = usePhotoStore((state) => state.remove)

  if (!photo) return null

  return (
    <div className="border-input bg-card pointer-events-auto flex items-center gap-x-3 rounded-full border py-1.5 pr-1.5 pl-3 shadow-lg">
      <div className="hidden items-center gap-2 sm:flex">
        <span className="text-muted-foreground text-xs font-medium">Zoom</span>
        <input
          type="range"
          aria-label="Zoom photo"
          min={MIN_CROP_SCALE}
          max={MAX_CROP_SCALE}
          step={0.01}
          value={photo.crop.scale}
          onChange={(event) =>
            setCrop(photo.id, {
              ...photo.crop,
              scale: Number(event.target.value),
            })
          }
          className="accent-primary w-24"
        />
      </div>
      <span className="bg-border hidden h-5 w-px sm:block" />
      <div className="flex items-center gap-1">
        {BORDER_COLORS.map((swatch) => (
          <button
            key={swatch.hex}
            type="button"
            aria-label={`${swatch.label} border`}
            aria-pressed={photo.borderColor === swatch.hex}
            onClick={() => setPhotoBorder(photo.id, swatch.hex)}
            className={cn(
              'size-5 rounded-full border border-black/10',
              photo.borderColor === swatch.hex &&
                'ring-primary ring-2 ring-offset-1',
            )}
            style={{ backgroundColor: swatch.hex }}
          />
        ))}
        <button
          type="button"
          aria-label="Use the sheet border colour"
          aria-pressed={!photo.borderColor}
          onClick={() => setPhotoBorder(photo.id, undefined)}
          className={cn(
            'text-muted-foreground flex size-5 items-center justify-center rounded-full border border-black/10',
            !photo.borderColor && 'ring-primary ring-2 ring-offset-1',
          )}
        >
          <RotateCcw className="size-2.5" />
        </button>
      </div>
      <span className="bg-border h-5 w-px" />
      <button
        type="button"
        aria-label="Remove photo"
        onClick={() => {
          select(null)
          remove(photo.id)
        }}
        className="text-muted-foreground hover:text-destructive flex size-7 items-center justify-center rounded hover:bg-neutral-100"
      >
        <Trash2 className="size-4" />
      </button>
      <button
        type="button"
        aria-label="Done"
        onClick={() => select(null)}
        className="flex size-7 items-center justify-center rounded text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900"
      >
        <Check className="size-4" />
      </button>
    </div>
  )
}
