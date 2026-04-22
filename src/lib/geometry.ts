export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Generate `count` nested rectangles inside `outer`, each inset by
 * (bandThickness + gap) from its predecessor. The first entry is `outer`
 * itself; subsequent entries shrink toward the center until they would
 * collapse, at which point iteration stops early.
 */
export function nestedRects(
  outer: Rect,
  count: number,
  bandThickness: number,
  gap: number,
): Rect[] {
  const out: Rect[] = [];
  const step = bandThickness + gap;
  for (let i = 0; i < count; i++) {
    const inset = i * step;
    const w = outer.w - inset * 2;
    const h = outer.h - inset * 2;
    if (w <= 0 || h <= 0) break;
    out.push({ x: outer.x + inset, y: outer.y + inset, w, h });
  }
  return out;
}

/** Endpoint of an arc at `angle` radians on a circle centered at `(cx, cy)` with radius `r`. */
export function arcPoint(
  cx: number,
  cy: number,
  r: number,
  angle: number,
): { x: number; y: number } {
  return { x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r };
}

/** Vertices of a regular polygon with `n` sides inscribed in a circle. */
export function regularPolygon(
  cx: number,
  cy: number,
  r: number,
  n: number,
  rotation = -Math.PI / 2,
): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  for (let i = 0; i < n; i++) {
    const a = rotation + (i * Math.PI * 2) / n;
    out.push({ x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r });
  }
  return out;
}

/**
 * Divide `[startAngle, endAngle]` into `count` evenly spaced angles, inclusive
 * of both endpoints. Returns an array of length `count + 1` representing the
 * boundaries between fan slices.
 */
export function fanAngles(startAngle: number, endAngle: number, count: number): number[] {
  if (count <= 0) return [];
  const span = endAngle - startAngle;
  const step = span / count;
  const out: number[] = [];
  for (let i = 0; i <= count; i++) out.push(startAngle + i * step);
  return out;
}

export function deg(d: number): number {
  return (d * Math.PI) / 180;
}
