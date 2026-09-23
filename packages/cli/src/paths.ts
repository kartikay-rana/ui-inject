import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { basename, join, normalize, resolve, sep } from 'node:path';

/**
 * Resolve a relative bundle path safely inside `base`, and never allow walking
 * out of the component directory (no `../` escapes, no absolute paths, no
 * sneaky path separators).
 */
export function safeJoin(base: string, rel: string): string {
  if (rel.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(rel)) {
    throw new Error(`absolute paths are not allowed: ${rel}`);
  }
  if (rel.includes('\\')) {
    throw new Error(`backslashes are not allowed in paths: ${rel}`);
  }
  const normalized = normalize(rel);
  const parts = normalized.split(sep);
  if (parts.some((p) => p === '..')) {
    throw new Error(`path escapes the component directory: ${rel}`);
  }
  if (parts.some((p) => p === '')) {
    throw new Error(`empty path segments are not allowed: ${rel}`);
  }
  const target = resolve(base, normalized);
  const root = resolve(base);
  if (target !== root && !target.startsWith(root + sep)) {
    throw new Error(`path escapes the component directory: ${rel}`);
  }
  return target;
}

/** A component directory name guaranteed unique-ish inside `base`. */
export async function componentDir(base: string, slug: string, force = false): Promise<string> {
  const dir = resolve(base, slug);
  try {
    await readFile(join(dir, 'techinject.json'), 'utf8');
  } catch {
    // does not exist yet
    if (!force) {
      await rm(dir, { recursive: true, force: true });
    }
    await mkdir(dir, { recursive: true });
    return dir;
  }
  throw new Error(`${slug} already installed — use --force to overwrite`);
}

export async function writeBundleToDisk(
  dir: string,
  files: Record<string, string>,
  manifest: Record<string, unknown>
): Promise<string[]> {
  const written: string[] = [];
  for (const [rel, content] of Object.entries(files)) {
    const out = safeJoin(dir, rel);
    await mkdir(join(out, '..'), { recursive: true });
    await writeFile(out, content, 'utf8');
    written.push(rel);
  }
  await writeFile(join(dir, 'techinject.json'), JSON.stringify(manifest, null, 2) + '\n', 'utf8');
  return written;
}