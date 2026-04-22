import { describe, expect, it } from 'vitest';
import { arcPoint, fanAngles, nestedRects, regularPolygon } from './geometry';

describe('nestedRects', () => {
  it('returns the outer rect first and shrinks inward', () => {
    const outer = { x: 0, y: 0, w: 100, h: 100 };
    const rects = nestedRects(outer, 4, 10, 2);
    expect(rects[0]).toEqual(outer);
    expect(rects[1]).toEqual({ x: 12, y: 12, w: 76, h: 76 });
    expect(rects.length).toBe(4);
  });

  it('stops early when rectangles would collapse', () => {
    const outer = { x: 0, y: 0, w: 20, h: 20 };
    const rects = nestedRects(outer, 100, 5, 1);
    // Each step shrinks by 12 total (6 per side); after a couple iterations we run out.
    expect(rects.length).toBeLessThan(100);
    for (const r of rects) {
      expect(r.w).toBeGreaterThan(0);
      expect(r.h).toBeGreaterThan(0);
    }
  });
});

describe('arcPoint', () => {
  it('returns center + r at angle 0', () => {
    const p = arcPoint(10, 10, 5, 0);
    expect(p.x).toBeCloseTo(15);
    expect(p.y).toBeCloseTo(10);
  });

  it('returns center for angle pi/2', () => {
    const p = arcPoint(0, 0, 1, Math.PI / 2);
    expect(p.x).toBeCloseTo(0);
    expect(p.y).toBeCloseTo(1);
  });
});

describe('regularPolygon', () => {
  it('produces n vertices on the unit circle', () => {
    const verts = regularPolygon(0, 0, 1, 6);
    expect(verts).toHaveLength(6);
    for (const v of verts) {
      expect(Math.hypot(v.x, v.y)).toBeCloseTo(1);
    }
  });
});

describe('fanAngles', () => {
  it('returns count + 1 boundaries inclusive of both endpoints', () => {
    const a = fanAngles(0, Math.PI, 4);
    expect(a).toHaveLength(5);
    expect(a[0]).toBeCloseTo(0);
    expect(a[a.length - 1]).toBeCloseTo(Math.PI);
  });

  it('returns empty for non-positive counts', () => {
    expect(fanAngles(0, 1, 0)).toEqual([]);
  });
});
