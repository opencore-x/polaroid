import { useState } from 'react'
import { ImageOff } from 'lucide-react'

import { cn } from '@/lib/utils'
import { captionFontStack } from '@/lib/fonts'
import { type Photo } from '@/lib/photos'
import { usePhotoStore } from '@/stores/photo-store'
import { useSettingsStore } from '@/stores/settings-store'

export function Polaroid({ photo }: { photo: Photo }) {
  const setCaption = usePhotoStore((state) => state.setCaption)
  const framePadding = useSettingsStore((state) => state.framePadding)
  const captionFontId = useSettingsStore((state) => state.captionFontId)
  const showCaptions = useSettingsStore((state) => state.showCaptions)
  const fontFamily = captionFontStack(captionFontId)
  const [failed, setFailed] = useState(false)

  return (
    <div
      className="flex flex-col bg-white shadow-md"
      style={{ padding: framePadding, paddingBottom: 0 }}
    >
      <div className="aspect-square overflow-hidden bg-neutral-200">
        {failed ? (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-neutral-400">
            <ImageOff className="size-6" />
            <span className="text-[10px]">Preview unavailable</span>
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
