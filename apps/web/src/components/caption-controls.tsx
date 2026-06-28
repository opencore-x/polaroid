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
  const showCaptions = useSettingsStore((state) => state.showCaptions)
  const setShowCaptions = useSettingsStore((state) => state.setShowCaptions)
  const applyLocationMode = usePhotoStore((state) => state.applyLocationMode)

  const selectLocation = (location: CaptionLocation) => {
    setCaptionLocation(location)
    applyLocationMode(location)
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
