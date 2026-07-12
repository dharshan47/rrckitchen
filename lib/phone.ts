export function normalizePhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) return `+91${digits}`;
  return "";
}
