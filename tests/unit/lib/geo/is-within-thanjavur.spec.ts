import { describe, expect, it } from 'vitest';
import { isWithinThanjavur } from '@/lib/geo/is-within-thanjavur';
import { THANJAVUR_BOUNDS } from '@/lib/geo/thanjavur-bounds';

describe('isWithinThanjavur', () => {
  const { south, north, west, east } = THANJAVUR_BOUNDS;

  it('returns true for a point at the center of bounds', () => {
    const midLat = (south + north) / 2;
    const midLng = (west + east) / 2;
    expect(isWithinThanjavur(midLat, midLng)).toBe(true);
  });

  it('returns true for exact boundary points', () => {
    expect(isWithinThanjavur(south, west)).toBe(true);
    expect(isWithinThanjavur(north, east)).toBe(true);
    expect(isWithinThanjavur(south, east)).toBe(true);
    expect(isWithinThanjavur(north, west)).toBe(true);
  });

  it('returns true for Thanjavur temple coordinates', () => {
    expect(isWithinThanjavur(10.787, 79.137)).toBe(true);
  });

  it('returns false for a point south of bounds', () => {
    expect(isWithinThanjavur(south - 0.01, (west + east) / 2)).toBe(false);
  });

  it('returns false for a point north of bounds', () => {
    expect(isWithinThanjavur(north + 0.01, (west + east) / 2)).toBe(false);
  });

  it('returns false for a point west of bounds', () => {
    expect(isWithinThanjavur((south + north) / 2, west - 0.01)).toBe(false);
  });

  it('returns false for a point east of bounds', () => {
    expect(isWithinThanjavur((south + north) / 2, east + 0.01)).toBe(false);
  });

  it('returns false for coordinates in a distant location', () => {
    expect(isWithinThanjavur(28.6139, 77.209)).toBe(false);
  });
});
