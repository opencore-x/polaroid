import { DATE_FORMATS, type DateFormat } from '@/lib/date'
import { LOCATION_DETAILS } from '@/lib/geocode'
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
        <label
          htmlFor="location-detail"
          className="text-muted-foreground text-xs font-medium"
        >
          Location
        </label>
        <select
          id="location-detail"
          value={captionLocation}
          onChange={(event) =>
            selectLocation(event.target.value as CaptionLocation)
          }
          className="border-input bg-background rounded-md border px-2 py-1 text-xs"
        >
          {LOCATION_DETAILS.map((detail) => (
            <option key={detail.id} value={detail.id}>
              {detail.label}
            </option>
          ))}
          <option value="neighborhood" disabled>
            Neighborhood (offline N/A)
          </option>
        </select>
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
