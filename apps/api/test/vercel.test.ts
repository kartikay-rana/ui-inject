import 'dotenv/config';
import { describe, expect, it } from 'vitest';
import handler from '../src/vercel.js';
import { fixturePremiumCustomer, FIXTURE_PASSWORD } from '@tech-inject/db';

const ORIGIN = 'https://tech-inject-api.example.com';

describe('Vercel serverless entry (src/vercel.ts)', () => {
  it('serves the public list through hono/vercel', async () => {
    const res = await handler(new Request(`${ORIGIN}/api/v1/components`));
    expect(res.status).toBe(200);
    const body = (await res.json()) as { items: Array<{ accessLevel: string }> };
    expect(body.items.length).toBeGreaterThanOrEqual(12);
    expect(body.items.some((i) => i.accessLevel === 'premium')).toBe(true);
  });

  it('keeps admin endpoints gated (401 signed out)', async () => {
    const res = await handler(new Request(`${ORIGIN}/api/v1/admin/components`));
    expect(res.status).toBe(401);
  });

  it('keeps premium previews gated without a token (403 signed out)', async () => {
    const res = await handler(new Request(`${ORIGIN}/api/v1/components/table/preview`));
    expect(res.status).toBe(403);
  });

  it('compiles a premium preview through the serverless entry (200)', async () => {
    const premium = fixturePremiumCustomer();
    const login = await handler(
      new Request(`${ORIGIN}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: premium.email, password: FIXTURE_PASSWORD }),
      })
    );
    expect(login.status).toBe(200);
    const { token } = (await login.json()) as { token: string };

    const res = await handler(
      new Request(`${ORIGIN}/api/v1/components/table/preview`, {
        headers: { authorization: `Bearer ${token}` },
      })
    );
    expect(res.status).toBe(200);
    const body = (await res.json()) as { html: string };
    expect(body.html).toContain('<!doctype html>');
  });
});