#!/usr/bin/env node

import { resolve } from 'node:path';
import { readFile, writeFile } from 'node:fs/promises';
import { installComponent, listComponents } from './install.js';

const usage = `Tech Inject CLI

Usage:
  techinject-cli add <slug> [--force] [--registry=<url>]
  techinject-cli list
  techinject-cli --help

Env:
  TECH_INJECT_TOKEN  premium access token (from the catalogue / API)
  TECH_INJECT_REGISTRY_URL  override the registry base URL`;

function argValue(args: string[], flag: string): string | undefined {
  const hit = args.find((a) => a.startsWith(`${flag}=`));
  return hit?.slice(flag.length + 1);
}

async function tryReadPackageJson(cwd: string) {
  try {
    return JSON.parse(await readFile(resolve(cwd, 'package.json'), 'utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function main() {
  const argv = process.argv.slice(2);

  if (argv.includes('--help') || argv.length === 0) {
    console.log(usage);
    process.exit(0);
  }

  const registryFlag = argValue(argv, '--registry') ?? argValue(argv, '--registry-url');
  if (registryFlag) {
    process.env.TECH_INJECT_REGISTRY_URL = registryFlag;
  }

  const cmd = argv[0];

  if (cmd === 'list') {
    const token = process.env.TECH_INJECT_TOKEN;
    const items = await listComponents(token);
    for (const item of items) {
      console.log(`${item.accessLevel.padEnd(8)} ${item.slug.padEnd(28)} ${item.description}`);
    }
    console.log(`\n${items.length} component(s) — use "add <slug>" to install one.`);
    process.exit(0);
  }

  if (cmd !== 'add') {
    console.error(`unknown command: ${cmd}`);
    process.exit(1);
  }

  const slug = argv[1];
  if (!slug) {
    console.error('missing slug — use: techinject-cli add <slug>');
    process.exit(1);
  }

  const force = argv.includes('--force');
  const cwd = process.cwd();
  const pkg = await tryReadPackageJson(cwd);
  if (!pkg) {
    console.error('no package.json found — run this from a React + TypeScript project root');
    process.exit(1);
  }

  const result = await installComponent(slug, { cwd, force });

  console.log(`Installed ${result.slug} → ${result.dir}`);
  for (const f of result.files) console.log(`  + ${f}`);

  if (result.deps.length) {
    console.log('\nDeclared dependencies — add them to your project:');
    console.log(`  pnpm add ${result.deps.join(' ')}`);
  }

  const deps = pkg.dependencies as Record<string, string> | undefined;
  const manifest: Record<string, number> = {};
  try {
    const ini = JSON.parse(await readFile(resolve(cwd, 'techinject.json'), 'utf8')) as Record<string, number>;
    Object.assign(manifest, ini);
  } catch {
    // no existing manifest
  }
  manifest[result.slug] = 0;
  // track version in the record: value is "installed version count"
  delete manifest[result.slug];
  void deps;
  await writeFile(resolve(cwd, 'techinject.json'), JSON.stringify({ components: Object.keys(manifest), [result.slug]: result.deps }, null, 2) + '\n', 'utf8');

  console.log('\nDone. Import it from your components folder:\n');
  const entry = result.files.find((f) => f.endsWith('.tsx') && !f.endsWith('.story.tsx'));
  if (entry) {
    console.log(`  import { ${entry.split('/').pop()!.replace('.tsx', '')} } from './src/components/${slug}/${entry.split('/').pop()!}';`);
  }
}

main().catch((err) => {
  console.error(`error: ${err instanceof Error ? err.message : String(err)}`);
  process.exit(1);
});