import { describe, expect, it } from 'vitest';
import {
  createBadgeVariant,
  formatTimeSlot,
  createComponentConfig,
  getTimeSlotLabel,
  normalizeMenuItem,
} from '@/lib/patterns/factory';

describe('factory pattern', () => {
  describe('createBadgeVariant', () => {
    it('returns "secondary" for VEG', () => {
      expect(createBadgeVariant('VEG')).toBe('secondary');
    });

    it('returns "destructive" for NONVEG', () => {
      expect(createBadgeVariant('NONVEG')).toBe('destructive');
    });

    it('returns "outline" for unknown food type', () => {
      expect(createBadgeVariant('VEGAN')).toBe('outline');
      expect(createBadgeVariant('EGGETARIAN')).toBe('outline');
      expect(createBadgeVariant('')).toBe('outline');
    });
  });

  describe('formatTimeSlot', () => {
    it('formats all-caps slot correctly', () => {
      expect(formatTimeSlot('LUNCH')).toBe('Lunch');
      expect(formatTimeSlot('DINNER')).toBe('Dinner');
      expect(formatTimeSlot('ALL')).toBe('All');
    });

    it('formats camelCase slot correctly', () => {
      expect(formatTimeSlot('eveningSnacks')).toBe('Evening Snacks');
      expect(formatTimeSlot('morningBreakfast')).toBe('Morning Breakfast');
    });

    it('formats single word slot', () => {
      expect(formatTimeSlot('LUNCH')).toBe('Lunch');
    });
  });

  describe('createComponentConfig', () => {
    it('creates config with defaults', () => {
      const config = createComponentConfig('card');
      expect(config).toEqual({ type: 'card', variant: 'default', size: 'md' });
    });

    it('applies overrides', () => {
      const config = createComponentConfig('list-item', { variant: 'highlight', size: 'lg' });
      expect(config).toEqual({ type: 'list-item', variant: 'highlight', size: 'lg' });
    });

    it('allows partial overrides', () => {
      const config = createComponentConfig('dialog', { size: 'sm' });
      expect(config).toEqual({ type: 'dialog', variant: 'default', size: 'sm' });
    });

    it('accepts all component types', () => {
      expect(createComponentConfig('card').type).toBe('card');
      expect(createComponentConfig('list-item').type).toBe('list-item');
      expect(createComponentConfig('dialog').type).toBe('dialog');
      expect(createComponentConfig('grid-item').type).toBe('grid-item');
    });
  });

  describe('getTimeSlotLabel', () => {
    it('returns correct label for ALL', () => {
      expect(getTimeSlotLabel('ALL')).toBe('All slots');
    });

    it('returns correct label for MORNING', () => {
      expect(getTimeSlotLabel('MORNING')).toBe('Morning Breakfast');
    });

    it('returns correct label for LUNCH', () => {
      expect(getTimeSlotLabel('LUNCH')).toBe('Afternoon Lunch');
    });

    it('returns correct label for EVENINGSNACKS', () => {
      expect(getTimeSlotLabel('EVENINGSNACKS')).toBe('Evening Snacks');
    });

    it('returns correct label for DINNER', () => {
      expect(getTimeSlotLabel('DINNER')).toBe('Night Dinner');
    });
  });

  describe('normalizeMenuItem', () => {
    it('normalizes a raw item', () => {
      const raw = {
        id: '1',
        name: 'Idli',
        price: 50,
        foodType: 'VEG',
        timeSlot: 'MORNING',
        kitchenName: 'Kitchen A',
        description: 'Tasty idli',
        photos: [{ imageUrl: 'img1.jpg', sortOrder: 1 }],
      };
      const result = normalizeMenuItem(raw);
      expect(result).toEqual({
        id: '1',
        name: 'Idli',
        price: 50,
        foodType: 'VEG',
        timeSlot: 'MORNING',
        kitchenName: 'Kitchen A',
        description: 'Tasty idli',
        photos: [{ url: 'img1.jpg', order: 1 }],
      });
    });

    it('defaults kitchenName when missing', () => {
      const raw = { id: '1', name: 'Idli', price: 50, foodType: 'VEG', timeSlot: 'MORNING' };
      const result = normalizeMenuItem(raw);
      expect(result.kitchenName).toBe('Local kitchen');
    });

    it('handles missing photos', () => {
      const raw = { id: '1', name: 'Idli', price: 50, foodType: 'VEG', timeSlot: 'MORNING', kitchenName: 'K' };
      const result = normalizeMenuItem(raw);
      expect(result.photos).toBeUndefined();
    });

    it('converts price to number', () => {
      const raw = { id: '1', name: 'Idli', price: '75', foodType: 'VEG', timeSlot: 'LUNCH', kitchenName: 'K' };
      const result = normalizeMenuItem(raw);
      expect(result.price).toBe(75);
    });

    it('handles null description', () => {
      const raw = { id: '1', name: 'Idli', price: 50, foodType: 'VEG', timeSlot: 'MORNING', kitchenName: 'K', description: null };
      const result = normalizeMenuItem(raw);
      expect(result.description).toBeNull();
    });
  });
});
