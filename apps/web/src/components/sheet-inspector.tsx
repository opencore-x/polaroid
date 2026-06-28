import { Check, Trash2 } from 'lucide-react'

import { MAX_CROP_SCALE, MIN_CROP_SCALE } from '@/lib/crop'
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
  const remove = usePhotoStore((state) => state.remove)

  if (!photo) return null

  return (
    <div className="border-input bg-card pointer-events-auto flex items-center gap-x-4 rounded-full border py-1.5 pr-1.5 pl-3 shadow-lg">
      <span className="text-muted-foreground hidden text-xs font-medium sm:inline">
        Drag to reposition
      </span>
      <div className="flex items-center gap-2">
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
          className="accent-primary w-28"
        />
      </div>
      <button
        type="button"
        aria-label="Remove photo"
        onClick={() => {
          select(null)
          remove(photo.id)
        }}
        className="text-muted-foreground hover:text-destructive ml-auto flex size-7 items-center justify-center rounded hover:bg-neutral-100"
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
