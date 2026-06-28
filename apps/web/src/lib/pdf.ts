import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

import { type Crop, type Orientation, cropSource, orientationAspect } from '@/lib/crop'
import {
  type PaperSize,
  POLAROID,
  PT_PER_MM,
  cropMarks,
  sheetLayout,
} from '@/lib/layout'
import { embedCaptionFont } from '@/lib/pdf-fonts'
import { type Photo } from '@/lib/photos'

const IMAGE_DPI = 300

function loadImage(url: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => resolve(null)
    img.src = url
  })
}

/**
 * Draws the cropped photo onto a canvas of the window's pixel size and returns
 * sRGB JPEG bytes. The sampled region comes from `cropSource`, so it matches the
 * on-screen framing exactly. Canvas output is always sRGB — what photo labs and
 * home inkjets want (see README). Handles any format the browser can decode.
 */
async function rasterizeJpeg(
  url: string,
  outW: number,
  outH: number,
  crop: Crop,
): Promise<Uint8Array | null> {
  const img = await loadImage(url)
  if (!img) return null
  const canvas = document.createElement('canvas')
  canvas.width = outW
  canvas.height = outH
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const { sx, sy, sw, sh } = cropSource(
    img.naturalWidth,
    img.naturalHeight,
    crop,
    outW / outH,
  )
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outW, outH)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.92),
  )
  if (!blob) return null
  return new Uint8Array(await blob.arrayBuffer())
}

/** Builds a paginated, sRGB, print-ready PDF of all photos on the given stock. */
export async function buildSheetPdf(
  photos: Photo[],
  perRow: number,
  cutMarks: boolean,
  showCaptions: boolean,
  showCameraLine: boolean,
  paper: PaperSize,
  shape: Orientation,
  captionFontId: string,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  // Embed the selected handwriting font so the PDF matches the preview; fall
  // back to Helvetica if it can't be loaded.
  const font =
    (await embedCaptionFont(doc, captionFontId)) ??
    (await doc.embedFont(StandardFonts.Helvetica))
  const layout = sheetLayout(perRow, paper, shape)
  const aspect = orientationAspect(shape)
  const pageW = paper.widthMm * PT_PER_MM
  const pageH = paper.heightMm * PT_PER_MM
  const margin = layout.marginMm * PT_PER_MM
  const centerX = (text: string, size: number, cx: number) =>
    cx - font.widthOfTextAtSize(text, size) / 2
  const fitText = (text: string, size: number, maxWidth: number) => {
    if (font.widthOfTextAtSize(text, size) <= maxWidth) return text
    let trimmed = text
    while (
      trimmed.length > 1 &&
      font.widthOfTextAtSize(`${trimmed}…`, size) > maxWidth
    )
      trimmed = trimmed.slice(0, -1)
    return `${trimmed}…`
  }

  for (let start = 0; start < photos.length; start += layout.capacity) {
    const page = doc.addPage([pageW, pageH])
    page.drawRectangle({
      x: margin,
      y: margin,
      width: pageW - margin * 2,
      height: pageH - margin * 2,
      borderColor: rgb(0.85, 0.85, 0.85),
      borderWidth: 0.5,
      borderDashArray: [3, 3],
    })

    const slice = photos.slice(start, start + layout.capacity)
    for (let i = 0; i < slice.length; i++) {
      const photo = slice[i]
      const r = layout.rectFor(i)
      if (cutMarks) {
        for (const seg of cropMarks(r)) {
          page.drawLine({
            start: { x: seg.x1 * PT_PER_MM, y: pageH - seg.y1 * PT_PER_MM },
            end: { x: seg.x2 * PT_PER_MM, y: pageH - seg.y2 * PT_PER_MM },
            thickness: 0.4,
            color: rgb(0.6, 0.6, 0.6),
          })
        }
      }
      const x = r.x * PT_PER_MM
      const w = r.width * PT_PER_MM
      const h = r.height * PT_PER_MM
      const yTop = r.y * PT_PER_MM
      const pad = w * POLAROID.framePad
      const imgW = w - pad * 2
      const imgH = imgW / aspect

      page.drawRectangle({
        x,
        y: pageH - yTop - h,
        width: w,
        height: h,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.9, 0.9, 0.9),
        borderWidth: 0.5,
      })

      // The photo covers the image box edge-to-edge — the even border around it
      // is the frame card showing through.
      const toPx = (pt: number) => Math.round((pt / PT_PER_MM) * (IMAGE_DPI / 25.4))
      const jpeg = await rasterizeJpeg(
        photo.url,
        toPx(imgW),
        toPx(imgH),
        photo.crop,
      )
      if (jpeg) {
        const embedded = await doc.embedJpg(jpeg)
        page.drawImage(embedded, {
          x: x + pad,
          y: pageH - yTop - pad - imgH,
          width: imgW,
          height: imgH,
        })
      }

      const cx = x + w / 2
      const topSize = w * POLAROID.captionTopSize
      const botSize = w * POLAROID.captionBottomSize
      const capY = pageH - yTop - pad - imgH - pad * 0.6
      if (showCaptions && photo.captionTop) {
        page.drawText(photo.captionTop, {
          x: centerX(photo.captionTop, topSize, cx),
          y: capY - topSize,
          size: topSize,
          font,
          color: rgb(0.15, 0.15, 0.15),
        })
      }
      if (showCaptions && photo.captionBottom) {
        page.drawText(photo.captionBottom, {
          x: centerX(photo.captionBottom, botSize, cx),
          y: capY - topSize - botSize - 2,
          size: botSize,
          font,
          color: rgb(0.45, 0.45, 0.45),
        })
      }
      if (showCaptions && showCameraLine && photo.cameraLine) {
        const camSize = w * 0.045
        const line = fitText(photo.cameraLine, camSize, w - pad * 2)
        page.drawText(line, {
          x: centerX(line, camSize, cx),
          y: capY - topSize - botSize - 2 - camSize - 1.5,
          size: camSize,
          font,
          color: rgb(0.64, 0.64, 0.64),
        })
      }
    }
  }

  return doc.save()
}

export async function downloadSheetPdf(
  photos: Photo[],
  perRow: number,
  cutMarks: boolean,
  showCaptions: boolean,
  showCameraLine: boolean,
  paper: PaperSize,
  shape: Orientation,
  captionFontId: string,
  filename = 'polaroids.pdf',
): Promise<void> {
  const bytes = await buildSheetPdf(
    photos,
    perRow,
    cutMarks,
    showCaptions,
    showCameraLine,
    paper,
    shape,
    captionFontId,
  )
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
