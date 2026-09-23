import { z } from 'zod';
import type { ComponentBundle } from './types.js';

/** Shared validation for every developer-facing contract (DRY, answers #2/#3). */

export const MAX_FILES = 12;
export const MAX_BUNDLE_BYTES = 1_000_000;
export const MAX_DEPENDENCIES = 20;
/** `@scope/name` style package names for declared dependencies. */
const DEPENDENCY_RE = /^(@[a-z0-9-]+\/)?[a-z0-9-_.]+$/i;
export const parseableIdentifierSchema = z.string();
export const slugSchema = parseableIdentifierSchema
  .min(1)
  .max(64)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'slug must be lowercase kebab-case (a-z0-9 and -)');

export const accessLevelSchema = z.enum(['free', 'premium']);

export const versionSchema = z
  .string()
  .regex(/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/, 'version must be semver like 1.2.3');

const fileNameRe = /^[a-zA-Z0-9._/-]+$/;

export const componentFileSchema = z
  .record(z.string(), z.string())
  .refine((files) => Object.keys(files).length >= 1, 'at least one file is required')
  .refine((files) => Object.keys(files).length <= MAX_FILES, `at most ${MAX_FILES} files`)
  .refine(
    (files) => Object.entries(files).every(([path, content]) => isSafeRelativePath(path) && allowedFile(path)),
    'unsupported file name/path or extension'
  )
  .refine((files) => totalBytes(files) <= MAX_BUNDLE_BYTES, `bundle exceeds ${MAX_BUNDLE_BYTES} bytes`);

export const dependencyListSchema = z
  .array(z.string())
  .max(MAX_DEPENDENCIES)
  .refine((deps) => deps.every(isSafeDependency), `dependency names must match ${DEPENDENCY_RE.source}`);

export const componentBundleSchema = z.object({
  slug: slugSchema,
  name: z.string().min(1).max(120),
  description: z.string().min(1).max(1000),
  category: z.string().min(1).max(60),
  version: versionSchema,
  accessLevel: accessLevelSchema,
  dependencies: dependencyListSchema,
  props: z.string().min(1).max(20_000),
  usage: z.string().min(1).max(40_000),
  files: componentFileSchema,
  preview: z
    .object({
      story: z.string().refine(isSafeRelativePath, 'story path is unsafe'),
      sample: z.record(z.string(), z.unknown()),
    })
    .nullable(),
});

export const draftCreateSchema = componentBundleSchema.strict();

export const draftUpdateSchema = componentBundleSchema.partial().strict();

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const adminLoginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const premiumGrantSchema = z.object({
  premium: z.boolean(),
});

export const installRequestSchema = z.object({
  slug: z.string(),
  token: z.string().optional(),
  dir: z.string().optional(),
});

// ---------------------------------------------------------------------------
// Shared constants + helpers (imported by API, CLI and tests)

/** Extensions a component bundle may contain. Anything executable beyond TS/CSS is rejected. */
const ALLOWED_EXTENSIONS = ['.tsx', '.ts', '.css', '.json', '.md'];
/** Imports a bundle may use. Users must declare each dep; catalogue internals are forbidden. */
const CORE_LIBS = new Set(['react', 'react-dom', 'react/jsx-runtime']);
const FORBIDDEN_IMPORTERS = new Set(['@tech-inject']);

export function isSafeRelativePath(p: string): boolean {
  if (typeof p !== 'string' || p.length === 0 || p.length > 200) return false;
  if (!fileNameRe.test(p)) return false;
  if (p.includes('..')) return false;
  if (p.startsWith('/') || /^[a-zA-Z]:[\\/]/.test(p)) return false;
  if (p.split('/').some((seg) => seg.length === 0)) return false;
  return true;
}

export function allowedFile(p: string): boolean {
  const dot = p.lastIndexOf('.');
  if (dot === -1) return false;
  return ALLOWED_EXTENSIONS.includes(p.slice(dot).toLowerCase());
}

export function totalBytes(files: Record<string, string>): number {
  return Object.values(files).reduce((acc, s) => acc + Buffer.byteLength(s, 'utf8'), 0);
}

export function isSafeDependency(dep: string): boolean {
  if (typeof dep !== 'string' || dep.length === 0 || dep.length > 80) return false;
  return DEPENDENCY_RE.test(dep) && !/[;$<>]/.test(dep);
}

function declaredDeps(bundle: Pick<ComponentBundle, 'dependencies'>): Set<string> {
  return new Set([...bundle.dependencies, ...CORE_LIBS]);
}

export interface Violation {
  file: string;
  reason: string;
}

/**
 * Static import audit — never executes the code. Ensures the bundle only
 * imports `react`/declared deps and never the catalogue internals.
 */
export function auditImports(
  bundle: Pick<ComponentBundle, 'dependencies' | 'files'>
): Violation[] {
  const allowed = declaredDeps(bundle);
  const out: Violation[] = [];
  const re = /(?:from\s+|import\s*\(\s*|require\s*\(\s*)['"]([^'"]+)['"]/g;
  for (const [file, content] of Object.entries(bundle.files)) {
    if (allowedFile(file) && /\.(tsx?|jsx?)$/.test(file)) {
      let m: RegExpExecArray | null;
      while ((m = re.exec(content)) !== null) {
        const spec = m[1];
        if (!spec || spec.startsWith('.')) continue;
        const pkg = spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0];
        if (FORBIDDEN_IMPORTERS.has(pkg) || pkg.startsWith('@tech-inject')) {
          out.push({ file, reason: `import of catalogue internal package "${spec}" is forbidden` });
        } else if (!allowed.has(pkg) && !allowed.has(spec)) {
          out.push({
            file,
            reason: `undeclared dependency "${spec}" — add it to "dependencies" or remove the import`,
          });
        }
      }
    }
  }
  return out;
}