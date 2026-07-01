import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

import { OptionsPanel } from "@/components/options-panel";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";

const SNAP_POINTS = [0.55, 1];

/**
 * Mobile-only options. A "Customize" pill opens a peek bottom sheet that leaves
 * the canvas visible above, so the sheet updates live as you adjust settings.
 */
export function MobileOptions() {
  const [snap, setSnap] = useState<number | string | null>(SNAP_POINTS[0]);

  return (
    <Drawer
      snapPoints={SNAP_POINTS}
      activeSnapPoint={snap}
      setActiveSnapPoint={setSnap}
      shouldScaleBackground={false}
    >
      <DrawerTrigger asChild>
        <button
          type="button"
          className="bg-card ring-border fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium shadow-lg ring-1 lg:hidden"
        >
          <SlidersHorizontal className="size-4" />
          Customize
        </button>
      </DrawerTrigger>
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
