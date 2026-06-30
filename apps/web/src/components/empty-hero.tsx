import { useRef } from "react";
import { ImagePlus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePhotoStore } from "@/stores/photo-store";

const ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";

/** A few illustrative polaroids — pure CSS, no image assets, so it loads instantly. */
const SAMPLES = [
  { tint: "linear-gradient(150deg, #f7c59f, #ee6c4d)", caption: "Lisbon · '24", rotate: -6 },
  { tint: "linear-gradient(150deg, #bcd4e6, #3d5a80)", caption: "Sunday market", rotate: 3 },
  { tint: "linear-gradient(150deg, #f6e7b4, #e3924f)", caption: "Golden hour", rotate: -2 },
];

/** Shown in the centre column before any photos are added. */
export function EmptyHero() {
  const addFiles = usePhotoStore((state) => state.addFiles);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex min-h-[60svh] flex-col items-center justify-center gap-9 px-4 text-center">
      <div aria-hidden className="flex items-end justify-center pt-2">
        {SAMPLES.map((sample, i) => (
          <figure
            key={sample.caption}
            className="-mx-2.5 w-28 rounded-sm bg-white p-2 pb-7 shadow-xl ring-1 ring-black/5 sm:w-36"
            style={{ transform: `rotate(${sample.rotate}deg)`, zIndex: i === 1 ? 2 : 1 }}
          >
            <div
              className="aspect-square w-full rounded-[2px]"
              style={{ background: sample.tint }}
            />
            <figcaption
              className="mt-2 text-center text-sm text-[#1f1b16]"
              style={{ fontFamily: '"Kalam", cursive' }}
            >
              {sample.caption}
            </figcaption>
          </figure>
        ))}
      </div>

      <div className="flex max-w-md flex-col items-center gap-3">
        <h2 className="font-display text-3xl leading-tight tracking-tight [font-variation-settings:'opsz'_144] sm:text-4xl">
          Turn your photos into polaroids
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed sm:text-base">
          Drop in a few shots — captions fill themselves in from each photo's
          date and place — and download a print-ready sheet to cut out at home.
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPT}
          multiple
          hidden
          onChange={(event) => {
            const files = Array.from(event.target.files ?? []);
            if (files.length > 0) addFiles(files);
            event.target.value = "";
          }}
        />
        <Button
          type="button"
          size="lg"
          className="gap-2"
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus className="size-4" />
          Add photos
        </Button>
        <span className="text-muted-foreground text-xs">
          or drag photos anywhere
        </span>
      </div>
    </div>
  );
}
