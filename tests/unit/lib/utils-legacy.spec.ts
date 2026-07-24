import { describe, expect, it } from 'vitest';
import { cn } from '@/lib/utils';
import { formatTimeSlot } from '@/lib/patterns';

describe('cn utility', () => {
  it('merges class names', () => {
    expect(cn('a', 'b')).toBe('a b');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });

  it('handles undefined values', () => {
    expect(cn('a', undefined, 'b')).toBe('a b');
  });

  it('handles empty inputs', () => {
    expect(cn()).toBe('');
  });
});

describe('formatTimeSlot', () => {
  it('formats all-uppercase words', () => {
    expect(formatTimeSlot('MORNING')).toBe('Morning');
    expect(formatTimeSlot('LUNCH')).toBe('Lunch');
    expect(formatTimeSlot('DINNER')).toBe('Dinner');
    expect(formatTimeSlot('EVENINGSNACKS')).toBe('Eveningsnacks');
  });
});
