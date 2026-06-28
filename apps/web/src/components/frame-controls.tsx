import {
  MAX_FRAME_PADDING,
  MIN_FRAME_PADDING,
  useSettingsStore,
} from '@/stores/settings-store'

export function FrameControls() {
  const framePadding = useSettingsStore((state) => state.framePadding)
  const setFramePadding = useSettingsStore((state) => state.setFramePadding)

  return (
    <div className="flex items-center gap-2">
      <label
        htmlFor="frame-size"
        className="text-muted-foreground text-xs font-medium whitespace-nowrap"
      >
        Frame size
      </label>
      <input
        id="frame-size"
        type="range"
        min={MIN_FRAME_PADDING}
        max={MAX_FRAME_PADDING}
        step={1}
        value={framePadding}
        onChange={(event) => setFramePadding(Number(event.target.value))}
        className="accent-primary w-32"
      />
    </div>
  )
}
