import { fillBackground, fillPerlinBackground } from '../lib/canvas';
import { CONCENTRIC_COOL, CONCENTRIC_WARM, NEUTRALS } from '../lib/palette';
import { defineWork } from '../types';

interface Params {
  bandCount: number;
  gapWidth: number;
  rotationDeg: number;
  palette: 'warm' | 'cool' | 'mixed';
  background: string;
  noiseEnabled: boolean;
  noiseLow: string;
  noiseHigh: string;
}

const palettes: Record<Params['palette'], readonly string[]> = {
  warm: CONCENTRIC_WARM,
  cool: CONCENTRIC_COOL,
  mixed: [...CONCENTRIC_WARM.slice(0, 4), ...CONCENTRIC_COOL.slice(0, 4)],
};

export const concentricSquares = defineWork<Params>({
  id: 'concentric-squares',
  title: 'Concentric Squares',
  year: 'c. 1972',
  series: 'Concentric Squares',
  aspectRatio: 1,
  caption:
    'Frank Stella did several paintings that are essentially nested squares - such as Honduras Lottery Co. (from Multicolored Squares I) (1972).',
  defaultParams: {
    bandCount: 8,
    gapWidth: 3,
    rotationDeg: 0,
    palette: 'warm',
    background: NEUTRALS.paper,
    noiseEnabled: false,
    noiseLow: '#d8d3c4',
    noiseHigh: '#f5f1e3',
  },
  schema: [
    { key: 'palette', label: 'Palette', kind: 'select', options: ['warm', 'cool', 'mixed'] },
    { key: 'bandCount', label: 'Band count', kind: 'int', min: 2, max: 20 },
    { key: 'gapWidth', label: 'Gap width', kind: 'range', min: 0, max: 8, step: 1 },
    { key: 'rotationDeg', label: 'Rotation°', kind: 'range', min: -45, max: 45, step: 1 },
    { key: 'background', label: 'Background', kind: 'color' },
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

    const colors = palettes[p.palette];
    const cx = w / 2;
    const cy = h / 2;
    const side = Math.min(w, h);
    const halfSide = side / 2;

    // Solve for band width so N bands plus N-1 gaps fill exactly halfSide.
    // The innermost band collapses to a solid square at center → no gap there.
    const bandWidth = Math.max(0.5, (halfSide - (p.bandCount - 1) * p.gapWidth) / p.bandCount);
    const step = bandWidth + p.gapWidth;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate((p.rotationDeg * Math.PI) / 180);
    ctx.translate(-cx, -cy);

    for (let i = 0; i < p.bandCount; i++) {
      const inset = i * step;
      const outer = side - inset * 2;
      if (outer <= 0) break;
      const inner = outer - bandWidth * 2;

      ctx.beginPath();
      ctx.rect(cx - outer / 2, cy - outer / 2, outer, outer);
      if (inner > 0) {
        ctx.rect(cx - inner / 2, cy - inner / 2, inner, inner);
      }
      ctx.fillStyle = colors[i % colors.length];
      ctx.fill('evenodd');
    }
    ctx.restore();
  },
});
