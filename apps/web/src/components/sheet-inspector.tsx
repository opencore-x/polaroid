import { Check, RotateCcw, Trash2 } from 'lucide-react'

import { Slider } from '@/components/ui/slider'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'
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
        <Slider
          aria-label="Zoom photo"
          className="w-24"
          min={MIN_CROP_SCALE}
          max={MAX_CROP_SCALE}
          step={0.01}
          value={[photo.crop.scale]}
          onValueChange={([scale]) =>
            setCrop(photo.id, { ...photo.crop, scale })
          }
        />
      </div>
      <span className="bg-border hidden h-5 w-px sm:block" />
      <div className="flex items-center gap-1">
        {BORDER_COLORS.map((swatch) => (
          <Tooltip key={swatch.hex}>
            <TooltipTrigger asChild>
              <button
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
            </TooltipTrigger>
            <TooltipContent>{swatch.label} border</TooltipContent>
          </Tooltip>
        ))}
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent>Use the sheet colour</TooltipContent>
        </Tooltip>
      </div>
      <span className="bg-border h-5 w-px" />
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Remove photo"
            onClick={() => {
              select(null)
              remove(photo.id)
            }}
            className="text-muted-foreground hover:text-destructive hover:bg-accent flex size-7 items-center justify-center rounded"
          >
            <Trash2 className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Remove photo</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label="Done"
            onClick={() => select(null)}
            className="text-muted-foreground hover:bg-accent hover:text-foreground flex size-7 items-center justify-center rounded"
          >
            <Check className="size-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Done</TooltipContent>
      </Tooltip>
    </div>
  )
}
