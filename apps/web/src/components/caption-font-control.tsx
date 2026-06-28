import { CAPTION_FONTS } from '@/lib/fonts'
import { useSettingsStore } from '@/stores/settings-store'

export function CaptionFontControl() {
  const captionFontId = useSettingsStore((state) => state.captionFontId)
  const setCaptionFont = useSettingsStore((state) => state.setCaptionFont)

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="caption-font"
        className="text-muted-foreground text-xs font-medium whitespace-nowrap"
      >
        Font
      </label>
      <select
        id="caption-font"
        value={captionFontId}
        onChange={(event) => setCaptionFont(event.target.value)}
        className="border-input bg-background rounded-md border px-2 py-1 text-sm"
      >
        {CAPTION_FONTS.map((font) => (
          <option
            key={font.id}
            value={font.id}
            style={{ fontFamily: font.stack }}
          >
            {font.label}
          </option>
        ))}
      </select>
    </div>
  )
}
