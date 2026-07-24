import { describe, expect, it } from 'vitest';
import { getCategoryImageUrl } from '@/lib/category-images';

describe('getCategoryImageUrl', () => {
  it('returns fallback image for undefined name', () => {
    expect(getCategoryImageUrl()).toBe('/categories/idli.png');
  });

  it('returns fallback image for any name', () => {
    expect(getCategoryImageUrl('South Indian')).toBe('/categories/idli.png');
  });

  it('returns fallback image for empty string', () => {
    expect(getCategoryImageUrl('')).toBe('/categories/idli.png');
  });

  it('always returns same fallback regardless of input', () => {
    const result1 = getCategoryImageUrl('North Indian');
    const result2 = getCategoryImageUrl('Chinese');
    expect(result1).toBe(result2);
  });
});
