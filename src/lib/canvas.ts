import { fbm2 } from './perlin';
import type { Rect } from './geometry';

/** Fill the entire canvas (in CSS-pixel space) with a solid color. */
export function fillBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  color: string,
): void {
  ctx.save();
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
  ctx.restore();
}

export function fillRect(ctx: CanvasRenderingContext2D, r: Rect, color: string): void {
  ctx.fillStyle = color;
  ctx.fillRect(r.x, r.y, r.w, r.h);
}

/**
 * Draw a sequence of nested rectangular bands, alternating band color and gap
 * color. Pinstripes are drawn as *fills* of the gap color rather than strokes,
 * so they stay crisp regardless of subpixel position.
 */
export function fillNestedBands(
  ctx: CanvasRenderingContext2D,
  rects: Rect[],
  bandColor: string,
  gapColor: string,
): void {
  for (let i = 0; i < rects.length; i++) {
    const color = i % 2 === 0 ? bandColor : gapColor;
    fillRect(ctx, rects[i], color);
  }
}

/**
 * Draw a thick arc as a filled annular wedge. Avoids `strokeArc` whose pixel
 * width depends on transform and DPR.
 */
export function fillArcBand(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  innerR: number,
  outerR: number,
  startAngle: number,
  endAngle: number,
  color: string,
): void {
  if (outerR <= 0 || endAngle === startAngle) return;
  ctx.beginPath();
  ctx.arc(cx, cy, outerR, startAngle, endAngle, false);
  ctx.arc(cx, cy, Math.max(0, innerR), endAngle, startAngle, true);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const h = hex.startsWith('#') ? hex.slice(1) : hex;
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

/**
 * Fill the canvas with a Perlin-noise gradient between `lowColor` and `highColor`.
 * Renders into an offscreen canvas at half resolution and upsamples via drawImage,
 * so per-input redraws stay well under a frame on typical work-card sizes.
 */
export function fillPerlinBackground(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  lowColor: string,
  highColor: string,
  frequency = 0.012,
): void {
  const downscale = 0.5;
  const nw = Math.max(1, Math.floor(w * downscale));
  const nh = Math.max(1, Math.floor(h * downscale));
  const off = document.createElement('canvas');
  off.width = nw;
  off.height = nh;
  const octx = off.getContext('2d');
  if (!octx) {
    fillBackground(ctx, w, h, lowColor);
    return;
  }
  const img = octx.createImageData(nw, nh);
  const data = img.data;
  const lo = hexToRgb(lowColor);
  const hi = hexToRgb(highColor);
  const freq = frequency / downscale;
  for (let y = 0; y < nh; y++) {
    for (let x = 0; x < nw; x++) {
      // fbm2 returns roughly [-1, 1]; remap to [0, 1].
      const n = Math.max(0, Math.min(1, (fbm2(x * freq, y * freq) + 1) / 2));
      const idx = (y * nw + x) * 4;
      data[idx] = Math.round(lo.r + (hi.r - lo.r) * n);
      data[idx + 1] = Math.round(lo.g + (hi.g - lo.g) * n);
      data[idx + 2] = Math.round(lo.b + (hi.b - lo.b) * n);
      data[idx + 3] = 255;
    }
  }
  octx.putImageData(img, 0, 0);
  const prevSmoothing = ctx.imageSmoothingEnabled;
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(off, 0, 0, w, h);
  ctx.imageSmoothingEnabled = prevSmoothing;
}

export function fillPolygon(
  ctx: CanvasRenderingContext2D,
  points: { x: number; y: number }[],
  color: string,
): void {
  if (points.length < 3) return;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}
