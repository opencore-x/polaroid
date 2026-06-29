import { CroppedImage } from "@/components/cropped-image";
import { type PaperSize, cropMarks } from "@/lib/layout";
import { type Photo } from "@/lib/photos";
import { stripLayout, toStrips } from "@/lib/strip";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";
import { usePhotoStore } from "@/stores/photo-store";

/** One print sheet of photo-booth strips: a centred row of coloured strips. */
export function StripPage({
  photos,
  width,
  stripsPerRow,
  paper,
  borderColor,
  borderWidth,
  showCutMarks,
  editable = false,
}: {
  photos: Photo[];
  width: number;
  stripsPerRow: number;
  paper: PaperSize;
  borderColor: string;
  borderWidth: number;
  showCutMarks: boolean;
  editable?: boolean;
}) {
  const selectedId = useEditorStore((state) => state.selectedId);
  const select = useEditorStore((state) => state.select);
  const setCrop = usePhotoStore((state) => state.setCrop);
  const layout = stripLayout(stripsPerRow, paper, borderWidth);
  const mmToPx = width / paper.widthMm;
  const pageHeight = width * (paper.heightMm / paper.widthMm);
  const strips = toStrips(photos);

  return (
    <div
      className="relative bg-white shadow-md ring-1 ring-black/10"
      style={{ width: width || "100%", height: pageHeight }}
      onClick={editable ? () => select(null) : undefined}
    >
      <div
        className="pointer-events-none absolute border border-dashed border-neutral-300"
        style={{
          left: layout.marginMm * mmToPx,
          top: layout.marginMm * mmToPx,
          right: layout.marginMm * mmToPx,
          bottom: layout.marginMm * mmToPx,
        }}
      />
      {width > 0 &&
        strips.map((stripPhotos, stripIndex) => {
          const strip = layout.rectForStrip(stripIndex);
          const rects = layout.photoRects(strip);
          return (
            <div
              key={stripPhotos[0]?.id ?? stripIndex}
              className="absolute shadow-sm"
              style={{
                left: strip.x * mmToPx,
                top: strip.y * mmToPx,
                width: strip.width * mmToPx,
                height: strip.height * mmToPx,
                backgroundColor: borderColor,
              }}
            >
              {stripPhotos.map((photo, i) => {
                const rect = rects[i];
                const selected = editable && selectedId === photo.id;
                return (
                  <div
                    key={photo.id}
                    className={cn(
                      "absolute overflow-hidden transition-[outline-color]",
                      editable &&
                        "cursor-pointer outline outline-2 outline-transparent",
                      editable && !selected && "hover:outline-ring/40",
                      selected && "outline-primary z-10",
                    )}
                    style={{
                      left: (rect.x - strip.x) * mmToPx,
                      top: (rect.y - strip.y) * mmToPx,
                      width: rect.width * mmToPx,
                      height: rect.height * mmToPx,
                      outlineOffset: -2,
                    }}
                    onClick={
                      editable
                        ? (event) => {
                            event.stopPropagation();
                            select(photo.id);
                          }
                        : undefined
                    }
                  >
                    <CroppedImage
                      src={photo.url}
                      alt={photo.name}
                      crop={photo.crop}
                      aspect={1}
                      onCropChange={
                        selected ? (crop) => setCrop(photo.id, crop) : undefined
                      }
                    />
                  </div>
                );
              })}
            </div>
          );
        })}
      {showCutMarks && width > 0 && (
        <svg
          className="pointer-events-none absolute inset-0"
          width={width}
          height={pageHeight}
        >
          {strips.flatMap((stripPhotos, stripIndex) =>
            cropMarks(layout.rectForStrip(stripIndex)).map((seg, segIndex) => (
              <line
                key={`${stripPhotos[0]?.id ?? stripIndex}-${segIndex}`}
                x1={seg.x1 * mmToPx}
                y1={seg.y1 * mmToPx}
                x2={seg.x2 * mmToPx}
                y2={seg.y2 * mmToPx}
                stroke="#9ca3af"
                strokeWidth={0.75}
              />
            )),
          )}
        </svg>
      )}
    </div>
  );
}
