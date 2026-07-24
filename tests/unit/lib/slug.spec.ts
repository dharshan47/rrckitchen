import { describe, expect, it } from 'vitest';
import { uniqueSlug } from '@/lib/slug';

describe('uniqueSlug', () => {
  it('generates slug from base name', () => {
    const slugs = new Set<string>();
    const result = uniqueSlug('Thanjavur Kitchen', slugs);
    expect(result).toBe('thanjavur-kitchen');
  });

  it('generates unique slug when base slug exists', () => {
    const slugs = new Set<string>(['thanjavur-kitchen']);
    const result = uniqueSlug('Thanjavur Kitchen', slugs);
    expect(result).toBe('thanjavur-kitchen-1');
  });

  it('increments counter for multiple duplicates', () => {
    const slugs = new Set<string>(['test-kitchen', 'test-kitchen-1', 'test-kitchen-2']);
    const result = uniqueSlug('Test Kitchen', slugs);
    expect(result).toBe('test-kitchen-3');
  });

  it('adds new slug to the set', () => {
    const slugs = new Set<string>();
    uniqueSlug('New Kitchen', slugs);
    expect(slugs.has('new-kitchen')).toBe(true);
  });

  it('returns "kitchen" for empty base after slugify', () => {
    const slugs = new Set<string>();
    const result = uniqueSlug('', slugs);
    expect(result).toBe('kitchen');
  });

  it('handles special characters', () => {
    const slugs = new Set<string>();
    const result = uniqueSlug('Hello World! @#$', slugs);
    expect(result).toBe('hello-world');
  });
});
