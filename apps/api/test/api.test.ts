import 'dotenv/config';
import { beforeAll, describe, expect, it } from 'vitest';
import { app } from '../src/app.js';
import type { ComponentMeta } from '../src/store.js';
import { fixtureFreeCustomer, fixturePremiumCustomer, FIXTURE_PASSWORD } from '@tech-inject/db';

let published: ComponentMeta[];
let freeToken: string;
let premiumToken: string;

async function json<T>(res: Response): Promise<T> {
  return (await res.json()) as T;
}

beforeAll(async () => {
  const free = fixtureFreeCustomer();
  const premium = fixturePremiumCustomer();
  const list = await app.request('/api/v1/components');
  published = (await json<{ items: ComponentMeta[] }>(list)).items;
  const freeLogin = await app.request('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: free.email, password: FIXTURE_PASSWORD }),
  });
  freeToken = (await json<{ token: string }>(freeLogin)).token;
  const premiumLogin = await app.request('/api/v1/auth/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: premium.email, password: FIXTURE_PASSWORD }),
  });
  premiumToken = (await json<{ token: string }>(premiumLogin)).token;
});

describe('catalogue API (answers #1/#6)', () => {
  it('lists published components, both tiers', () => {
    const tiers = new Set<string>(published.map((c) => c.accessLevel));
    expect(tiers).toContain('free');
    expect(tiers).toContain('premium');
    expect(published.length).toBeGreaterThan(0);
  });

  it('rejects unknown slugs', async () => {
    expect((await app.request('/api/v1/components/does-not-exist')).status).toBe(404);
  });

  it('serves free previews without auth', async () => {
    const free = published.find((c) => c.accessLevel === 'free');
    const res = await app.request(`/api/v1/components/${free!.slug}/preview`);
    expect(res.status).toBe(200);
    const body = await json<{ html: string }>(res);
    expect(body.html).toContain('<div id="root"></div>');
  });

  it('gates premium previews without a session', async () => {
    const prem = published.find((c) => c.accessLevel === 'premium');
    expect((await app.request(`/api/v1/components/${prem!.slug}/preview`)).status).toBe(403);
  });

  it('allows premium previews for premium sessions', async () => {
    const prem = published.find((c) => c.accessLevel === 'premium');
    const res = await app.request(`/api/v1/components/${prem!.slug}/preview`, {
      headers: { authorization: `Bearer ${premiumToken}` },
    });
    expect(res.status).toBe(200);
  });

  it('serves free source without auth', async () => {
    const free = published.find((c) => c.accessLevel === 'free');
    const res = await app.request(`/api/v1/components/${free!.slug}/source`);
    expect(res.status).toBe(200);
    const body = await json<{ files: Record<string, string> }>(res);
    expect(Object.keys(body.files).length).toBeGreaterThan(0);
  });

  it('gates premium source for free sessions', async () => {
    const prem = published.find((c) => c.accessLevel === 'premium');
    const res = await app.request(`/api/v1/components/${prem!.slug}/source`, {
      headers: { authorization: `Bearer ${freeToken}` },
    });
    expect(res.status).toBe(403);
    const premSrc = await app.request(`/api/v1/components/${prem!.slug}/source`, {
      headers: { authorization: `Bearer ${premiumToken}` },
    });
    expect(premSrc.status).toBe(200);
  });

  it('emits an agent prompt', async () => {
    const free = published.find((c) => c.accessLevel === 'free');
    const res = await app.request(`/api/v1/components/${free!.slug}/agent-prompt`);
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain('add '); 
  });

  it('returns installer manifests', async () => {
    const free = published.find((c) => c.accessLevel === 'free');
    const res = await app.request(`/api/v1/components/${free!.slug}/install`);
    expect(res.status).toBe(200);
    const body = await json<{ installCommand: string; component: { slug: string } }>(res);
    expect(body.installCommand).toContain('ui-injector');
    expect(body.component.slug).toBe(free!.slug);
  });
});

describe('auth + admin (answers #6/#7)', () => {
  it('rejects invalid credentials', async () => {
    const free = fixtureFreeCustomer();
    const res = await app.request('/api/v1/auth/login', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: free.email, password: 'wrong' }),
    });
    expect(res.status).toBe(401);
  });

  it('reports the current session', async () => {
    const res = await app.request('/api/v1/auth/me', {
      headers: { authorization: `Bearer ${premiumToken}` },
    });
    expect(res.status).toBe(200);
    const body = await json<{ user: { isPremium: boolean; role: string } }>(res);
    expect(body.user.isPremium).toBe(true);
    expect(body.user.role).toBe('customer');
  });

  it('requires admin auth', async () => {
    expect((await app.request('/api/v1/admin/components')).status).toBe(401);
  });
});