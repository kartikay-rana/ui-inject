import { resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { safeJoin, componentDir, writeBundleToDisk } from './paths.js';

const THEME_CSS_PATH = new URL('./theme.css', import.meta.url);

export const REGISTRY_URL = process.env.TECH_INJECT_REGISTRY_URL ?? 'https://api-git-main-kartikay-ranas-projects.vercel.app';
export const API = REGISTRY_URL.replace(/\/$/, '');

export interface SourceResult {
  component: { slug: string; name: string; version: string; accessLevel: string; dependencies: string[] };
  files: Record<string, string>;
  usage: string;
  contentHash: string;
}

export async function listComponents(token?: string): Promise<{ slug: string; name: string; description: string; accessLevel: string }[]> {
  const res = await fetch(`${API}/api/v1/components`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new Error(`list: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as { items: unknown[] };
  return data.items as { slug: string; name: string; description: string; accessLevel: string }[];
}

export async function fetchComponent(slug: string, token?: string): Promise<SourceResult> {
  const res = await fetch(`${API}/api/v1/components/${slug}/source`, {
    headers: token ? { authorization: `Bearer ${token}` } : {},
  });
  if (res.status === 403) {
    throw new Error(`${slug} requires premium access — set TECH_INJECT_TOKEN for a premium account`);
  }
  if (!res.ok) throw new Error(`${slug}: ${res.status} ${await res.text()}`);
  const data = (await res.json()) as SourceResult;
  if (!data.component || !data.files) {
    throw new Error(`${slug}: unexpected API response`);
  }
  return data;
}

export interface InstallResult {
  slug: string;
  dir: string;
  files: string[];
  deps: string[];
  /** absolute path of the shared theme.css the installer also wrote */
  themeFile: string;
}

export async function installComponent(slug: string, opts: { cwd?: string; force?: boolean; token?: string } = {}): Promise<InstallResult> {
  const token = opts.token ?? process.env.TECH_INJECT_TOKEN;
  const result = await fetchComponent(slug, token);
  const base = resolve(opts.cwd ?? process.cwd(), 'src', 'components');
  const dir = await componentDir(base, slug, opts.force ?? false);
  const manifest = {
    name: result.component.name,
    slug,
    version: result.component.version,
    accessLevel: result.component.accessLevel,
    registryUrl: API,
    installedAt: new Date().toISOString(),
    dependencies: result.component.dependencies,
  };
  const stripped: Record<string, string> = {};
  const prefix = `components/${slug}/`;
  for (const [rel, content] of Object.entries(result.files)) {
    stripped[rel.startsWith(prefix) ? rel.slice(prefix.length) : rel] = content;
  }
  const files = await writeBundleToDisk(dir, stripped, manifest);
  const themeFile = resolve(base, 'theme.css');
  await writeFile(themeFile, await readFile(THEME_CSS_PATH, 'utf8'), 'utf8');
  const scopePkg = resolve(base, 'package.json');
  await writeFile(scopePkg, JSON.stringify({ type: 'module' }, null, 2) + '\n', 'utf8');
  return {
    slug,
    dir,
    files: [...files, 'theme.css', 'package.json'],
    deps: result.component.dependencies,
    themeFile,
  };
}