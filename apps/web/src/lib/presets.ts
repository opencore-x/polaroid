import { type SettingsSnapshot } from "@/stores/settings-store";

export interface SheetPreset {
  id: string;
  label: string;
  settings: Partial<SettingsSnapshot>;
}

/** One-tap starting points that set several interacting options at once. */
export const SHEET_PRESETS: SheetPreset[] = [
  {
    id: "classic",
    label: "Classic",
    settings: {
      sheetFormat: "grid",
      frameShape: "square",
      borderColor: "#ffffff",
      borderWidth: 0.05,
      cardsPerRow: 3,
      rowsPerPage: 3,
    },
  },
  {
    id: "mini",
    label: "Mini grid",
    settings: {
      sheetFormat: "grid",
      frameShape: "square",
      borderColor: "#ffffff",
      borderWidth: 0.035,
      cardsPerRow: 4,
      rowsPerPage: 5,
    },
  },
  {
    id: "filmstrip",
    label: "Filmstrip",
    settings: {
      sheetFormat: "strip",
      stripsPerRow: 3,
      borderColor: "#ffffff",
      borderWidth: 0.05,
    },
  },
  {
    id: "bold",
    label: "Bold",
    settings: {
      sheetFormat: "grid",
      frameShape: "portrait",
      borderColor: "#111111",
      borderWidth: 0.08,
      cardsPerRow: 2,
      rowsPerPage: 3,
    },
  },
];
