import { describe, expect, it } from 'vitest';
import {
  EventBus,
  noDiscountStrategy,
  percentageDiscountStrategy,
  vegFilterStrategy,
  nonVegFilterStrategy,
  allFilterStrategy,
  createFilterStrategy,
  createBadgeVariant,
  formatTimeSlot,
  getTimeSlotLabel,
  createComponentConfig,
  normalizeMenuItem,
} from '@/lib/patterns';

describe('EventBus', () => {
  it('subscribes and emits events', () => {
    const bus = new EventBus();
    let called = false;
    bus.on('test', () => { called = true; });
    bus.emit('test', null);
    expect(called).toBe(true);
  });

  it('passes payload to listeners', () => {
    const bus = new EventBus();
    let payload: unknown = null;
    bus.on('data', (p: unknown) => { payload = p; });
    bus.emit('data', { id: 1 });
    expect(payload).toEqual({ id: 1 });
  });

  it('unsubscribes listeners', () => {
    const bus = new EventBus();
    let count = 0;
    const unsub = bus.on('test', () => { count++; });
    unsub();
    bus.emit('test', null);
    expect(count).toBe(0);
  });

  it('once listener fires only once', () => {
    const bus = new EventBus();
    let count = 0;
    bus.once('test', () => { count++; });
    bus.emit('test', null);
    bus.emit('test', null);
    expect(count).toBe(1);
  });

  it('clears all listeners', () => {
    const bus = new EventBus();
    let count = 0;
    bus.on('a', () => { count++; });
    bus.on('b', () => { count++; });
    bus.clear();
    bus.emit('a', null);
    bus.emit('b', null);
    expect(count).toBe(0);
  });

  it('clears specific event listeners', () => {
    const bus = new EventBus();
    let count = 0;
    bus.on('a', () => { count++; });
    bus.on('b', () => { count++; });
    bus.clear('a');
    bus.emit('a', null);
    bus.emit('b', null);
    expect(count).toBe(1);
  });
});

describe('Strategy Pattern', () => {
  const items = [
    { foodType: 'VEG' },
    { foodType: 'NONVEG' },
    { foodType: 'VEG' },
  ];

  it('allFilterStrategy returns all items', () => {
    expect(allFilterStrategy.execute(items)).toHaveLength(3);
  });

  it('vegFilterStrategy returns only VEG items', () => {
    expect(vegFilterStrategy.execute(items)).toHaveLength(2);
  });

  it('nonVegFilterStrategy returns only NONVEG items', () => {
    expect(nonVegFilterStrategy.execute(items)).toHaveLength(1);
  });

  it('createFilterStrategy returns correct strategy', () => {
    expect(createFilterStrategy('VEG')).toBe(vegFilterStrategy);
    expect(createFilterStrategy('NONVEG')).toBe(nonVegFilterStrategy);
    expect(createFilterStrategy('ALL')).toBe(allFilterStrategy);
  });

  it('noDiscountStrategy calculates correctly', () => {
    const result = noDiscountStrategy.execute({ basePrice: 100, qty: 3 });
    expect(result.subtotal).toBe(300);
    expect(result.discount).toBe(0);
    expect(result.total).toBe(300);
  });

  it('percentageDiscountStrategy applies discount', () => {
    const strategy = percentageDiscountStrategy(10);
    const result = strategy.execute({
      basePrice: 100,
      qty: 2,
      discounts: [{ type: 'percentage', value: 10 }],
    });
    expect(result.subtotal).toBe(200);
    expect(result.discount).toBe(20);
    expect(result.total).toBe(180);
  });

  it('percentageDiscountStrategy handles fixed discounts', () => {
    const strategy = percentageDiscountStrategy(0);
    const result = strategy.execute({
      basePrice: 100,
      qty: 1,
      discounts: [{ type: 'fixed', value: 25 }],
    });
    expect(result.total).toBe(75);
  });

  it('percentageDiscountStrategy clamps to zero', () => {
    const strategy = percentageDiscountStrategy(100);
    const result = strategy.execute({
      basePrice: 100,
      qty: 1,
      discounts: [{ type: 'percentage', value: 200 }],
    });
    expect(result.total).toBe(0);
  });
});

describe('Factory Pattern', () => {
  it('createBadgeVariant returns correct variants', () => {
    expect(createBadgeVariant('VEG')).toBe('secondary');
    expect(createBadgeVariant('NONVEG')).toBe('destructive');
    expect(createBadgeVariant('UNKNOWN')).toBe('outline');
  });

  it('formatTimeSlot formats single words correctly', () => {
    expect(formatTimeSlot('MORNING')).toBe('Morning');
    expect(formatTimeSlot('LUNCH')).toBe('Lunch');
    expect(formatTimeSlot('DINNER')).toBe('Dinner');
  });

  it('formatTimeSlot formats multi-word tokens', () => {
    expect(formatTimeSlot('EVENINGSNACKS')).toBe('Eveningsnacks');
  });

  it('getTimeSlotLabel returns correct labels', () => {
    expect(getTimeSlotLabel('ALL')).toBe('All slots');
    expect(getTimeSlotLabel('MORNING')).toBe('Morning Breakfast');
    expect(getTimeSlotLabel('LUNCH')).toBe('Afternoon Lunch');
    expect(getTimeSlotLabel('EVENINGSNACKS')).toBe('Evening Snacks');
    expect(getTimeSlotLabel('DINNER')).toBe('Night Dinner');
  });

  it('createComponentConfig returns defaults', () => {
    expect(createComponentConfig('card')).toEqual({ type: 'card', variant: 'default', size: 'md' });
  });

  it('createComponentConfig merges overrides', () => {
    expect(createComponentConfig('dialog', { size: 'lg' })).toEqual({ type: 'dialog', variant: 'default', size: 'lg' });
  });

  it('normalizeMenuItem converts raw data', () => {
    const raw = {
      id: '123',
      name: 'Dosa',
      price: '60',
      foodType: 'VEG',
      timeSlot: 'MORNING',
      kitchenName: 'My Kitchen',
      photos: [{ imageUrl: '/photo.jpg', sortOrder: 1 }],
    };
    const result = normalizeMenuItem(raw);
    expect(result.id).toBe('123');
    expect(result.name).toBe('Dosa');
    expect(result.price).toBe(60);
    expect(result.kitchenName).toBe('My Kitchen');
    expect(result.photos).toHaveLength(1);
    expect(result.photos![0].url).toBe('/photo.jpg');
  });

  it('normalizeMenuItem uses fallback kitchenName', () => {
    const result = normalizeMenuItem({ id: '1', name: 'Food', price: 50, foodType: 'VEG', timeSlot: 'LUNCH' } as Record<string, unknown>);
    expect(result.kitchenName).toBe('Local kitchen');
  });
});
