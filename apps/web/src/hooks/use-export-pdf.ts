import { useState } from "react";

import { paperSize } from "@/lib/layout";
import { paginate } from "@/lib/pages";
import { downloadSheetPdf, downloadStripPdf } from "@/lib/pdf";
import { paginateStrips } from "@/lib/strip";
import { usePhotoStore } from "@/stores/photo-store";
import { useSettingsStore } from "@/stores/settings-store";

/**
 * Export action shared by the desktop panel button and the mobile bottom bar.
 * Subscribes to just what the "N pages · A4" summary needs; reads the full
 * settings fresh at click time.
 */
export function useExportPdf() {
  const photos = usePhotoStore((state) => state.photos);
  const sheetFormat = useSettingsStore((state) => state.sheetFormat);
  const paperSizeId = useSettingsStore((state) => state.paperSizeId);
  const perRow = useSettingsStore((state) => state.cardsPerRow);
  const rows = useSettingsStore((state) => state.rowsPerPage);
  const stripsPerRow = useSettingsStore((state) => state.stripsPerRow);
  const borderWidth = useSettingsStore((state) => state.borderWidth);
  const frameShape = useSettingsStore((state) => state.frameShape);
  const pageShapes = useSettingsStore((state) => state.pageShapes);

  const [isExporting, setIsExporting] = useState(false);

  const paper = paperSize(paperSizeId);
  const pageCount =
    sheetFormat === "strip"
      ? paginateStrips(photos, stripsPerRow, paper, borderWidth).length
      : paginate(photos, perRow, rows, paper, frameShape, pageShapes, borderWidth)
          .length;

  const exportPdf = async () => {
    setIsExporting(true);
    try {
      const s = useSettingsStore.getState();
      const p = paperSize(s.paperSizeId);
      if (s.sheetFormat === "strip") {
        await downloadStripPdf(
          photos,
          s.stripsPerRow,
          s.showCutMarks,
          p,
          s.borderColor,
          s.borderWidth,
        );
      } else {
        await downloadSheetPdf(
          photos,
          s.cardsPerRow,
          s.rowsPerPage,
          s.showCutMarks,
          s.showCaptions,
          s.showCameraLine,
          p,
          s.frameShape,
          s.pageShapes,
          s.borderColor,
          s.borderWidth,
          s.captionFontId,
        );
      }
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportPdf,
    isExporting,
    pageCount,
    paper,
    canExport: photos.length > 0,
  };
}
