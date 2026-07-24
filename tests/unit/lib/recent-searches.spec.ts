import { describe, expect, it, vi, beforeEach } from 'vitest';

const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
    removeItem: vi.fn((key: string) => { delete store[key]; }),
    clear: vi.fn(() => { store = {}; }),
    get length() { return Object.keys(store).length; },
    key: vi.fn((i: number) => Object.keys(store)[i] || null),
  };
})();

vi.stubGlobal('localStorage', localStorageMock);

import { getRecentKitchens, addRecentKitchen, removeRecentKitchen } from '@/lib/recent-searches';

const kitchen1 = { id: 'k1', slug: 'kitchen-1', name: 'Kitchen One' };
const kitchen2 = { id: 'k2', slug: 'kitchen-2', name: 'Kitchen Two' };
const kitchen3 = { id: 'k3', slug: 'kitchen-3', name: 'Kitchen Three' };
const kitchen4 = { id: 'k4', slug: 'kitchen-4', name: 'Kitchen Four' };
const kitchen5 = { id: 'k5', slug: 'kitchen-5', name: 'Kitchen Five' };
const kitchen6 = { id: 'k6', slug: 'kitchen-6', name: 'Kitchen Six' };

describe('recent-searches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.clear();
  });

  describe('getRecentKitchens', () => {
    it('returns empty array when no data exists', () => {
      expect(getRecentKitchens()).toEqual([]);
    });

    it('returns parsed kitchens from localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([kitchen1, kitchen2]));
      expect(getRecentKitchens()).toEqual([kitchen1, kitchen2]);
    });

    it('returns empty array on parse error', () => {
      localStorageMock.getItem.mockReturnValueOnce('invalid json');
      expect(getRecentKitchens()).toEqual([]);
    });

    it('returns empty array when localStorage returns null', () => {
      localStorageMock.getItem.mockReturnValueOnce(null);
      expect(getRecentKitchens()).toEqual([]);
    });
  });

  describe('addRecentKitchen', () => {
    it('adds a kitchen to the beginning of the list', () => {
      localStorageMock.getItem.mockReturnValueOnce('[]');
      addRecentKitchen(kitchen1);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'recentlySearchedKitchens',
        JSON.stringify([kitchen1])
      );
    });

    it('moves a duplicate kitchen to the top', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([kitchen1, kitchen2]));
      addRecentKitchen(kitchen1);
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'recentlySearchedKitchens',
        JSON.stringify([kitchen1, kitchen2])
      );
    });

    it('limits list to 5 entries', () => {
      const items = [kitchen1, kitchen2, kitchen3, kitchen4, kitchen5];
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify(items));
      addRecentKitchen(kitchen6);
      const saved = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
      expect(saved).toHaveLength(5);
      expect(saved[0]).toEqual(kitchen6);
      expect(saved[saved.length - 1]).toEqual(kitchen2);
    });

    it('saves multiple items correctly', () => {
      localStorageMock.getItem.mockReturnValueOnce('[]');
      addRecentKitchen(kitchen1);
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([kitchen1]));
      addRecentKitchen(kitchen2);
      const secondCall = JSON.parse(localStorageMock.setItem.mock.calls[1][1]);
      expect(secondCall).toEqual([kitchen2, kitchen1]);
    });
  });

  describe('removeRecentKitchen', () => {
    it('removes a kitchen by id', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([kitchen1, kitchen2, kitchen3]));
      removeRecentKitchen('k2');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'recentlySearchedKitchens',
        JSON.stringify([kitchen1, kitchen3])
      );
    });

    it('handles removing non-existent id', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([kitchen1]));
      removeRecentKitchen('k99');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'recentlySearchedKitchens',
        JSON.stringify([kitchen1])
      );
    });

    it('results in empty list when removing the only item', () => {
      localStorageMock.getItem.mockReturnValueOnce(JSON.stringify([kitchen1]));
      removeRecentKitchen('k1');
      expect(localStorageMock.setItem).toHaveBeenCalledWith(
        'recentlySearchedKitchens',
        '[]'
      );
    });
  });
});
