import { type ComponentProps, type ComponentType, useState } from "react";
import { FileDown, ImagePlus, SlidersHorizontal, X } from "lucide-react";

import { OptionsPanel } from "@/components/options-panel";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { LiquidGlass } from "@/components/ui/liquid-glass";
import { useAddPhotos } from "@/hooks/use-add-photos";
import { useExportPdf } from "@/hooks/use-export-pdf";
import { PHOTO_ACCEPT } from "@/lib/upload";
import { cn } from "@/lib/utils";

const SNAP_POINTS = [0.55, 1];

/**
 * Mobile-only floating actions: two liquid-glass buttons — Customize on its own,
 * and an Add + Export pair — always a tap away. Icons follow the theme foreground.
 */
export function MobileBottomBar() {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS[0]);
  const { inputRef, open: openPicker, onChange } = useAddPhotos();
  const { exportPdf, isExporting, canExport } = useExportPdf();

  return (
    <Drawer
      open={optionsOpen}
      onOpenChange={setOptionsOpen}
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      shouldScaleBackground={false}
    >
      <input
        ref={inputRef}
        type="file"
        accept={PHOTO_ACCEPT}
        multiple
        hidden
        onChange={onChange}
      />
      <div className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-between gap-3 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] lg:hidden">
        <LiquidGlass>
          <GlassIcon
            icon={SlidersHorizontal}
            label="Customize sheet"
            onClick={() => setOptionsOpen(true)}
          />
        </LiquidGlass>
        <LiquidGlass>
          <div className="flex items-center">
            <GlassIcon
              icon={ImagePlus}
              label="Add photos"
              onClick={openPicker}
            />
            <span aria-hidden className="bg-foreground/15 my-2 w-px self-stretch" />
            <GlassIcon
              icon={FileDown}
              label="Export PDF"
              text="PDF"
              accent
              disabled={!canExport || isExporting}
              onClick={() => void exportPdf()}
            />
          </div>
        </LiquidGlass>
      </div>
      <DrawerContent className="lg:hidden">
        <DrawerHeader>
          <DrawerTitle>Sheet options</DrawerTitle>
          <DrawerClose asChild>
            <Button variant="ghost" size="icon" aria-label="Close">
              <X className="size-4" />
            </Button>
          </DrawerClose>
        </DrawerHeader>
        <div className="overflow-y-auto px-4 pb-8">
          <OptionsPanel bare />
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function GlassIcon({
  icon: Icon,
  label,
  text,
  accent = false,
  className,
  ...props
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  text?: string;
  accent?: boolean;
} & ComponentProps<"button">) {
  return (
    <button
      type="button"
      aria-label={label}
      className={cn(
        "active:bg-foreground/10 flex h-12 items-center justify-center gap-1.5 rounded-full transition-colors disabled:opacity-40",
        text ? "px-4" : "w-12",
        accent ? "text-primary" : "text-foreground",
        className,
      )}
      {...props}
    >
      <Icon className="size-5" />
      {text && <span className="text-sm font-medium">{text}</span>}
    </button>
  );
}
