import {
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Trash2,
} from 'lucide-react'

import {
  MAX_CROP_SCALE,
  MIN_CROP_SCALE,
  ORIENTATIONS,
  type Orientation,
} from '@/lib/crop'
import { cn } from '@/lib/utils'
import { useEditorStore } from '@/stores/editor-store'
import { usePhotoStore } from '@/stores/photo-store'

const ORIENTATION_ICONS: Record<Orientation, typeof Square> = {
  square: Square,
  portrait: RectangleVertical,
  landscape: RectangleHorizontal,
}

/** Controls for the frame currently selected on the sheet. */
export function SheetInspector() {
  const selectedId = useEditorStore((state) => state.selectedId)
  const select = useEditorStore((state) => state.select)
  const photo = usePhotoStore((state) =>
    state.photos.find((item) => item.id === selectedId),
  )
  const setOrientation = usePhotoStore((state) => state.setOrientation)
  const setCrop = usePhotoStore((state) => state.setCrop)
  const remove = usePhotoStore((state) => state.remove)

  if (!photo) return null

  return (
    <div className="border-input bg-card flex flex-wrap items-center gap-x-4 gap-y-2 rounded-md border p-2">
      <span className="text-muted-foreground text-xs font-medium">
        Drag the photo to reposition
      </span>
      <div className="flex gap-0.5">
        {ORIENTATIONS.map((orientation) => {
          const Icon = ORIENTATION_ICONS[orientation]
          const active = photo.orientation === orientation
          return (
            <button
              key={orientation}
              type="button"
              aria-label={`${orientation} frame`}
              aria-pressed={active}
              onClick={() => setOrientation(photo.id, orientation)}
              className={cn(
                'flex size-6 items-center justify-center rounded text-neutral-500 hover:bg-neutral-100',
                active && 'bg-neutral-200 text-neutral-900',
              )}
            >
              <Icon className="size-3.5" />
            </button>
          )
        })}
      </div>
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
        onClick={() => {
          select(null)
          remove(photo.id)
        }}
        className="text-muted-foreground hover:text-destructive ml-auto flex items-center gap-1 text-xs"
      >
        <Trash2 className="size-3.5" />
        Remove
      </button>
      <button
        type="button"
        onClick={() => select(null)}
        className="text-xs font-medium hover:underline"
      >
        Done
      </button>
    </div>
  )
}
