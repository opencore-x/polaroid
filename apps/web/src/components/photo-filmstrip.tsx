import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { ImagePlus, Loader2, X } from "lucide-react";

import { useAddPhotos } from "@/hooks/use-add-photos";
import { type Photo } from "@/lib/photos";
import { PHOTO_ACCEPT } from "@/lib/upload";
import { cn } from "@/lib/utils";
import { useEditorStore } from "@/stores/editor-store";
import { usePhotoStore } from "@/stores/photo-store";

/**
 * Mobile photo tray: a horizontal, sideways-scrolling row so any number of
 * photos stays one thumbnail tall and never pushes the sheet down the page.
 * Leads with a "+" tile; drag thumbnails to reorder, tap to select, × to remove.
 */
export function PhotoFilmstrip({ className }: { className?: string }) {
  const photos = usePhotoStore((state) => state.photos);
  const reorder = usePhotoStore((state) => state.reorder);
  const { inputRef, open, onChange } = useAddPhotos();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorder(String(active.id), String(over.id));
    }
  };

  return (
    <div className={cn("flex items-center gap-2 overflow-x-auto pb-1", className)}>
      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_ACCEPT}
        multiple
        hidden
        onChange={onChange}
      />
      <button
        type="button"
        onClick={open}
        aria-label="Add photos"
        className="border-input text-muted-foreground hover:border-ring hover:text-foreground flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed transition-colors"
      >
        <ImagePlus className="size-5" />
      </button>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={photos.map((photo) => photo.id)}
          strategy={horizontalListSortingStrategy}
        >
          {photos.map((photo) => (
            <FilmstripItem key={photo.id} photo={photo} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}

function FilmstripItem({ photo }: { photo: Photo }) {
  const remove = usePhotoStore((state) => state.remove);
  const selectedId = useEditorStore((state) => state.selectedId);
  const select = useEditorStore((state) => state.select);
  const selected = selectedId === photo.id;

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn("group relative shrink-0", isDragging && "z-10 opacity-60")}
    >
      <button
        type="button"
        onClick={() => select(selected ? null : photo.id)}
        {...attributes}
        {...listeners}
        aria-label={`Select ${photo.name}`}
        className={cn(
          "block size-16 touch-none overflow-hidden rounded-lg border-2 transition-colors",
          selected ? "border-primary" : "border-transparent",
        )}
      >
        <img
          src={photo.url}
          alt={photo.name}
          className="size-full object-cover"
        />
      </button>

      {photo.enriching && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-black/30">
          <Loader2 className="size-4 animate-spin text-white" />
        </span>
      )}

      <button
        type="button"
        aria-label={`Remove ${photo.name}`}
        onClick={() => {
          if (selected) select(null);
          remove(photo.id);
        }}
        className={cn(
          "bg-background text-muted-foreground hover:text-foreground ring-border absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full opacity-0 shadow ring-1 transition-opacity group-hover:opacity-100 focus-visible:opacity-100",
          selected && "opacity-100",
        )}
      >
        <X className="size-3" />
      </button>
    </div>
  );
}
