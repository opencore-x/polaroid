import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

import { A4_MM, POLAROID, PT_PER_MM, cropMarks, sheetLayout } from '@/lib/layout'
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
 * Draws a centre-cropped square of the photo onto a canvas and returns sRGB
 * JPEG bytes. Canvas output is always sRGB — exactly what photo labs and home
 * inkjets want (see README). Handles any format the browser can decode.
 */
async function rasterizeSquareJpeg(
  url: string,
  sizePx: number,
): Promise<Uint8Array | null> {
  const img = await loadImage(url)
  if (!img) return null
  const canvas = document.createElement('canvas')
  canvas.width = sizePx
  canvas.height = sizePx
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  const side = Math.min(img.naturalWidth, img.naturalHeight)
  const sx = (img.naturalWidth - side) / 2
  const sy = (img.naturalHeight - side) / 2
  ctx.drawImage(img, sx, sy, side, side, 0, 0, sizePx, sizePx)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', 0.92),
  )
  if (!blob) return null
  return new Uint8Array(await blob.arrayBuffer())
}

/** Builds an A4, sRGB, print-ready PDF of all photos (paginated). */
export async function buildSheetPdf(
  photos: Photo[],
  perRow: number,
  cutMarks: boolean,
  showCaptions: boolean,
): Promise<Uint8Array> {
  const doc = await PDFDocument.create()
  const font = await doc.embedFont(StandardFonts.Helvetica)
  const layout = sheetLayout(perRow)
  const pageW = A4_MM.width * PT_PER_MM
  const pageH = A4_MM.height * PT_PER_MM
  const margin = layout.marginMm * PT_PER_MM
  const centerX = (text: string, size: number, cx: number) =>
    cx - font.widthOfTextAtSize(text, size) / 2

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
      const imgSize = w - pad * 2

      page.drawRectangle({
        x,
        y: pageH - yTop - h,
        width: w,
        height: h,
        color: rgb(1, 1, 1),
        borderColor: rgb(0.9, 0.9, 0.9),
        borderWidth: 0.5,
      })

      const imgPx = Math.round((imgSize / PT_PER_MM) * (IMAGE_DPI / 25.4))
      const jpeg = await rasterizeSquareJpeg(photo.url, imgPx)
      if (jpeg) {
        const embedded = await doc.embedJpg(jpeg)
        page.drawImage(embedded, {
          x: x + pad,
          y: pageH - yTop - pad - imgSize,
          width: imgSize,
          height: imgSize,
        })
      }

      const cx = x + w / 2
      const topSize = w * POLAROID.captionTopSize
      const botSize = w * POLAROID.captionBottomSize
      const capY = pageH - yTop - pad - imgSize - pad * 0.6
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
    }
  }

  return doc.save()
}

export async function downloadSheetPdf(
  photos: Photo[],
  perRow: number,
  cutMarks: boolean,
  showCaptions: boolean,
  filename = 'polaroids.pdf',
): Promise<void> {
  const bytes = await buildSheetPdf(photos, perRow, cutMarks, showCaptions)
  const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
