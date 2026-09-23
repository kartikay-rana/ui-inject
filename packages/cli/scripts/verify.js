#!/usr/bin/env node

/**
 * Consumer-verification harness (plan § CLI): spins up a throwaway consumer
 * project, installs a free + a premium component through the real CLI, then
 * esbuild-compiles every installed .tsx to prove the bundle is self-contained
 * and resolves against a clean consumer.
 */

import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { createRequire } from 'node:module';
import { join } from 'node:path';

const require = createRequire(import.meta.url);
const API = process.env.TECH_INJECT_REGISTRY_URL ?? 'http://localhost:3001';
const TOKEN = process.env.TECH_INJECT_TOKEN;

const repoRoot = new URL('../../../', import.meta.url).pathname;
const nodePaths = [];
const { build } = require('esbuild');

async function login() {
  const fixtures = await import('@tech-inject/db');
  const res = await fetch(`${API}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: fixtures.fixturePremiumCustomer().email, password: fixtures.FIXTURE_PASSWORD }),
  });
  if (!res.ok) throw new Error(`seed login failed: ${res.status}`);
  const data = await res.json();
  return data.token;
}

async function main() {
  const root = await mkdtemp(join(tmpdir(), 'techinject-verify-'));
  console.log(`verify consumer at ${root}`);
  try {
    await writeFile(
      join(root, 'package.json'),
      JSON.stringify({ name: 'verify-consumer', version: '1.0.0', type: 'module', private: true }),
      'utf8'
    );

    const token = TOKEN ?? (await login());

    const { execFileSync } = await import('node:child_process');
    const cli = join(repoRoot, 'packages', 'cli', 'dist', 'index.js');
    const env = { ...process.env, TECH_INJECT_REGISTRY_URL: API, TECH_INJECT_TOKEN: token };

    execFileSync('node', [cli, 'add', 'button'], { cwd: root, env, stdio: 'inherit' });
    execFileSync('node', [cli, 'add', 'table'], { cwd: root, env, stdio: 'inherit' });
    execFileSync('node', [cli, 'add', 'sidebar'], { cwd: root, env, stdio: 'inherit' });

    const { execSync } = await import('node:child_process');
    const ts = execSync(`find ${root}/src/components -name '*.tsx'`, { encoding: 'utf8' })
      .split('\n')
      .filter(Boolean);
    console.log(`\ncompiling ${ts.length} installed .tsx files…`);

    const result = await build({
      entryPoints: ts,
      bundle: true,
      format: 'esm',
      platform: 'browser',
      jsx: 'automatic',
      outdir: join(root, '.verify-out'),
      write: false,
      logLevel: 'silent',
      nodePaths,
      external: ['react', 'react-dom', 'react-dom/client', 'react/jsx-runtime', '@radix-ui/*'],
    });

    if (result.errors.length) {
      console.error('\nverify FAILED:\n' + result.errors.map((e) => e.text).join('\n'));
      process.exit(1);
    }
    console.log(`\nverify OK — ${ts.length} files compiled (${result.outputFiles.length} outputs), deps externalized`);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(`verify failed: ${err instanceof Error ? err.stack ?? err.message : String(err)}`);
  process.exit(1);
});