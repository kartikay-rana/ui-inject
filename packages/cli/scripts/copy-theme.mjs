import { createRequire } from 'node:module';
import { copyFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const require = createRequire(import.meta.url);
const source = require.resolve('@tech-inject/theme/styles.css');
const outDir = fileURLToPath(new URL('../dist/', import.meta.url));
await mkdir(outDir, { recursive: true });
await copyFile(source, new URL('../dist/theme.css', import.meta.url));
console.log(`theme.css copied from ${source} → dist/theme.css`);