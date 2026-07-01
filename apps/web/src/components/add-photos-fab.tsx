import { ImagePlus } from "lucide-react";

import { useAddPhotos } from "@/hooks/use-add-photos";
import { PHOTO_ACCEPT } from "@/lib/upload";
import { cn } from "@/lib/utils";

/** Floating add-photos button — the primary add action on small screens. */
export function AddPhotosFab({ className }: { className?: string }) {
  const { inputRef, open, onChange } = useAddPhotos();

  return (
    <>
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
        className={cn(
          "bg-primary text-primary-foreground ring-background fixed right-4 bottom-4 z-40 flex size-14 items-center justify-center rounded-full shadow-2xl ring-2 transition-transform active:scale-95",
          className,
        )}
      >
        <ImagePlus className="size-6" />
      </button>
    </>
  );
}
