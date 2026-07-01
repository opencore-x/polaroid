import {
  type ReactNode,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

import { cn } from "@/lib/utils";

/**
 * A capsule-shaped displacement map: pixels are neutral (128,128) in the middle
 * and pushed outward within a bezel near the rounded edge, so the backdrop
 * lenses at the rim — the refraction that separates iOS 26 "Liquid Glass" from
 * a flat frosted blur. Red channel = x shift, green = y shift.
 */
function buildDisplacementMap(w: number, h: number): string {
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const image = ctx.createImageData(w, h);
  const data = image.data;
  const r = h / 2;
  const bezel = Math.min(r, w / 2) * 0.85;

  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      // Distance to the capsule's centre spine → distance from the edge.
      const cx = Math.min(Math.max(x, r), w - r);
      const dx = x - cx;
      const dy = y - r;
      const dist = Math.hypot(dx, dy);
      let red = 128;
      let green = 128;
      // Only the bezel ring *inside* the capsule lenses; everything past the
      // edge (the rectangular corners) stays neutral or there are artifacts.
      if (dist > r - bezel && dist <= r) {
        const t = (dist - (r - bezel)) / bezel;
        const magnitude = t * t; // ramp up hard at the very rim
        red = 128 + (dx / dist) * magnitude * 127;
        green = 128 + (dy / dist) * magnitude * 127;
      }
      const i = (y * w + x) * 4;
      data[i] = red;
      data[i + 1] = green;
      data[i + 2] = 128;
      data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas.toDataURL();
}

/**
 * Liquid-glass surface. In Chromium the backdrop is refracted at the rim via an
 * SVG displacement filter; Safari/Firefox drop the SVG part and get the frosted
 * `-webkit-backdrop-filter` blur instead. Children render crisp on top.
 */
export function LiquidGlass({
  children,
  className,
  scale = 42,
}: {
  children: ReactNode;
  className?: string;
  scale?: number;
}) {
  const filterId = useId().replace(/:/g, "");
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });
  const [map, setMap] = useState("");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.clientWidth);
      const h = Math.round(el.clientHeight);
      if (w > 0 && h > 0) setSize({ w, h });
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (size.w > 0 && size.h > 0) setMap(buildDisplacementMap(size.w, size.h));
  }, [size.w, size.h]);

  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-hidden rounded-full border border-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.12),inset_0_1px_0_rgba(255,255,255,0.7)] dark:border-transparent dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
        className,
      )}
    >
      {map && (
        <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feImage
              href={map}
              x="0"
              y="0"
              width={size.w}
              height={size.h}
              result="map"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="map"
              scale={scale}
              xChannelSelector="R"
              yChannelSelector="G"
              result="displaced"
            />
            <feGaussianBlur in="displaced" stdDeviation="1.5" />
          </filter>
        </svg>
      )}
      <div
        aria-hidden
        className="absolute inset-0 bg-white/60 dark:bg-neutral-900/65"
        style={{
          backdropFilter: map ? `url(#${filterId}) saturate(160%)` : undefined,
          WebkitBackdropFilter: "blur(16px) saturate(160%)",
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
