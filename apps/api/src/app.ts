import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { cors } from 'hono/cors';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { components, customers, auditEvents, db } from '@tech-inject/db';
import {
  componentBundleSchema,
  draftUpdateSchema,
  loginSchema,
  adminLoginSchema,
  premiumGrantSchema,
  auditImports,
  buildAgentPrompt,
  type ComponentBundle,
} from '@tech-inject/registry';
import {
  createCustomerSession,
  createAdminSession,
  passwordMatches,
  resolveSession,
  revokeSession,
  isPremiumSession,
} from './auth.js';
import { listPublished, getComponent, listAllForAdmin, listCustomers } from './store.js';
import { compilePreview } from './preview.js';
import { config } from './env.js';

export const app = new Hono();
app.use('*', cors());

/**
 * Surface failures as JSON (instead of Vercel's generic
 * FUNCTION_INVOCATION_FAILED) so a misconfigured env is diagnosable in logs.
 */
app.onError((err, c) => {
  console.error('[api] error:', err);
  if (err instanceof HTTPException) {
    return c.json({ error: err.message }, err.status);
  }
  return c.json({ error: String(err?.message ?? err) }, 500);
});

/** Zero-config Vercel Hono entry (framework preset default-export detection). */
export default app;

function bearer(c: Context): string | undefined {
  const h = c.req.header('authorization');
  if (!h || !h.startsWith('Bearer ')) return undefined;
  return h.slice(7);
}

function apiError(message: string, status: ContentfulStatusCode = 400): never {
  throw new HTTPException(status, { message });
}

function flatten(zodErr: z.ZodError): string {
  const fieldMessages = zodErr.issues.map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`);
  return fieldMessages.join('\n') || 'invalid payload';
}

async function readBundle(c: Context): Promise<ComponentBundle> {
  const raw = await c.req.json();
  const parsed = componentBundleSchema.safeParse(raw);
  if (!parsed.success) apiError(`Validation failed:\n${flatten(parsed.error)}`, 422);
  const violations = auditImports(parsed.data);
  if (violations.length) {
    apiError(`Import audit blocked:\n${violations.map((v) => `  ${v.file}: ${v.reason}`).join('\n')}`, 422);
  }
  return parsed.data;
}

function contentHash(bundle: ComponentBundle): string {
  return JSON.stringify(bundle);
}

async function audit(actor: string, action: string, detail: Record<string, unknown>): Promise<void> {
  await db().insert(auditEvents).values({ actor, action, detail });
}

// ------------------------------------------------------------------ public

app.get('/api/v1/components', async (c) => {
  c.header('cache-control', 'no-store');
  return c.json({ items: await listPublished() });
});

app.get('/api/v1/components/:slug', async (c) => {
  const slug = c.req.param('slug');
  const row = await getComponent(slug);
  if (!row || row.status !== 'published') apiError('Component not found', 404);
  return c.json({ item: row });
});

app.get('/api/v1/components/:slug/preview', async (c) => {
  const slug = c.req.param('slug');
  const row = await getComponent(slug);
  if (!row || row.status !== 'published') apiError('Component not found', 404);
  const session = await resolveSession(bearer(c));
  if (row.accessLevel === 'premium' && !isPremiumSession(session)) {
    apiError('Premium access required for this component', 403);
  }
  const html = await compilePreview(row);
  return c.json({ html, contentHash: row.contentHash });
});

app.get('/api/v1/components/:slug/source', async (c) => {
  const slug = c.req.param('slug');
  const row = await getComponent(slug);
  if (!row || row.status !== 'published') apiError('Component not found', 404);
  const session = await resolveSession(bearer(c));
  if (row.accessLevel === 'premium' && !isPremiumSession(session)) {
    apiError('Premium access required for this component', 403);
  }
  return c.json({
    component: { slug: row.slug, name: row.name, version: row.version, accessLevel: row.accessLevel, dependencies: row.dependencies },
    files: row.files,
    usage: row.usage,
    contentHash: row.contentHash,
  });
});

app.get('/api/v1/components/:slug/agent-prompt', async (c) => {
  const slug = c.req.param('slug');
  const row = await getComponent(slug);
  if (!row || row.status !== 'published') apiError('Component not found', 404);
  const session = await resolveSession(bearer(c));
  if (row.accessLevel === 'premium' && !isPremiumSession(session)) {
    apiError('Premium access required for this component', 403);
  }
  return c.text(
    buildAgentPrompt(row, {
      registryUrl: config().apiBaseUrl,
      installCommand: `npx @kartikay-rana/techinject-cli@latest add ${row.slug}`,
    })
  );
});

app.get('/api/v1/components/:slug/install', async (c) => {
  const slug = c.req.param('slug');
  const row = await getComponent(slug);
  if (!row || row.status !== 'published') apiError('Component not found', 404);
  const session = await resolveSession(bearer(c));
  if (row.accessLevel === 'premium' && !isPremiumSession(session)) {
    apiError('Premium access required for this component', 403);
  }
  return c.json({
    component: {
      slug: row.slug,
      name: row.name,
      version: row.version,
      accessLevel: row.accessLevel,
      registryUrl: config().apiBaseUrl,
    },
    steps: [
      `npx @kartikay-rana/techinject-cli@latest add ${row.slug}`,
      row.dependencies.length ? `pnpm add ${row.dependencies.join(' ')}` : 'no extra dependencies required',
      `themes via @tech-inject/theme (design tokens)`,
    ],
    installCommand: `npx @kartikay-rana/techinject-cli@latest add ${row.slug}`,
  });
});

// -------------------------------------------------------------------- auth

app.post('/api/v1/auth/login', async (c) => {
  const body = loginSchema.safeParse(await c.req.json());
  if (!body.success) apiError('Invalid login payload', 422);
  const row = (await db().select().from(customers).where(eq(customers.email, body.data.email)).limit(1))[0];
  if (!row || !passwordMatches(body.data.password, row.passwordHash)) {
    apiError('Invalid credentials', 401);
  }
  const token = await createCustomerSession(row.email);
  await audit('system', 'customer_login', { email: row.email });
  return c.json({
    token,
    user: { id: row.id, email: row.email, name: row.name, isPremium: row.isPremium, role: 'customer' },
  });
});

app.post('/api/v1/auth/logout', async (c) => {
  const token = bearer(c);
  if (token) await revokeSession(token);
  return c.json({ ok: true });
});

app.get('/api/v1/auth/me', async (c) => {
  const session = await resolveSession(bearer(c));
  if (!session) apiError('Not authenticated', 401);
  return c.json({ user: session });
});

// ------------------------------------------------------------------- admin

async function requireAdminSession(c: Context) {
  const session = await resolveSession(bearer(c));
  if (!session || session.role !== 'admin') {
    apiError('Admin authentication required', 401);
  }
  return session;
}

app.post('/api/v1/admin/login', async (c) => {
  const body = adminLoginSchema.safeParse(await c.req.json());
  if (!body.success) apiError('Invalid payload', 422);
  const cfg = config();
  if (body.data.username !== cfg.adminUsername || body.data.password !== cfg.adminPassword) {
    apiError('Invalid admin credentials', 401);
  }
  const token = await createAdminSession();
  return c.json({ token, user: { username: cfg.adminUsername, role: 'admin' } });
});

app.get('/api/v1/admin/components', async (c) => {
  await requireAdminSession(c);
  return c.json({ items: await listAllForAdmin() });
});

app.post('/api/v1/admin/components', async (c) => {
  const admin = await requireAdminSession(c);
  const bundle = await readBundle(c);
  const existing = (await db().select().from(components).where(eq(components.slug, bundle.slug)).limit(1))[0];
  if (existing) apiError('Component slug already exists', 409);
  await db()
    .insert(components)
    .values({
      slug: bundle.slug,
      name: bundle.name,
      description: bundle.description,
      category: bundle.category,
      version: bundle.version,
      accessLevel: bundle.accessLevel,
      status: 'draft',
      bundle,
      contentHash: contentHash(bundle),
    });
  await audit(admin.username, 'create', { slug: bundle.slug });
  const created = (await db().select().from(components).where(eq(components.slug, bundle.slug)).limit(1))[0];
  return c.json({ item: created }, 201);
});

app.put('/api/v1/admin/components/:slug', async (c) => {
  const admin = await requireAdminSession(c);
  const slug = c.req.param('slug');
  const raw = await c.req.json();
  const parsed = draftUpdateSchema.safeParse(raw);
  if (!parsed.success) apiError(`Validation failed:\n${flatten(parsed.error)}`, 422);
  const existing = (await db().select().from(components).where(eq(components.slug, slug)).limit(1))[0];
  if (!existing) apiError('Component not found', 404);
  const merged: ComponentBundle = { ...(existing.bundle as ComponentBundle), ...parsed.data, slug };
  const violations = auditImports(merged);
  if (violations.length) {
    apiError(`Import audit blocked:\n${violations.map((v) => `  ${v.file}: ${v.reason}`).join('\n')}`, 422);
  }
  await db()
    .update(components)
    .set({ bundle: merged, contentHash: contentHash(merged), updatedAt: new Date() })
    .where(eq(components.slug, slug));
  await audit(admin.username, 'update', { slug });
  const updated = (await db().select().from(components).where(eq(components.slug, slug)).limit(1))[0];
  return c.json({ item: updated });
});

app.post('/api/v1/admin/components/validate', async (c) => {
  await requireAdminSession(c);
  const raw = await c.req.json();
  const parsed = componentBundleSchema.safeParse(raw);
  const violations = parsed.success ? auditImports(parsed.data) : [];
  return c.json({
    ok: parsed.success && violations.length === 0,
    errors: parsed.success ? violations.map((v) => `${v.file}: ${v.reason}`) : [flatten(parsed.error)],
    parsed: parsed.success,
  });
});

app.post('/api/v1/admin/components/:slug/publish', async (c) => {
  const admin = await requireAdminSession(c);
  const slug = c.req.param('slug');
  const existing = (await db().select().from(components).where(eq(components.slug, slug)).limit(1))[0];
  if (!existing) apiError('Component not found', 404);
  await db().update(components).set({ status: 'published', publishedAt: new Date() }).where(eq(components.slug, slug));
  await audit(admin.username, 'publish', { slug });
  return c.json({ ok: true });
});

app.post('/api/v1/admin/components/:slug/unpublish', async (c) => {
  const admin = await requireAdminSession(c);
  const slug = c.req.param('slug');
  const existing = (await db().select().from(components).where(eq(components.slug, slug)).limit(1))[0];
  if (!existing) apiError('Component not found', 404);
  await db().update(components).set({ status: 'draft', publishedAt: null }).where(eq(components.slug, slug));
  await audit(admin.username, 'unpublish', { slug });
  return c.json({ ok: true });
});

app.get('/api/v1/admin/customers', async (c) => {
  await requireAdminSession(c);
  return c.json({ items: await listCustomers() });
});

app.post('/api/v1/admin/customers/:id/premium', async (c) => {
  const admin = await requireAdminSession(c);
  const body = premiumGrantSchema.safeParse(await c.req.json());
  if (!body.success) apiError('premium must be a boolean', 422);
  const id = c.req.param('id');
  const cust = (await db().select().from(customers).where(eq(customers.id, id)).limit(1))[0];
  if (!cust) apiError('Customer not found', 404);
  await db().update(customers).set({ isPremium: body.data.premium }).where(eq(customers.id, id));
  await audit(admin.username, body.data.premium ? 'grant' : 'revoke', { customerEmail: cust.email });
  return c.json({ ok: true, email: cust.email, isPremium: body.data.premium });
});

app.get('/api/v1/admin/audit', async (c) => {
  await requireAdminSession(c);
  const rows = await db().select().from(auditEvents);
  return c.json({ items: rows });
});

import type { Context } from 'hono';