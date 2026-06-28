import { PAPER_SIZES } from '@/lib/layout'
import {
  MAX_PER_ROW,
  MIN_PER_ROW,
  useSettingsStore,
} from '@/stores/settings-store'

export function SheetControls() {
  const paperSizeId = useSettingsStore((state) => state.paperSizeId)
  const setPaperSize = useSettingsStore((state) => state.setPaperSize)
  const perRow = useSettingsStore((state) => state.polaroidsPerRow)
  const setPerRow = useSettingsStore((state) => state.setPolaroidsPerRow)
  const showCutMarks = useSettingsStore((state) => state.showCutMarks)
  const setShowCutMarks = useSettingsStore((state) => state.setShowCutMarks)

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label
          htmlFor="paper-size"
          className="text-muted-foreground text-xs font-medium whitespace-nowrap"
        >
          Paper
        </label>
        <select
          id="paper-size"
          value={paperSizeId}
          onChange={(event) => setPaperSize(event.target.value)}
          className="border-input bg-background rounded-md border px-2 py-1 text-xs"
        >
          {PAPER_SIZES.map((paper) => (
            <option key={paper.id} value={paper.id}>
              {paper.label}
            </option>
          ))}
        </select>
      </div>
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
