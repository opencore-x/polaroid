import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Loader2, X } from 'lucide-react'

import { cn } from '@/lib/utils'
import { type Photo } from '@/lib/photos'
import { useEditorStore } from '@/stores/editor-store'
import { usePhotoStore } from '@/stores/photo-store'

export function PhotoStrip() {
  const photos = usePhotoStore((state) => state.photos)
  const reorder = usePhotoStore((state) => state.reorder)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
  )

  if (photos.length === 0) return null

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      reorder(String(active.id), String(over.id))
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={photos.map((photo) => photo.id)}
        strategy={verticalListSortingStrategy}
      >
        <ul className="flex flex-col gap-1.5">
          {photos.map((photo, index) => (
            <StripItem key={photo.id} photo={photo} index={index} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  )
}

function StripItem({ photo, index }: { photo: Photo; index: number }) {
  const remove = usePhotoStore((state) => state.remove)
  const selectedId = useEditorStore((state) => state.selectedId)
  const select = useEditorStore((state) => state.select)
  const selected = selectedId === photo.id

  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: photo.id })

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cn('group relative', isDragging && 'z-10 opacity-60')}
    >
      <button
        type="button"
        onClick={() => select(selected ? null : photo.id)}
        className={cn(
          'flex w-full items-center gap-2 rounded-md border p-1.5 text-left transition-colors',
          selected
            ? 'border-primary bg-accent'
            : 'border-transparent hover:bg-accent/50',
        )}
      >
        <span
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`Drag ${photo.name} to reorder`}
          className="text-muted-foreground hover:text-foreground -ml-0.5 cursor-grab touch-none active:cursor-grabbing"
          onClick={(event) => event.stopPropagation()}
        >
          <GripVertical className="size-4" />
        </span>
        <img
          src={photo.url}
          alt={photo.name}
          className="size-11 shrink-0 rounded object-cover"
        />
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm">
            {photo.captionTop || `Photo ${index + 1}`}
          </span>
          {photo.enriching ? (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
              <Loader2 className="size-3 animate-spin" />
              Reading…
            </span>
          ) : (
            photo.captionBottom && (
              <span className="text-muted-foreground block truncate text-xs">
                {photo.captionBottom}
              </span>
            )
          )}
        </span>
      </button>
      <button
        type="button"
        aria-label={`Remove ${photo.name}`}
        onClick={() => {
          if (selected) select(null)
          remove(photo.id)
        }}
        className="text-muted-foreground hover:bg-secondary hover:text-foreground absolute top-1 right-1 flex size-6 items-center justify-center rounded opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <X className="size-3.5" />
      </button>
    </li>
  )
}
