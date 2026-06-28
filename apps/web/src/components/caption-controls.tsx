import { DATE_FORMATS, type DateFormat } from '@/lib/date'
import { cn } from '@/lib/utils'
import { usePhotoStore } from '@/stores/photo-store'
import {
  type CaptionLocation,
  useSettingsStore,
} from '@/stores/settings-store'

export function CaptionControls() {
  const captionLocation = useSettingsStore((state) => state.captionLocation)
  const setCaptionLocation = useSettingsStore(
    (state) => state.setCaptionLocation,
  )
  const dateFormat = useSettingsStore((state) => state.dateFormat)
  const setDateFormat = useSettingsStore((state) => state.setDateFormat)
  const showCameraLine = useSettingsStore((state) => state.showCameraLine)
  const setShowCameraLine = useSettingsStore((state) => state.setShowCameraLine)
  const showCaptions = useSettingsStore((state) => state.showCaptions)
  const setShowCaptions = useSettingsStore((state) => state.setShowCaptions)
  const applyLocationMode = usePhotoStore((state) => state.applyLocationMode)
  const applyDateFormat = usePhotoStore((state) => state.applyDateFormat)

  const selectLocation = (location: CaptionLocation) => {
    setCaptionLocation(location)
    applyLocationMode(location)
  }

  const selectDateFormat = (format: DateFormat) => {
    setDateFormat(format)
    applyDateFormat(format)
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1.5">
        <span className="text-muted-foreground text-xs font-medium">
          Location
        </span>
        <div className="border-input flex overflow-hidden rounded-md border text-xs">
          {(['city', 'country'] as const).map((location) => (
            <button
              key={location}
              type="button"
              onClick={() => selectLocation(location)}
              className={cn(
                'px-2 py-1 capitalize',
                captionLocation === location
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-background hover:bg-accent',
              )}
            >
              {location}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <label
          htmlFor="date-format"
          className="text-muted-foreground text-xs font-medium"
        >
          Date
        </label>
        <select
          id="date-format"
          value={dateFormat}
          onChange={(event) => selectDateFormat(event.target.value as DateFormat)}
          className="border-input bg-background rounded-md border px-2 py-1 text-xs"
        >
          {DATE_FORMATS.map((format) => (
            <option key={format.id} value={format.id}>
              {format.label}
            </option>
          ))}
        </select>
      </div>
      <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <input
          type="checkbox"
          checked={showCameraLine}
          onChange={(event) => setShowCameraLine(event.target.checked)}
          className="accent-primary"
        />
        Camera info
      </label>
      <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <input
          type="checkbox"
          checked={showCaptions}
          onChange={(event) => setShowCaptions(event.target.checked)}
          className="accent-primary"
        />
        Captions
      </label>
    </div>
  )
}
