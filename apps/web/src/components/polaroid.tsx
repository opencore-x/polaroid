import { RectangleHorizontal, RectangleVertical, Square } from 'lucide-react'

import { CroppedImage } from '@/components/cropped-image'
import {
  MAX_CROP_SCALE,
  MIN_CROP_SCALE,
  ORIENTATIONS,
  type Orientation,
  orientationAspect,
  windowPercent,
} from '@/lib/crop'
import { cn } from '@/lib/utils'
import { captionFontStack } from '@/lib/fonts'
import { type Photo } from '@/lib/photos'
import { usePhotoStore } from '@/stores/photo-store'
import { useSettingsStore } from '@/stores/settings-store'

const ORIENTATION_ICONS: Record<Orientation, typeof Square> = {
  square: Square,
  portrait: RectangleVertical,
  landscape: RectangleHorizontal,
}

export function Polaroid({ photo }: { photo: Photo }) {
  const setCaption = usePhotoStore((state) => state.setCaption)
  const setCrop = usePhotoStore((state) => state.setCrop)
  const setOrientation = usePhotoStore((state) => state.setOrientation)
  const framePadding = useSettingsStore((state) => state.framePadding)
  const captionFontId = useSettingsStore((state) => state.captionFontId)
  const showCaptions = useSettingsStore((state) => state.showCaptions)
  const showCameraLine = useSettingsStore((state) => state.showCameraLine)
  const fontFamily = captionFontStack(captionFontId)

  return (
    <div
      className="flex flex-col bg-white shadow-md"
      style={{ padding: framePadding, paddingBottom: 0 }}
    >
      <div className="relative aspect-square overflow-hidden bg-white">
        <div
          className="absolute overflow-hidden bg-neutral-200"
          style={windowPercent(photo.orientation)}
        >
          <CroppedImage
            src={photo.url}
            alt={photo.name}
            crop={photo.crop}
            aspect={orientationAspect(photo.orientation)}
            onCropChange={(crop) => setCrop(photo.id, crop)}
          />
        </div>
      </div>
      <div className="mt-1 flex items-center gap-2">
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
          className="accent-primary flex-1"
        />
      </div>
      <div
        className="flex flex-col items-center"
        style={{
          paddingTop: framePadding * 0.75,
          paddingBottom: framePadding * 1.5,
        }}
      >
        {showCaptions && (
          <>
            <CaptionInput
              value={photo.captionTop}
              onChange={(value) => setCaption(photo.id, 'captionTop', value)}
              placeholder="Add a caption"
              fontFamily={fontFamily}
              className="text-lg leading-tight"
            />
            <CaptionInput
              value={photo.captionBottom}
              onChange={(value) => setCaption(photo.id, 'captionBottom', value)}
              fontFamily={fontFamily}
              className="text-sm text-neutral-500"
            />
            {showCameraLine && photo.cameraLine && (
              <span
                className="mt-0.5 max-w-full truncate text-[10px] text-neutral-400"
                style={{ fontFamily }}
              >
                {photo.cameraLine}
              </span>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function CaptionInput({
  value,
  onChange,
  placeholder,
  className,
  fontFamily,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  fontFamily: string
}) {
  return (
    <input
      type="text"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder={placeholder}
      aria-label="Polaroid caption"
      style={{ fontFamily }}
      className={cn(
        'w-full border-0 bg-transparent text-center text-neutral-800 placeholder:text-neutral-300 focus:outline-none',
        className,
      )}
    />
  )
}
