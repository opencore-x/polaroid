import { CaptionControls } from '@/components/caption-controls'
import { CaptionFontControl } from '@/components/caption-font-control'

/** Global caption settings that apply to every photo on the sheet. */
export function SettingsToolbar() {
  return (
    <div className="border-input bg-card flex flex-wrap items-center gap-x-4 gap-y-2 rounded-lg border p-2.5">
      <CaptionControls />
      <CaptionFontControl />
    </div>
  )
}
