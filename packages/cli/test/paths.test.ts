import { describe, expect, it } from 'vitest';
import { safeJoin } from '../src/paths.js';

describe('CLI path confinement (answers #4)', () => {
  it('accepts plain relative paths inside the base', () => {
    expect(safeJoin('/base', 'Button.tsx')).toBe('/base/Button.tsx');
    expect(safeJoin('/base', 'sub/Button.tsx')).toBe('/base/sub/Button.tsx');
  });

  it('rejects absolute paths', () => {
    expect(() => safeJoin('/base', '/etc/Button.tsx')).toThrow();
    expect(() => safeJoin('/base', 'C:\\Windows\\x.tsx')).toThrow();
  });

  it('rejects traversal attempts', () => {
    expect(() => safeJoin('/base', '../outside.tsx')).toThrow();
    expect(() => safeJoin('/base', 'a/../../outside.tsx')).toThrow();
  });

  it('rejects separators that could break out on posix', () => {
    expect(() => safeJoin('/base', 'a\\..\\up.tsx')).toThrow();
  });

  it('returns normalized absolute result under base', () => {
    expect(safeJoin('/base', 'cn.ts'.repeat(0) + 'cn.ts')).toBe('/base/cn.ts');
  });
});