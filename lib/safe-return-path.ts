// Only accept same-origin relative paths so caller-supplied return locations
// can't be turned into open redirects. Strips protocol-relative '//' defensively.
export function safeReturnPath(value: string | null | undefined): string | null {
  if (!value) return null;
  if (!value.startsWith('/') || value.startsWith('//')) return null;
  return value;
}
