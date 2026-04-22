import { describe, expect, it } from 'vitest';
import { fbm2, perlin2 } from './perlin';

describe('perlin2', () => {
  it('returns 0 at integer lattice points (gradient noise property)', () => {
    expect(perlin2(0, 0)).toBeCloseTo(0);
    expect(perlin2(1, 1)).toBeCloseTo(0);
    expect(perlin2(7, -3)).toBeCloseTo(0);
  });

  it('is deterministic for the same coordinates', () => {
    expect(perlin2(0.37, 0.91)).toBe(perlin2(0.37, 0.91));
  });

  it('stays within a bounded range (this Perlin variant: ~[-1.5, 1.5])', () => {
    let min = Infinity;
    let max = -Infinity;
    for (let i = 0; i < 500; i++) {
      const v = perlin2(i * 0.13, i * 0.37);
      if (v < min) min = v;
      if (v > max) max = v;
    }
    expect(min).toBeGreaterThanOrEqual(-1.5);
    expect(max).toBeLessThanOrEqual(1.5);
  });
});

describe('fbm2', () => {
  it('returns finite values', () => {
    for (let i = 0; i < 50; i++) {
      const v = fbm2(i * 0.1, i * 0.2);
      expect(Number.isFinite(v)).toBe(true);
    }
  });
});
