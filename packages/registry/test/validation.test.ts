import { describe, expect, it } from 'vitest';
import {
  componentBundleSchema,
  draftCreateSchema,
  slugSchema,
  auditImports,
  isSafeRelativePath,
  safeJoin as registrySafeJoin,
} from '../src/index.js';

const FILES_KEY_LABEL = 'files must be a record';

describe('bundle validation (answers #2/#3)', () => {
  it('accepts a well-formed free bundle', () => {
    const res = componentBundleSchema.safeParse({
      slug: 'my-button',
      name: 'My Button',
      description: 'A button.',
      category: 'action',
      version: '1.0.0',
      accessLevel: 'free',
      dependencies: [],
      props: 'interface Props { label: string }',
      usage: '<MyButton label="x" />',
      files: {
        'components/my-button/MyButton.tsx': 'export function MyButton() { return <button>hi</button> }',
        'components/my-button/MyButton.css': '.mb { }',
      },
      preview: { story: 'components/my-button/MyButton.story.tsx', sample: {} },
    });
    expect(res.success).toBe(true);
  });

  it('rejects uppercase / bad slug shape', () => {
    expect(slugSchema.safeParse('BadSlug').success).toBe(false);
    expect(slugSchema.safeParse('my_slug').success).toBe(false);
    expect(slugSchema.safeParse('my-slug').success).toBe(true);
  });

  it('rejects unsafe file paths (traversal, absolute, windows)', () => {
    expect(isSafeRelativePath('../evil.tsx')).toBe(false);
    expect(isSafeRelativePath('/etc/passwd')).toBe(false);
    expect(isSafeRelativePath('C:\\windows\\x')).toBe(false);
    expect(isSafeRelativePath('components//x.tsx')).toBe(false);
  });

  it('rejects more than 12 files and over-size bundle', () => {
    const files: Record<string, string> = {};
    for (let i = 0; i < 13; i++) files[`components/x/f${i}.tsx`] = 'export const x = 0';
    const res = componentBundleSchema.safeParse({
      slug: 'x',
      name: 'X',
      description: 'd',
      category: 'action',
      version: '1.0.0',
      accessLevel: 'free',
      dependencies: [],
      props: 'p',
      usage: 'u',
      files,
      preview: null,
    });
    expect(res.success).toBe(false);
  });

  it('rejects disallowed extensions', () => {
    const files = { 'components/x/evil.sh': 'rm -rf /' };
    const res = componentBundleSchema.safeParse({
      slug: 'x',
      name: 'X',
      description: 'd',
      category: 'action',
      version: '1.0.0',
      accessLevel: 'free',
      dependencies: [],
      props: 'p',
      usage: 'u',
      files,
      preview: null,
    });
    expect(res.success).toBe(false);
  });

  it('enforces strict shape on publish (extra keys rejected)', () => {
    const res = draftCreateSchema.safeParse({
      slug: 'x',
      name: 'X',
      description: 'd',
      category: 'action',
      version: '1.0.0',
      accessLevel: 'free',
      dependencies: [],
      props: 'p',
      usage: 'u',
      files: { 'components/x/X.tsx': 'export const x = 1' },
      preview: null,
      evil: true,
    });
    expect(res.success).toBe(false);
  });
});

describe('import audit (answers #1/#3)', () => {
  const base = {
    slug: 'x',
    dependencies: [] as string[],
    files: { 'components/x/X.tsx': '' } as Record<string, string>,
  };

  it('allows react and relative imports', () => {
    base.files['components/x/X.tsx'] = "import React from 'react';\nimport './peer.js';";
    expect(auditImports(base)).toEqual([]);
  });

  it('allows declared dependencies (incl. radix scopes)', () => {
    base.dependencies = ['@radix-ui/react-checkbox'];
    base.files['components/x/X.tsx'] = "import * as Checkbox from '@radix-ui/react-checkbox';";
    expect(auditImports(base)).toEqual([]);
  });

  it('blocks @tech-inject catalogue internals', () => {
    base.dependencies = [];
    base.files['components/x/X.tsx'] = "import { Button } from '@tech-inject/ui';";
    const v = auditImports(base);
    expect(v.length).toBe(1);
    expect(v[0].reason).toMatch(/forbidden/);
  });

  it('blocks undeclared external imports', () => {
    base.dependencies = [];
    base.files['components/x/X.tsx'] = "import fs from 'node:fs';";
    const v = auditImports(base);
    expect(v.length).toBe(1);
    expect(v[0].reason).toMatch(/undeclared/);
  });
});

describe('safeJoin policies (answers #4)', () => {
  it('joins clean relative paths', () => {
    expect(registrySafeJoin('/proj', 'a/b.tsx')).toBe('/proj/a/b.tsx');
  });
  it('rejects traversal', () => {
    expect(() => registrySafeJoin('/proj', '../x.tsx')).toThrow();
  });
  it('rejects absolute and windows paths', () => {
    expect(() => registrySafeJoin('/proj', '/abs.tsx')).toThrow();
    expect(() => registrySafeJoin('/proj', 'C:\\x.tsx')).toThrow();
  });
});

// keep a reference so tree-shakers don't drop the label import
void FILES_KEY_LABEL;