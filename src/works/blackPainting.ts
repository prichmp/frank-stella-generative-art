import { fillBackground, fillNestedBands, fillPerlinBackground } from '../lib/canvas';
import type { Rect } from '../lib/geometry';
import { NEUTRALS } from '../lib/palette';
import { defineWork } from '../types';

interface Params {
  bandCount: number;
  pinstripe: number;
  bandColor: string;
  background: string;
  symmetry: 'mirrored' | 'concentric' | 'nested-v' | 'nested-u';
  vAngleDeg: number;
  noiseEnabled: boolean;
  noiseLow: string;
  noiseHigh: string;
}

/**
 * Solve for band thickness so that exactly `count` bands plus `count - 1`
 * pinstripe gaps fill `halfDim` (edge-to-center distance). Floored at 0.5
 * so the math never goes negative — at extreme parameters the bands are
 * thin but still pack the canvas without leaving an unpainted center.
 */
function fitBandThickness(halfDim: number, count: number, pinstripe: number): number {
  const fitted = (halfDim - (count - 1) * pinstripe) / count;
  return Math.max(0.5, fitted);
}

export const blackPainting = defineWork<Params>({
  id: 'die-fahne-hoch',
  title: 'The Black Paintings',
  year: 'late 1950s - 1960',
  series: 'Black Paintings',
  aspectRatio: 1,
  caption:
    'The Getty Tomb (similar to the "nested-u" option) is a huge (84 x 96 in) painting in LACMA\'s collection in Los Angeles. If you are in LA, I reccoment making a day out of the La Brea Tar pits and then LACMA. Toggle Perlin noise to simulate the canvas it was painted on.',
  defaultParams: {
    bandCount: 11,
    pinstripe: 2,
    bandColor: NEUTRALS.stellaBlack,
    background: NEUTRALS.unprimedCanvas,
    symmetry: 'mirrored',
    vAngleDeg: 30,
    noiseEnabled: false,
    noiseLow: '#bba783',
    noiseHigh: '#e8d8b3',
  },
  schema: [
    {
      key: 'symmetry',
      label: 'Symmetry',
      kind: 'select',
      options: ['mirrored', 'concentric', 'nested-v', 'nested-u'],
    },
    { key: 'bandCount', label: 'Band count', kind: 'int', min: 3, max: 32 },
    { key: 'pinstripe', label: 'Pinstripe width', kind: 'range', min: 1, max: 8, step: 1 },
    {
      key: 'vAngleDeg',
      label: 'V angle° (nested-V)',
      kind: 'range',
      min: 5,
      max: 75,
      step: 1,
      visible: (p) => p.symmetry === 'nested-v',
    },
    { key: 'bandColor', label: 'Band color', kind: 'color' },
    { key: 'background', label: 'Pinstripe / ground', kind: 'color' },
    { key: 'noiseEnabled', label: 'Perlin noise ground', kind: 'toggle' },
    { key: 'noiseLow', label: 'Noise low', kind: 'color' },
    { key: 'noiseHigh', label: 'Noise high', kind: 'color' },
  ],
  render: (ctx, w, h, p) => {
    if (p.noiseEnabled) {
      fillPerlinBackground(ctx, w, h, p.noiseLow, p.noiseHigh);
    } else {
      fillBackground(ctx, w, h, p.background);
    }

    if (p.symmetry === 'concentric') {
      const side = Math.min(w, h);
      const bandThickness = fitBandThickness(side / 2, p.bandCount, p.pinstripe);
      let inset = 0;
      for (let i = 0; i < p.bandCount; i++) {
        const outerW = w - inset * 2;
        const outerH = h - inset * 2;
        if (outerW <= 0 || outerH <= 0) break;
        const innerW = outerW - bandThickness * 2;
        const innerH = outerH - bandThickness * 2;

        ctx.beginPath();
        ctx.rect(inset, inset, outerW, outerH);
        if (innerW > 0 && innerH > 0) {
          ctx.rect(inset + bandThickness, inset + bandThickness, innerW, innerH);
        }
        ctx.fillStyle = p.bandColor;
        ctx.fill('evenodd');

        inset += bandThickness + p.pinstripe;
      }
      return;
    }

    if (p.symmetry === 'nested-u') {
      // Nested U's: like concentric, but each band has no top piece so the
      // left and right legs reach the canvas top. Outer/inner rects share
      // y=0 as their top, giving each band a U shape (left + bottom + right).
      const side = Math.min(w, h);
      const bandThickness = fitBandThickness(side / 2, p.bandCount, p.pinstripe);
      let inset = 0;
      for (let i = 0; i < p.bandCount; i++) {
        const outerW = w - inset * 2;
        const outerH = h - inset;
        if (outerW <= 0 || outerH <= 0) break;
        const innerW = outerW - bandThickness * 2;
        const innerH = outerH - bandThickness;

        ctx.beginPath();
        ctx.rect(inset, 0, outerW, outerH);
        if (innerW > 0 && innerH > 0) {
          ctx.rect(inset + bandThickness, 0, innerW, innerH);
        }
        ctx.fillStyle = p.bandColor;
        ctx.fill('evenodd');

        inset += bandThickness + p.pinstripe;
      }
      return;
    }

    if (p.symmetry === 'nested-v') {
      // Single chevron (V) across the full canvas, vertex at bottom-center,
      // arms reaching the top edge. Bands are constant-thickness chevrons,
      // each offset perpendicular-to-arm by (bandThickness + pinstripe).
      const halfAngle = (p.vAngleDeg * Math.PI) / 180;
      const sinT = Math.sin(halfAngle);
      const tanT = Math.tan(halfAngle);
      const cx = w / 2;
      // Auto-fit: total perpendicular span = h * sinT must equal
      // N * bandThickness + (N - 1) * pinstripe.
      const bandThickness = Math.max(
        0.5,
        (h * sinT - (p.bandCount - 1) * p.pinstripe) / p.bandCount,
      );
      const stepPerp = (bandThickness + p.pinstripe) / sinT;
      const bandPerp = bandThickness / sinT;

      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, w, h);
      ctx.clip();

      ctx.fillStyle = p.bandColor;
      for (let i = 0; i < p.bandCount; i++) {
        const vyOuter = h - i * stepPerp;
        const vyInner = vyOuter - bandPerp;
        // The fit math drives vyInner of the innermost band to ~0; floating
        // point can leave it slightly negative. Guard on vyOuter so the last
        // band always renders (the clip handles any sub-pixel overshoot).
        if (vyOuter <= 0) break;
        const armInner = vyInner;
        ctx.beginPath();
        if (i === 0) {
          // Outer boundary of the outermost band is the full canvas so the
          // bottom-corner wedges the chevron arms don't reach get filled too.
          ctx.rect(0, 0, w, h);
        } else {
          const armOuter = vyOuter;
          ctx.moveTo(cx - armOuter * tanT, 0);
          ctx.lineTo(cx, vyOuter);
          ctx.lineTo(cx + armOuter * tanT, 0);
          ctx.closePath();
        }
        ctx.moveTo(cx - armInner * tanT, 0);
        ctx.lineTo(cx, vyInner);
        ctx.lineTo(cx + armInner * tanT, 0);
        ctx.closePath();
        ctx.fill('evenodd');
      }
      ctx.restore();
      return;
    }

    // 'mirrored' — horizontal bands stacked from top, mirrored bottom.
    // Reserve half a pinstripe on each side of the centerline so the two
    // halves meet with a full pinstripe gap between them, not edge-to-edge.
    const halfH = h / 2;
    const bandThickness = fitBandThickness(halfH - p.pinstripe / 2, p.bandCount, p.pinstripe);
    const step = bandThickness + p.pinstripe;
    const bands: Rect[] = [];
    for (let i = 0; i < p.bandCount; i++) {
      bands.push({ x: 0, y: i * step, w, h: bandThickness });
      bands.push({ x: 0, y: h - i * step - bandThickness, w, h: bandThickness });
    }
    fillNestedBands(ctx, bands, p.bandColor, p.bandColor);
  },
});
