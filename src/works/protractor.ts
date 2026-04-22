import { fillArcBand, fillBackground } from '../lib/canvas';
import { deg, fanAngles } from '../lib/geometry';
import { NEUTRALS, PROTRACTOR_BRIGHT } from '../lib/palette';
import { defineWork } from '../types';

interface Params {
  arcCount: number;
  arcThickness: number;
  startDeg: number;
  endDeg: number;
  layout: '1x1' | '2x1' | '2x2';
  frame: 'semicircle' | 'full';
  palette: string[];
  background: string;
}

export const protractor = defineWork<Params>({
  id: 'harran-ii',
  title: 'Harran II (study)',
  year: '1967',
  series: 'Protractor Series',
  aspectRatio: 2,
  caption:
    'Interlocking arc fans tiled across a rectangular field. Add or remove palette colors to shift the harmonics.',
  defaultParams: {
    arcCount: 7,
    arcThickness: 28,
    startDeg: 0,
    endDeg: 180,
    layout: '2x1',
    frame: 'semicircle',
    palette: [...PROTRACTOR_BRIGHT],
    background: NEUTRALS.paper,
  },
  schema: [
    { key: 'layout', label: 'Tile layout', kind: 'select', options: ['1x1', '2x1', '2x2'] },
    { key: 'frame', label: 'Frame shape', kind: 'select', options: ['semicircle', 'full'] },
    { key: 'arcCount', label: 'Arc count', kind: 'int', min: 3, max: 14 },
    { key: 'arcThickness', label: 'Arc thickness', kind: 'range', min: 8, max: 60, step: 1 },
    { key: 'startDeg', label: 'Fan start°', kind: 'range', min: -360, max: 360, step: 5 },
    { key: 'endDeg', label: 'Fan end°', kind: 'range', min: -360, max: 720, step: 5 },
    { key: 'palette', label: 'Palette', kind: 'colorList', minLength: 2, maxLength: 12 },
    { key: 'background', label: 'Background', kind: 'color' },
  ],
  render: (ctx, w, h, p) => {
    fillBackground(ctx, w, h, p.background);

    const tiles = layoutTiles(w, h, p.layout);
    for (let i = 0; i < tiles.length; i++) {
      const t = tiles[i];
      drawFan(ctx, t.x, t.y, t.w, t.h, p, i);
    }
  },
});

function layoutTiles(w: number, h: number, layout: Params['layout']) {
  switch (layout) {
    case '1x1':
      return [{ x: 0, y: 0, w, h }];
    case '2x1':
      return [
        { x: 0, y: 0, w: w / 2, h },
        { x: w / 2, y: 0, w: w / 2, h },
      ];
    case '2x2':
      return [
        { x: 0, y: 0, w: w / 2, h: h / 2 },
        { x: w / 2, y: 0, w: w / 2, h: h / 2 },
        { x: 0, y: h / 2, w: w / 2, h: h / 2 },
        { x: w / 2, y: h / 2, w: w / 2, h: h / 2 },
      ];
  }
}

function drawFan(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  p: Params,
  tileIndex: number,
) {
  if (p.palette.length === 0) return;
  const semicircle = p.frame === 'semicircle';
  const cx = x + w / 2;
  const cy = semicircle ? y + h : y + h / 2;
  const rOuter = semicircle ? Math.min(w / 2, h) : Math.min(w, h) / 2;
  // Semicircle: anchor the fan to the top edge (start at π so 0..180 sweeps up).
  // Full: ignore endDeg and sweep a full 360°, with startDeg acting as rotation.
  const start = deg(p.startDeg) + (semicircle ? Math.PI : 0);
  const end = semicircle ? deg(p.endDeg) + Math.PI : start + Math.PI * 2;

  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();

  const angles = fanAngles(start, end, p.arcCount);
  const ringCount = Math.max(1, Math.floor(rOuter / p.arcThickness));

  for (let r = 0; r < ringCount; r++) {
    const innerR = r * p.arcThickness;
    const outerR = Math.min(rOuter, innerR + p.arcThickness);
    for (let a = 0; a < angles.length - 1; a++) {
      const colorIdx = (a + r + tileIndex) % p.palette.length;
      fillArcBand(ctx, cx, cy, innerR, outerR, angles[a], angles[a + 1], p.palette[colorIdx]);
    }
  }

  ctx.restore();
}
