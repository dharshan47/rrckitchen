import { describe, it, expect } from 'vitest';
import { cn, toTitleCase } from '@/lib/utils';

describe('cn', () => {
  it('combines class names', () => {
    expect(cn('foo', 'bar')).toBe('foo bar');
  });

  it('handles conditional classes', () => {
    expect(cn('base', false && 'hidden', 'visible')).toBe('base visible');
  });

  it('handles undefined values', () => {
    expect(cn('a', undefined, 'b')).toBe('a b');
  });

  it('handles empty input', () => {
    expect(cn()).toBe('');
  });

  it('merges tailwind classes correctly', () => {
    expect(cn('px-4', 'px-2')).toBe('px-2');
  });

  it('handles null values', () => {
    expect(cn('a', null, 'b')).toBe('a b');
  });

  it('handles array arguments', () => {
    expect(cn(['a', 'b'], 'c')).toBe('a b c');
  });

  it('handles object arguments', () => {
    expect(cn({ a: true, b: false, c: true })).toBe('a c');
  });
});

describe('toTitleCase', () => {
  it('converts kebab-case to Title Case', () => {
    expect(toTitleCase('south-indian')).toBe('South Indian');
  });

  it('converts snake_case to Title Case', () => {
    expect(toTitleCase('north_indian')).toBe('North Indian');
  });

  it('handles single word', () => {
    expect(toTitleCase('breakfast')).toBe('Breakfast');
  });

  it('handles already capitalized', () => {
    expect(toTitleCase('South Indian')).toBe('South Indian');
  });
});
