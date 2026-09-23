import { isSafeRelativePath } from './schemas.js';

export interface PathError extends Error {
  code: 'UNSAFE_PATH' | 'ESCAPE' | 'CONFLICT';
}

function pathError(code: PathError['code'], message: string): PathError {
  const e = new Error(message) as PathError;
  e.code = code;
  return e;
}

/**
 * Resolve `rel` inside `dir`, guaranteeing the result stays inside `dir`.
 * Rejects absolute paths, `..`, and traversal attempts. Shared by the CLI and
 * the publish validation so the write policy cannot drift (DRY, answers #4).
 */
export function safeJoin(dir: string, rel: string): string {
  if (!isSafeRelativePath(rel)) {
    throw pathError('UNSAFE_PATH', `unsafe relative path: "${rel}"`);
  }
  const path = dir.endsWith('/') ? `${dir}${rel}` : `${dir}/${rel}`;
  if (path.includes('..')) {
    throw pathError('ESCAPE', `path escapes target directory: "${rel}"`);
  }
  return path;
}

/** Windows-style colon drives are rejected by isSafeRelativePath already. */
export function assertNoOverwrite(files: string[], existing: Set<string>): void {
  for (const f of files) {
    if (existing.has(f)) {
      throw pathError('CONFLICT', `file already exists: "${f}" (use --force to overwrite)`);
    }
  }
}