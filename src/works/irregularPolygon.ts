import { fillPolygon } from '../lib/canvas';
import { regularPolygon } from '../lib/geometry';
import { IRREGULAR_POLYGON_DEFAULT } from '../lib/palette';
import { defineWork } from '../types';

interface Params {
  vertexCount: number;
  divisionAngleDeg: number;
  colors: string[];
}

export const irregularPolygon = defineWork<Params>({
  id: 'irregular-polygon',
  title: 'Irregular Polygon (study)',
  year: '1966',
  series: 'Irregular Polygons',
  aspectRatio: 1.4,
  caption:
    'A shaped canvas drawn as a filled polygon over a transparent ground. Internal divisions split the field into flat color regions.',
  defaultParams: {
    vertexCount: 5,
    divisionAngleDeg: 30,
    colors: [...IRREGULAR_POLYGON_DEFAULT],
  },
  schema: [
    { key: 'vertexCount', label: 'Vertex count', kind: 'int', min: 3, max: 8 },
    { key: 'divisionAngleDeg', label: 'Division angle°', kind: 'range', min: 0, max: 180, step: 1 },
    { key: 'colors', label: 'Region colors', kind: 'colorList', minLength: 2, maxLength: 8 },
  ],
  render: (ctx, w, h, p) => {
    // Page background shows through — do not fill the whole canvas.
    ctx.clearRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const r = Math.min(w, h) * 0.42;
    const verts = regularPolygon(cx, cy, r, p.vertexCount);

    if (p.colors.length === 0) return;

    // Outline-as-shape: paint the polygon, then divide it into wedges around the centroid.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
    ctx.closePath();
    ctx.clip();

    const baseAngle = (p.divisionAngleDeg * Math.PI) / 180;
    const slices = Math.max(p.vertexCount, p.colors.length);
    const span = (Math.PI * 2) / slices;
    const big = Math.max(w, h) * 1.5;
    for (let i = 0; i < slices; i++) {
      const a0 = baseAngle + i * span;
      const a1 = baseAngle + (i + 1) * span;
      const wedge = [
        { x: cx, y: cy },
        { x: cx + Math.cos(a0) * big, y: cy + Math.sin(a0) * big },
        { x: cx + Math.cos((a0 + a1) / 2) * big, y: cy + Math.sin((a0 + a1) / 2) * big },
        { x: cx + Math.cos(a1) * big, y: cy + Math.sin(a1) * big },
      ];
      fillPolygon(ctx, wedge, p.colors[i % p.colors.length]);
    }
    ctx.restore();

    // Outline pass for crispness.
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(verts[0].x, verts[0].y);
    for (let i = 1; i < verts.length; i++) ctx.lineTo(verts[i].x, verts[i].y);
    ctx.closePath();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#1a1a1a';
    ctx.stroke();
    ctx.restore();
  },
});
