import { describe, expect, it } from 'vitest';
import {
  CONCENTRIC_COOL,
  CONCENTRIC_WARM,
  IRREGULAR_POLYGON_DEFAULT,
  NEUTRALS,
  POLISH_VILLAGE,
  PROTRACTOR_BRIGHT,
} from './palette';

const HEX = /^#[0-9a-fA-F]{6}$/;

describe('palettes', () => {
  it('every named palette contains valid 6-digit hex strings', () => {
    const all = [
      ...CONCENTRIC_WARM,
      ...CONCENTRIC_COOL,
      ...PROTRACTOR_BRIGHT,
      ...POLISH_VILLAGE,
      ...IRREGULAR_POLYGON_DEFAULT,
      ...Object.values(NEUTRALS),
    ];
    for (const c of all) expect(c).toMatch(HEX);
  });

  it('warm and cool palettes are non-empty and disjoint at the first slot', () => {
    expect(CONCENTRIC_WARM.length).toBeGreaterThan(2);
    expect(CONCENTRIC_COOL.length).toBeGreaterThan(2);
    expect(CONCENTRIC_WARM[0]).not.toBe(CONCENTRIC_COOL[0]);
  });
});
