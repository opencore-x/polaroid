import {
  MAX_PER_ROW,
  MIN_PER_ROW,
  useSettingsStore,
} from '@/stores/settings-store'

export function SheetControls() {
  const perRow = useSettingsStore((state) => state.polaroidsPerRow)
  const setPerRow = useSettingsStore((state) => state.setPolaroidsPerRow)
  const showCutMarks = useSettingsStore((state) => state.showCutMarks)
  const setShowCutMarks = useSettingsStore((state) => state.setShowCutMarks)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label
          htmlFor="per-row"
          className="text-muted-foreground text-xs font-medium whitespace-nowrap"
        >
          Per row
        </label>
        <input
          id="per-row"
          type="range"
          min={MIN_PER_ROW}
          max={MAX_PER_ROW}
          step={1}
          value={perRow}
          onChange={(event) => setPerRow(Number(event.target.value))}
          className="accent-primary w-24"
        />
        <span className="text-muted-foreground w-3 text-xs tabular-nums">
          {perRow}
        </span>
      </div>
      <label className="text-muted-foreground flex items-center gap-1.5 text-xs font-medium">
        <input
          type="checkbox"
          checked={showCutMarks}
          onChange={(event) => setShowCutMarks(event.target.checked)}
          className="accent-primary"
        />
        Cut marks
      </label>
    </div>
  )
}
