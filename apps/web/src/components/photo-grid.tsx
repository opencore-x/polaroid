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
  rectSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, X } from 'lucide-react'

import { CaptionControls } from '@/components/caption-controls'
import { CaptionFontControl } from '@/components/caption-font-control'
import { FrameControls } from '@/components/frame-controls'
import { Polaroid } from '@/components/polaroid'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { type Photo } from '@/lib/photos'
import { usePhotoStore } from '@/stores/photo-store'

export function PhotoGrid() {
  const photos = usePhotoStore((state) => state.photos)
  const clear = usePhotoStore((state) => state.clear)
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
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-sm font-medium">
          {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <CaptionControls />
          <CaptionFontControl />
          <FrameControls />
          <Button variant="ghost" size="sm" onClick={clear}>
            Clear all
          </Button>
        </div>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={photos.map((photo) => photo.id)}
          strategy={rectSortingStrategy}
        >
          <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {photos.map((photo) => (
              <PhotoTile key={photo.id} photo={photo} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
    </section>
  )
}

function PhotoTile({ photo }: { photo: Photo }) {
  const remove = usePhotoStore((state) => state.remove)
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
      className={cn('group relative', isDragging && 'z-10 opacity-50')}
    >
      <Polaroid photo={photo} />
      <button
        type="button"
        ref={setActivatorNodeRef}
        {...attributes}
        {...listeners}
        aria-label={`Drag ${photo.name} to reorder`}
        className="bg-secondary text-secondary-foreground absolute top-1.5 left-1.5 flex size-7 cursor-grab touch-none items-center justify-center rounded-md opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100 active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>
      <Button
        type="button"
        variant="secondary"
        size="icon"
        aria-label={`Remove ${photo.name}`}
        onClick={() => remove(photo.id)}
        className="absolute top-1.5 right-1.5 size-7 opacity-0 shadow-sm transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
      >
        <X />
      </Button>
    </li>
  )
}
