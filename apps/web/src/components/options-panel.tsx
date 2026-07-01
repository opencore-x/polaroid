import { type ComponentType, type ReactNode, useState } from "react";
import {
  FileDown,
  Minus,
  Plus,
  RectangleHorizontal,
  RectangleVertical,
  Square,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Switch } from "@/components/ui/switch";
import { type Orientation } from "@/lib/crop";
import { DATE_FORMATS, type DateFormat } from "@/lib/date";
import { CAPTION_FONTS } from "@/lib/fonts";
import { LOCATION_DETAILS } from "@/lib/geocode";
import {
  BORDER_COLORS,
  BORDER_WIDTHS,
  FRAME_SHAPES,
  PAPER_SIZES,
  paperSize,
} from "@/lib/layout";
import { paginate } from "@/lib/pages";
import { downloadSheetPdf, downloadStripPdf } from "@/lib/pdf";
import { SHEET_PRESETS, type SheetPreset } from "@/lib/presets";
import { paginateStrips } from "@/lib/strip";
import { cn } from "@/lib/utils";

const SHAPE_ICONS: Record<Orientation, ComponentType<{ className?: string }>> = {
  square: Square,
  portrait: RectangleVertical,
  landscape: RectangleHorizontal,
};
import { usePhotoStore } from "@/stores/photo-store";
import {
  type CaptionLocation,
  type SheetFormat,
  MAX_PER_ROW,
  MAX_ROWS,
  MAX_STRIPS_PER_ROW,
  MIN_PER_ROW,
  MIN_ROWS,
  MIN_STRIPS_PER_ROW,
  useSettingsStore,
} from "@/stores/settings-store";

/** Every caption + sheet option, plus export. Rendered in the desktop right
 *  rail and, on mobile, inside the options drawer (pass `bare` there — the
 *  drawer supplies its own surface). */
export function OptionsPanel({ bare = false }: { bare?: boolean } = {}) {
  const photos = usePhotoStore((state) => state.photos);
  const applyLocationMode = usePhotoStore((state) => state.applyLocationMode);
  const applyDateFormat = usePhotoStore((state) => state.applyDateFormat);

  const captionLocation = useSettingsStore((state) => state.captionLocation);
  const setCaptionLocation = useSettingsStore(
    (state) => state.setCaptionLocation,
  );
  const dateFormat = useSettingsStore((state) => state.dateFormat);
  const setDateFormat = useSettingsStore((state) => state.setDateFormat);
  const captionFontId = useSettingsStore((state) => state.captionFontId);
  const setCaptionFont = useSettingsStore((state) => state.setCaptionFont);
  const showCameraLine = useSettingsStore((state) => state.showCameraLine);
  const setShowCameraLine = useSettingsStore(
    (state) => state.setShowCameraLine,
  );
  const showCaptions = useSettingsStore((state) => state.showCaptions);
  const setShowCaptions = useSettingsStore((state) => state.setShowCaptions);
  const paperSizeId = useSettingsStore((state) => state.paperSizeId);
  const setPaperSize = useSettingsStore((state) => state.setPaperSize);
  const frameShape = useSettingsStore((state) => state.frameShape);
  const pageShapes = useSettingsStore((state) => state.pageShapes);
  const setFrameShapeAll = useSettingsStore((state) => state.setFrameShapeAll);
  const borderColor = useSettingsStore((state) => state.borderColor);
  const setBorderColor = useSettingsStore((state) => state.setBorderColor);
  const borderWidth = useSettingsStore((state) => state.borderWidth);
  const setBorderWidth = useSettingsStore((state) => state.setBorderWidth);
  const sheetFormat = useSettingsStore((state) => state.sheetFormat);
  const setSheetFormat = useSettingsStore((state) => state.setSheetFormat);
  const perRow = useSettingsStore((state) => state.polaroidsPerRow);
  const setPerRow = useSettingsStore((state) => state.setPolaroidsPerRow);
  const rows = useSettingsStore((state) => state.rowsPerPage);
  const setRows = useSettingsStore((state) => state.setRowsPerPage);
  const stripsPerRow = useSettingsStore((state) => state.stripsPerRow);
  const setStripsPerRow = useSettingsStore((state) => state.setStripsPerRow);
  const showCutMarks = useSettingsStore((state) => state.showCutMarks);
  const setShowCutMarks = useSettingsStore((state) => state.setShowCutMarks);

  const applyPreset = useSettingsStore((state) => state.applyPreset);

  const [isExporting, setIsExporting] = useState(false);
  const paper = paperSize(paperSizeId);

  // When pages carry different shapes the dropdown reads "Mixed"; picking a
  // shape there applies it to every page.
  const pages = paginate(
    photos,
    perRow,
    rows,
    paper,
    frameShape,
    pageShapes,
    borderWidth,
  );
  const uniformShape = pages.every((p) => p.shape === pages[0].shape)
    ? pages[0].shape
    : null;

  const pageCount =
    sheetFormat === "strip"
      ? paginateStrips(photos, stripsPerRow, paper, borderWidth).length
      : pages.length;
  const framesPerPage = perRow * rows;

  const selectLocation = (value: CaptionLocation) => {
    setCaptionLocation(value);
    applyLocationMode(value);
  };
  const selectDate = (value: DateFormat) => {
    setDateFormat(value);
    applyDateFormat(value);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (sheetFormat === "strip") {
        await downloadStripPdf(
          photos,
          stripsPerRow,
          showCutMarks,
          paper,
          borderColor,
          borderWidth,
        );
      } else {
        await downloadSheetPdf(
          photos,
          perRow,
          rows,
          showCutMarks,
          showCaptions,
          showCameraLine,
          paper,
          frameShape,
          pageShapes,
          borderColor,
          borderWidth,
          captionFontId,
        );
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div
      className={cn(
        "flex flex-col gap-5",
        !bare && "border-input bg-card rounded-lg border p-3",
      )}
    >
      <Presets onApply={applyPreset} />

      {sheetFormat === "grid" && (
        <Section title="Captions">
          <SettingSwitch
            label="Captions"
            checked={showCaptions}
            onChange={setShowCaptions}
          />
          {showCaptions && (
            <>
              <Field label="Location" htmlFor="opt-location">
                <FieldSelect
                  id="opt-location"
                  value={captionLocation}
                  onChange={(value) => selectLocation(value as CaptionLocation)}
                >
                  {LOCATION_DETAILS.map((detail) => (
                    <SelectItem key={detail.id} value={detail.id}>
                      {detail.label}
                    </SelectItem>
                  ))}
                  <SelectItem value="neighborhood" disabled>
                    Neighborhood (offline N/A)
                  </SelectItem>
                </FieldSelect>
              </Field>
              <Field label="Date" htmlFor="opt-date">
                <FieldSelect
                  id="opt-date"
                  value={dateFormat}
                  onChange={(value) => selectDate(value as DateFormat)}
                >
                  {DATE_FORMATS.map((format) => (
                    <SelectItem key={format.id} value={format.id}>
                      {format.label}
                    </SelectItem>
                  ))}
                </FieldSelect>
              </Field>
              <Field label="Font" htmlFor="opt-font">
                <FieldSelect
                  id="opt-font"
                  value={captionFontId}
                  onChange={setCaptionFont}
                >
                  {CAPTION_FONTS.map((font) => (
                    <SelectItem
                      key={font.id}
                      value={font.id}
                      style={{ fontFamily: font.stack }}
                    >
                      {font.label}
                    </SelectItem>
                  ))}
                </FieldSelect>
              </Field>
              <SettingSwitch
                label="Camera info"
                checked={showCameraLine}
                onChange={setShowCameraLine}
              />
            </>
          )}
        </Section>
      )}

      <Section title="Sheet">
        <Field label="Format">
          <SegmentedControl
            ariaLabel="Sheet format"
            value={sheetFormat}
            onChange={(value) => setSheetFormat(value as SheetFormat)}
            options={[
              { value: "grid", label: "Grid" },
              { value: "strip", label: "Photostrip" },
            ]}
          />
        </Field>
        {sheetFormat === "grid" && (
          <Field label="Frame">
            <SegmentedControl
              ariaLabel="Frame shape"
              iconOnly
              value={uniformShape}
              onChange={(value) => setFrameShapeAll(value as Orientation)}
              options={FRAME_SHAPES.map((option) => ({
                value: option.id,
                label: option.label,
                icon: SHAPE_ICONS[option.id],
              }))}
            />
          </Field>
        )}
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
                  "size-5 rounded-full border border-black/10",
                  borderColor.toLowerCase() === swatch.hex &&
                    "ring-primary ring-2 ring-offset-1",
                )}
                style={{ backgroundColor: swatch.hex }}
              />
            ))}
            <label
              aria-label="Custom colour"
              className="relative size-5 cursor-pointer overflow-hidden rounded-full border border-black/10"
              style={{
                background:
                  "conic-gradient(red, yellow, lime, cyan, blue, magenta, red)",
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
        <Field label="Thickness">
          <SegmentedControl
            ariaLabel="Border thickness"
            value={String(borderWidth)}
            onChange={(value) => setBorderWidth(Number(value))}
            options={BORDER_WIDTHS.map((option) => ({
              value: String(option.ratio),
              label: option.label,
            }))}
          />
        </Field>
        <Field label="Paper" htmlFor="opt-paper">
          <FieldSelect
            id="opt-paper"
            value={paperSizeId}
            onChange={setPaperSize}
          >
            {PAPER_SIZES.map((size) => (
              <SelectItem key={size.id} value={size.id}>
                {size.label}
              </SelectItem>
            ))}
          </FieldSelect>
        </Field>
        {sheetFormat === "grid" ? (
          <>
            <Field label="Per row" htmlFor="opt-perrow">
              <Stepper
                noun="per row"
                value={perRow}
                min={MIN_PER_ROW}
                max={MAX_PER_ROW}
                onChange={setPerRow}
              />
            </Field>
            <Field label="Rows" htmlFor="opt-rows">
              <Stepper
                noun="rows"
                value={rows}
                min={MIN_ROWS}
                max={MAX_ROWS}
                onChange={setRows}
              />
            </Field>
            <p className="text-muted-foreground text-right text-xs">
              {framesPerPage} frames per page
            </p>
          </>
        ) : (
          <Field label="Strips" htmlFor="opt-strips">
            <Stepper
              noun="strips"
              value={stripsPerRow}
              min={MIN_STRIPS_PER_ROW}
              max={MAX_STRIPS_PER_ROW}
              onChange={setStripsPerRow}
            />
          </Field>
        )}
        <SettingSwitch
          label="Cut marks"
          checked={showCutMarks}
          onChange={setShowCutMarks}
        />
      </Section>

      <Button
        disabled={isExporting || photos.length === 0}
        onClick={() => void handleExport()}
        className="h-auto w-full flex-col gap-0.5 py-2"
      >
        <span className="flex items-center gap-2">
          <FileDown className="size-4" />
          {isExporting ? "Preparing…" : "Export PDF"}
        </span>
        {!isExporting && photos.length > 0 && (
          <span className="text-xs font-normal opacity-80">
            {pageCount} {pageCount === 1 ? "page" : "pages"} · {paper.label}
          </span>
        )}
      </Button>
    </div>
  );
}

function Presets({
  onApply,
}: {
  onApply: (settings: SheetPreset["settings"]) => void;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
        Quick start
      </h3>
      <div className="grid grid-cols-2 gap-1.5">
        {SHEET_PRESETS.map((preset) => (
          <Button
            key={preset.id}
            type="button"
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() => onApply(preset.settings)}
          >
            {preset.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

function FieldSelect({
  id,
  value,
  onChange,
  children,
}: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  children: ReactNode;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger id={id} size="sm" className="w-[150px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </Select>
  );
}

function Stepper({
  noun,
  value,
  min,
  max,
  onChange,
}: {
  noun: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
}) {
  return (
    <span className="flex items-center gap-1">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="size-7"
        aria-label={`Fewer ${noun}`}
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
        aria-label={`More ${noun}`}
        disabled={value >= max}
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus className="size-3.5" />
      </Button>
    </span>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-2.5">
      <h3 className="text-muted-foreground text-[11px] font-semibold tracking-wide uppercase">
        {title}
      </h3>
      {children}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      {htmlFor ? (
        <Label htmlFor={htmlFor} className="text-sm font-normal">
          {label}
        </Label>
      ) : (
        <span className="text-sm">{label}</span>
      )}
      {children}
    </div>
  );
}

function SettingSwitch({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  const id = `opt-${label.toLowerCase().replace(/\s+/g, "-")}`;
  return (
    <div className="flex items-center justify-between gap-2">
      <Label htmlFor={id} className="text-sm font-normal">
        {label}
      </Label>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
