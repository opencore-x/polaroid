import { type ReactNode, useState } from 'react'
import { Minus, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { type Orientation } from '@/lib/crop'
import { DATE_FORMATS, type DateFormat } from '@/lib/date'
import { CAPTION_FONTS } from '@/lib/fonts'
import { LOCATION_DETAILS } from '@/lib/geocode'
import {
  BORDER_COLORS,
  BORDER_WIDTHS,
  FRAME_SHAPES,
  PAPER_SIZES,
  paperSize,
} from '@/lib/layout'
import { paginate } from '@/lib/pages'
import { downloadSheetPdf } from '@/lib/pdf'
import { cn } from '@/lib/utils'
import { usePhotoStore } from '@/stores/photo-store'
import {
  type CaptionLocation,
  MAX_PER_ROW,
  MIN_PER_ROW,
  useSettingsStore,
} from '@/stores/settings-store'

const SELECT_CLASS =
  'border-input bg-background rounded-md border px-2 py-1 text-sm'

/** The right-hand rail: every caption + sheet option, plus export. */
export function OptionsPanel() {
  const photos = usePhotoStore((state) => state.photos)
  const applyLocationMode = usePhotoStore((state) => state.applyLocationMode)
  const applyDateFormat = usePhotoStore((state) => state.applyDateFormat)

  const captionLocation = useSettingsStore((state) => state.captionLocation)
  const setCaptionLocation = useSettingsStore((state) => state.setCaptionLocation)
  const dateFormat = useSettingsStore((state) => state.dateFormat)
  const setDateFormat = useSettingsStore((state) => state.setDateFormat)
  const captionFontId = useSettingsStore((state) => state.captionFontId)
  const setCaptionFont = useSettingsStore((state) => state.setCaptionFont)
  const showCameraLine = useSettingsStore((state) => state.showCameraLine)
  const setShowCameraLine = useSettingsStore((state) => state.setShowCameraLine)
  const showCaptions = useSettingsStore((state) => state.showCaptions)
  const setShowCaptions = useSettingsStore((state) => state.setShowCaptions)
  const paperSizeId = useSettingsStore((state) => state.paperSizeId)
  const setPaperSize = useSettingsStore((state) => state.setPaperSize)
  const frameShape = useSettingsStore((state) => state.frameShape)
  const pageShapes = useSettingsStore((state) => state.pageShapes)
  const setFrameShapeAll = useSettingsStore((state) => state.setFrameShapeAll)
  const borderColor = useSettingsStore((state) => state.borderColor)
  const setBorderColor = useSettingsStore((state) => state.setBorderColor)
  const borderWidth = useSettingsStore((state) => state.borderWidth)
  const setBorderWidth = useSettingsStore((state) => state.setBorderWidth)
  const perRow = useSettingsStore((state) => state.polaroidsPerRow)
  const setPerRow = useSettingsStore((state) => state.setPolaroidsPerRow)
  const showCutMarks = useSettingsStore((state) => state.showCutMarks)
  const setShowCutMarks = useSettingsStore((state) => state.setShowCutMarks)

  const [isExporting, setIsExporting] = useState(false)
  const paper = paperSize(paperSizeId)

  // When pages carry different shapes the dropdown reads "Mixed"; picking a
  // shape there applies it to every page.
  const pages = paginate(photos, perRow, paper, frameShape, pageShapes, borderWidth)
  const uniformShape = pages.every((p) => p.shape === pages[0].shape)
    ? pages[0].shape
    : null

  const selectLocation = (value: CaptionLocation) => {
    setCaptionLocation(value)
    applyLocationMode(value)
  }
  const selectDate = (value: DateFormat) => {
    setDateFormat(value)
    applyDateFormat(value)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      await downloadSheetPdf(
        photos,
        perRow,
        showCutMarks,
        showCaptions,
        showCameraLine,
        paper,
        frameShape,
        pageShapes,
        borderColor,
        borderWidth,
        captionFontId,
      )
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="border-input bg-card flex flex-col gap-5 rounded-lg border p-3">
      <Section title="Captions">
        <Field label="Location" htmlFor="opt-location">
          <select
            id="opt-location"
            className={SELECT_CLASS}
            value={captionLocation}
            onChange={(event) =>
              selectLocation(event.target.value as CaptionLocation)
            }
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
        </Field>
        <Field label="Date" htmlFor="opt-date">
          <select
            id="opt-date"
            className={SELECT_CLASS}
            value={dateFormat}
            onChange={(event) => selectDate(event.target.value as DateFormat)}
          >
            {DATE_FORMATS.map((format) => (
              <option key={format.id} value={format.id}>
                {format.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Font" htmlFor="opt-font">
          <select
            id="opt-font"
            className={SELECT_CLASS}
            value={captionFontId}
            onChange={(event) => setCaptionFont(event.target.value)}
          >
            {CAPTION_FONTS.map((font) => (
              <option key={font.id} value={font.id} style={{ fontFamily: font.stack }}>
                {font.label}
              </option>
            ))}
          </select>
        </Field>
        <Toggle
          label="Camera info"
          checked={showCameraLine}
          onChange={setShowCameraLine}
        />
        <Toggle label="Captions" checked={showCaptions} onChange={setShowCaptions} />
      </Section>

      <Section title="Sheet">
        <Field label="Frame" htmlFor="opt-shape">
          <select
            id="opt-shape"
            className={SELECT_CLASS}
            value={uniformShape ?? 'mixed'}
            onChange={(event) => {
              if (event.target.value !== 'mixed')
                setFrameShapeAll(event.target.value as Orientation)
            }}
          >
            {!uniformShape && (
              <option value="mixed" disabled>
                Mixed
              </option>
            )}
            {FRAME_SHAPES.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Border" htmlFor="opt-border">
          <span className="flex items-center gap-1">
            {BORDER_COLORS.map((swatch) => (
              <button
                key={swatch.hex}
                type="button"
                aria-label={swatch.label}
                aria-pressed={borderColor.toLowerCase() === swatch.hex}
                onClick={() => setBorderColor(swatch.hex)}
                className={cn(
                  'size-5 rounded-full border border-black/10',
                  borderColor.toLowerCase() === swatch.hex &&
                    'ring-primary ring-2 ring-offset-1',
                )}
                style={{ backgroundColor: swatch.hex }}
              />
            ))}
            <label
              aria-label="Custom colour"
              className="relative size-5 cursor-pointer overflow-hidden rounded-full border border-black/10"
              style={{
                background:
                  'conic-gradient(red, yellow, lime, cyan, blue, magenta, red)',
              }}
            >
              <input
                id="opt-border"
                type="color"
                value={borderColor}
                onChange={(event) => setBorderColor(event.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
            </label>
          </span>
        </Field>
        <Field label="Thickness" htmlFor="opt-thickness">
          <select
            id="opt-thickness"
            className={SELECT_CLASS}
            value={borderWidth}
            onChange={(event) => setBorderWidth(Number(event.target.value))}
          >
            {BORDER_WIDTHS.map((option) => (
              <option key={option.label} value={option.ratio}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Paper" htmlFor="opt-paper">
          <select
            id="opt-paper"
            className={SELECT_CLASS}
            value={paperSizeId}
            onChange={(event) => setPaperSize(event.target.value)}
          >
            {PAPER_SIZES.map((size) => (
              <option key={size.id} value={size.id}>
                {size.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Per row" htmlFor="opt-perrow">
          <Stepper
            value={perRow}
            min={MIN_PER_ROW}
            max={MAX_PER_ROW}
            onChange={setPerRow}
          />
        </Field>
        <Toggle
          label="Cut marks"
          checked={showCutMarks}
          onChange={setShowCutMarks}
        />
      </Section>

      <Button
        disabled={isExporting || photos.length === 0}
        onClick={() => void handleExport()}
        className="w-full"
      >
        {isExporting ? 'Preparing…' : 'Export PDF'}
      </Button>
    </div>
  )
}

function Stepper({
  value,
  min,
  max,
  onChange,
}: {
  value: number
  min: number
  max: number
  onChange: (value: number) => void
}) {
  return (
    <span className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-7"
        aria-label="Fewer per row"
        disabled={value <= min}
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus className="size-3.5" />
      </Button>
      <span className="w-4 text-center text-sm tabular-nums">{value}</span>
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-7"
        aria-label="More per row"
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="size-3.5" />
      </Button>
    </span>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
        {title}
      </h3>
      {children}
    </div>
  )
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string
  htmlFor: string
  children: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <label htmlFor={htmlFor} className="text-sm">
        {label}
      </label>
      {children}
    </div>
  )
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2 text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="accent-primary"
      />
      {label}
    </label>
  )
}
