import { useCallback, useRef, useState } from "react";
import { RectangleHorizontal, RectangleVertical, Square } from "lucide-react";

import { EmptyHero } from "@/components/empty-hero";
import { SheetInspector } from "@/components/sheet-inspector";
import { SheetPage } from "@/components/sheet-page";
import { StripPage } from "@/components/strip-page";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type Orientation } from "@/lib/crop";
import { captionFontStack } from "@/lib/fonts";
import { FRAME_SHAPES, paperSize } from "@/lib/layout";
import { paginate } from "@/lib/pages";
import { paginateStrips } from "@/lib/strip";
import { cn } from "@/lib/utils";
import { usePhotoStore } from "@/stores/photo-store";
import { useSettingsStore } from "@/stores/settings-store";

const SHAPE_ICONS: Record<Orientation, typeof Square> = {
  square: Square,
  portrait: RectangleVertical,
  landscape: RectangleHorizontal,
};

/** The centre column: the print sheet itself, with a floating frame inspector. */
export function A4Preview() {
  const photos = usePhotoStore((state) => state.photos);
  const sheetFormat = useSettingsStore((state) => state.sheetFormat);
  const stripsPerRow = useSettingsStore((state) => state.stripsPerRow);
  const captionFontId = useSettingsStore((state) => state.captionFontId);
  const paperSizeId = useSettingsStore((state) => state.paperSizeId);
  const frameShape = useSettingsStore((state) => state.frameShape);
  const pageShapes = useSettingsStore((state) => state.pageShapes);
  const setPageShape = useSettingsStore((state) => state.setPageShape);
  const borderColor = useSettingsStore((state) => state.borderColor);
  const borderWidth = useSettingsStore((state) => state.borderWidth);
  const perRow = useSettingsStore((state) => state.polaroidsPerRow);
  const rows = useSettingsStore((state) => state.rowsPerPage);
  const showCutMarks = useSettingsStore((state) => state.showCutMarks);
  const showCaptions = useSettingsStore((state) => state.showCaptions);
  const showCameraLine = useSettingsStore((state) => state.showCameraLine);
  const fontStack = captionFontStack(captionFontId);
  const paper = paperSize(paperSizeId);

  const observerRef = useRef<ResizeObserver | null>(null);
  const [width, setWidth] = useState(0);

  // Callback ref so the observer re-attaches whenever the sheet container
  // mounts — e.g. after the empty-state hero gives way to the first page.
  const setContainer = useCallback((el: HTMLDivElement | null) => {
    observerRef.current?.disconnect();
    if (!el) return;
    const update = () => setWidth(el.clientWidth);
    update();
    observerRef.current = new ResizeObserver(update);
    observerRef.current.observe(el);
  }, []);

  if (photos.length === 0) {
    return <EmptyHero />;
  }

  const gridPages = paginate(
    photos,
    perRow,
    rows,
    paper,
    frameShape,
    pageShapes,
    borderWidth,
  );
  const stripPages = paginateStrips(photos, stripsPerRow, paper, borderWidth);
  const pageCount =
    sheetFormat === "strip" ? stripPages.length : gridPages.length;
  const pageLabel = (page: number) =>
    pageCount > 1 ? `Page ${page + 1} of ${pageCount}` : "";

  return (
    <section className="flex flex-col gap-3">
      {/* Pinned to the screen, so the selected frame's tools never shift the page. */}
      <div className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex justify-center px-4 lg:bottom-4">
        <SheetInspector />
      </div>
      <div
        ref={setContainer}
        className="mx-auto flex w-full max-w-xl flex-col gap-5"
      >
        {sheetFormat === "strip"
          ? stripPages.map((stripPhotos, page) => (
              <div
                key={`strip-${stripPhotos[0]?.id ?? page}`}
                className="relative"
              >
                <StripPage
                  photos={stripPhotos}
                  width={width}
                  stripsPerRow={stripsPerRow}
                  paper={paper}
                  borderColor={borderColor}
                  borderWidth={borderWidth}
                  showCutMarks={showCutMarks}
                  editable
                />
                {pageLabel(page) && (
                  <div className="absolute top-0 left-3 z-10 -translate-y-1/2">
                    <PageBadge label={pageLabel(page)} />
                  </div>
                )}
              </div>
            ))
          : gridPages.map((slice, page) => (
              <div
                key={`page-${slice.photos[0]?.id ?? page}`}
                className="relative"
              >
                <SheetPage
                  photos={slice.photos}
                  width={width}
                  perRow={perRow}
                  rows={rows}
                  paper={paper}
                  shape={slice.shape}
                  borderColor={borderColor}
                  borderWidth={borderWidth}
                  fontStack={fontStack}
                  showCutMarks={showCutMarks}
                  showCaptions={showCaptions}
                  showCameraLine={showCameraLine}
                  editable
                />
                {pageLabel(page) && (
                  <div className="absolute top-0 left-3 z-10 -translate-y-1/2">
                    <PageBadge label={pageLabel(page)} />
                  </div>
                )}
                {/* Straddles the sheet's top edge (≈half above it) so the per-page
                    frame-shape control is always reachable — including on touch,
                    where there's no hover to reveal it. */}
                <div className="absolute top-0 right-3 z-10 -translate-y-1/2">
                  <PageShapeToggle
                    value={slice.shape}
                    onChange={(shape) => setPageShape(page, shape)}
                  />
                </div>
              </div>
            ))}
      </div>
    </section>
  );
}

function PageBadge({ label }: { label: string }) {
  return (
    <span className="pointer-events-auto rounded-lg bg-white/70 px-2 py-1 text-xs text-neutral-500 shadow-sm ring-1 ring-black/5 backdrop-blur-md dark:bg-neutral-800/80 dark:text-neutral-300 dark:ring-white/10">
      {label}
    </span>
  );
}

/** Always-visible glassy segmented control for this page's frame shape. */
function PageShapeToggle({
  value,
  onChange,
}: {
  value: Orientation;
  onChange: (shape: Orientation) => void;
}) {
  return (
    <div className="flex gap-0.5 rounded-lg bg-white/70 p-0.5 shadow-sm ring-1 ring-black/5 backdrop-blur-md dark:bg-neutral-800/80 dark:ring-white/10">
      {FRAME_SHAPES.map(({ id, label }) => {
        const Icon = SHAPE_ICONS[id];
        const active = value === id;
        return (
          <Tooltip key={id}>
            <TooltipTrigger asChild>
              <button
                type="button"
                aria-label={`${label} frames on this page`}
                aria-pressed={active}
                onClick={() => onChange(id)}
                className={cn(
                  "flex size-6 items-center justify-center rounded text-neutral-500 transition-colors hover:bg-black/5 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-white/10 dark:hover:text-neutral-100",
                  active &&
                    "bg-black/10 text-neutral-900 dark:bg-white/15 dark:text-neutral-100",
                )}
              >
                <Icon className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>{label} frames on this page</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  );
}
