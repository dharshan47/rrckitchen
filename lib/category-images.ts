const FALLBACK = "/categories/idli.png";

export function getCategoryImageUrl(name?: string): string {
  void name;
  return FALLBACK;
}
