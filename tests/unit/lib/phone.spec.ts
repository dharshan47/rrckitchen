import { describe, expect, it } from 'vitest';
import { normalizePhone } from '@/lib/phone';

describe('normalizePhone', () => {
  it('prepends +91 to a 10-digit number', () => {
    expect(normalizePhone('9876543210')).toBe('+919876543210');
  });

  it('prepends +91 when digits have spaces or dashes', () => {
    expect(normalizePhone('987-654-3210')).toBe('+919876543210');
    expect(normalizePhone('987 654 3210')).toBe('+919876543210');
  });

  it('returns + prefixed value for 12-digit number starting with 91', () => {
    expect(normalizePhone('919876543210')).toBe('+919876543210');
  });

  it('returns empty string for less than 10 digits', () => {
    expect(normalizePhone('12345')).toBe('');
  });

  it('returns empty string for 11 digits', () => {
    expect(normalizePhone('12345678901')).toBe('');
  });

  it('returns empty string for more than 12 digits', () => {
    expect(normalizePhone('1234567890123')).toBe('');
  });

  it('handles 12-digit number not starting with 91', () => {
    expect(normalizePhone('109876543210')).toBe('');
  });

  it('strips all non-digit characters', () => {
    expect(normalizePhone('+91-987-654-3210')).toBe('+91919876543210');
  });

  it('handles empty string input', () => {
    expect(normalizePhone('')).toBe('');
  });
});
