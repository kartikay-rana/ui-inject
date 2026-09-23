import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build, type Plugin } from 'esbuild';
import type { ComponentBundle } from '@tech-inject/registry';

/* Static keep-imports — resolves the packages esbuild pulls in *dynamically*
 * at runtime (see resolveFromProject) so Vercel's function tracer ships their
 * node_modules into the deployed function. */
import 'react';
import 'react-dom/client';
import '@radix-ui/react-checkbox';
import '@radix-ui/react-dropdown-menu';
import '@radix-ui/react-tabs';

const require = createRequire(import.meta.url);

/**
 * Preview builds must survive serverless: inputs are materialized under
 * os.tmpdir() (the only writable dir in a Vercel function), and bare package
 * imports are resolved back into the project's node_modules by an esbuild
 * plugin instead of by walking up from /tmp.
 */
const PREVIEW_DIR = path.join(tmpdir(), 'tech-inject-preview');

/**
 * Preview isolation (honest): the uploaded story is *compiled* on the backend
 * (esbuild → JS IIFE + CSS), but never *executed* here. The catalogue mounts the
 * result inside `<iframe srcdoc sandbox="allow-scripts">` (no allow-same-origin),
 * so the story runs in an opaque origin with no access to catalogue cookies and
 * no way to read anything but its own markup. React, react-dom and radix are
 * bundled inline (no CDN, no network) so the iframe is fully hermetic.
 */
export async function compilePreview(bundle: ComponentBundle): Promise<string> {
  await mkdir(PREVIEW_DIR, { recursive: true });
  const dir = await mkdtemp(path.join(PREVIEW_DIR, 'preview-'));
  try {
    await materialize(dir, bundle.files);
    const storyPath = bundle.preview?.story;
    if (!storyPath) {
      throw new Error('no preview story declared for this component');
    }
    await writeFile(
      path.join(dir, '__mount.tsx'),
      [
        "import { createRoot } from 'react-dom/client';",
        "import Preview from '" + importSpecifier(storyPath) + "';",
        "const el = document.getElementById('root')!;",
        'createRoot(el).render(Preview.default ? <Preview.default /> : <Preview />);',
      ].join('\n'),
      'utf8'
    );

    const js = await bundleJs(dir);
    const css = await bundleCss(dir, bundle);
    const theme = await themeCss();
    const html = `
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<style>${theme}\n${css}</style>
</head>
<body style="margin:0;background:var(--background,#161616)">
<div id="root"></div>
<script>${js}</script>
</body>
</html>`;
    return html;
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** The design-token stylesheet backing every preview (single source of truth). */
async function themeCss(): Promise<string> {
  try {
    return await readFile(require.resolve('@tech-inject/theme/styles.css'), 'utf8');
  } catch {
    return ':root{color-scheme:dark;--background:#161616;}';
  }
}

function importSpecifier(storyPath: string): string {
  const withoutExt = storyPath.replace(/\.(tsx|ts)$/, '');
  const posix = withoutExt.replace(/\\/g, '/');
  return `./${posix}`.replace(/\/+/g, '/');
}

/** Write every bundle file to disk so esbuild resolves relative imports normally. */
async function materialize(dir: string, files: Record<string, string>) {
  for (const [rel, content] of Object.entries(files)) {
    const out = path.join(dir, rel);
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, content, 'utf8');
  }
}

/** css for the component itself — concatenate css files; theme vars come from the built-in theme. */
async function bundleCss(dir: string, bundle: ComponentBundle): Promise<string> {
  const cssPaths = Object.keys(bundle.files).filter((f) => f.endsWith('.css')).sort();
  const parts: string[] = [];
  for (const f of cssPaths) {
    parts.push(await readFile(path.join(dir, f), 'utf8'));
  }
  return parts.join('\n');
}

/** Bare imports are resolved against the project's node_modules (not /tmp). */
function resolveBare(spec: string): string | null {
  const bases = [path.dirname(fileURLToPath(import.meta.url)), process.cwd()];
  for (const base of bases) {
    try {
      return require.resolve(spec, { paths: [base] });
    } catch {
      // try the next base
    }
  }
  return null;
}

function resolveFromProject(): Plugin {
  return {
    name: 'resolve-from-project',
    setup(build) {
      build.onResolve({ filter: /^[^./]/ }, (args) => {
        const resolved = resolveBare(args.path);
        return resolved ? { path: resolved } : undefined;
      });
    },
  };
}

async function bundleJs(dir: string): Promise<string> {
  const result = await build({
    entryPoints: [path.join(dir, '__mount.tsx')],
    bundle: true,
    format: 'iife',
    platform: 'browser',
    jsx: 'automatic',
    outdir: dir,
    write: false,
    logLevel: 'silent',
    treeShaking: true,
    plugins: [resolveFromProject()],
  });
  const file = result.outputFiles?.[0];
  if (!file) throw new Error('esbuild produced no script output');
  return Buffer.from(file.contents).toString('utf8');
}