/**
 * Dependency-free class-name joiner shared by every component. Kept tiny and
 * dependency-free on purpose (KISS/YAGNI): it only concatenates truthy class
 * strings — no Tailwind merge, no object style logic (answers #2).
 */
export type ClassValue = string | false | null | undefined;

export function cn(...values: ClassValue[]): string {
  const out: string[] = [];
  for (const v of values) {
    if (typeof v === 'string' && v.length > 0) out.push(v);
  }
  return out.join(' ');
}