import { readFile } from 'node:fs/promises';
import { describe, expect, it } from 'vitest';

const themeCss = await readFile(new URL('../src/theme.css', import.meta.url), 'utf8');

function token(name: string): string {
  const m = themeCss.match(new RegExp(`--${name}\\s*:\\s*([^;]+);`));
  if (!m) throw new Error(`missing token --${name}`);
  return m[1].trim();
}

describe('theme token parity (answers #5)', () => {
  it('reads core tokens from theme.css', () => {
    expect(token('background')).toBe('#161616');
    expect(token('card')).toBe('#1b1d20');
    expect(token('foreground')).toBe('#f9fbff');
    expect(token('primary')).toBe('#4124fb');
    expect(token('border')).toBe('#232323');
    expect(token('radius')).toBe('0.5rem');
    expect(token('check-fill')).toBe('#ffdb4b');
  });

  it('is dark-scheme only', () => {
    expect(themeCss).toContain('color-scheme: dark');
  });
});