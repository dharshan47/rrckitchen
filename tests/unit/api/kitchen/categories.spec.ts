import { describe, expect, it, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/kitchen/categories/route';

vi.mock('@/lib/prisma', () => ({
  default: {
    category: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/category-images', () => ({
  getCategoryImageUrl: vi.fn(() => '/categories/idli.png'),
}));

describe('GET /api/kitchen/categories', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns active categories', async () => {
    const prisma = (await import('@/lib/prisma')).default;
    vi.mocked(prisma.category.findMany).mockResolvedValue([
      {
        id: 'c1',
        name: 'South Indian',
        isActive: true,
        _count: { kitchenCategories: 5 },
      } as never,
      {
        id: 'c2',
        name: 'North Indian',
        isActive: true,
        _count: { kitchenCategories: 3 },
      } as never,
    ]);

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toHaveLength(2);
    expect(body[0].name).toBe('South Indian');
    expect(body[0].kitchenCount).toBe(5);
    expect(body[1].name).toBe('North Indian');
    expect(body[1].kitchenCount).toBe(3);
  });

  it('filters by isActive=true', async () => {
    const prisma = (await import('@/lib/prisma')).default;
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);

    await GET();

    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isActive: true },
      })
    );
  });

  it('returns 500 on error', async () => {
    const prisma = (await import('@/lib/prisma')).default;
    vi.mocked(prisma.category.findMany).mockRejectedValue(new Error('DB error'));

    const response = await GET();
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ error: 'Failed to load categories' });
  });

  it('returns categories sorted by name asc', async () => {
    const prisma = (await import('@/lib/prisma')).default;
    vi.mocked(prisma.category.findMany).mockResolvedValue([]);

    await GET();

    expect(prisma.category.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { name: 'asc' },
      })
    );
  });
});
