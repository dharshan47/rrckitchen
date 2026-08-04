import slugify from "slugify";

export function uniqueSlug(base: string, existingSlugs: Set<string>): string {
  let slug = slugify(base, { lower: true, strict: true });
  if (!slug) slug = Math.random().toString(36).slice(2, 10);
  let candidate = slug;
  let counter = 1;
  while (existingSlugs.has(candidate)) {
    candidate = `${slug}-${counter}`;
    counter++;
  }
  existingSlugs.add(candidate);
  return candidate;
}