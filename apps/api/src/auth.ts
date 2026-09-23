import { eq } from 'drizzle-orm';
import {
  customers,
  sessions,
  db,
  hashToken,
  verifyPassword,
  SESSION_TTL_MS,
  newSessionToken,
} from '@tech-inject/db';
import type { AuthUser, AdminInfo, SessionPrincipal } from '@tech-inject/registry';
import { config } from './env.js';

const ADMIN_KIND = 'admin';

export async function createCustomerSession(customerEmail: string): Promise<string> {
  return createSession('customer', customerEmail);
}

export async function createAdminSession(): Promise<string> {
  const cfg = config();
  return createSession(ADMIN_KIND, cfg.adminUsername);
}

export function passwordMatches(password: string, hash: string): boolean {
  return verifyPassword(password, hash);
}

export function sessionHash(token: string): string {
  return hashToken(token);
}

export const SESSION_TTL = SESSION_TTL_MS;

async function createSession(kind: string, principalId: string): Promise<string> {
  const { token, tokenHash } = newSessionToken();
  await db().insert(sessions).values({
    kind,
    principalId,
    tokenHash,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS),
  });
  return token;
}

export async function revokeSession(token: string): Promise<void> {
  await db().delete(sessions).where(eq(sessions.tokenHash, hashToken(token)));
}

/** Resolve a bearer token to a live (non-expired) principal. Re-reads the DB row each call. */
export async function resolveSession(token: string | undefined): Promise<SessionPrincipal | null> {
  if (!token) return null;
  const rows = await db().select().from(sessions).where(eq(sessions.tokenHash, hashToken(token))).limit(1);
  const row = rows[0];
  if (!row) return null;
  if (new Date(row.expiresAt).getTime() < Date.now()) {
    await revokeSession(token);
    return null;
  }
  if (row.kind === ADMIN_KIND) {
    const cfg = config();
    if (row.principalId !== cfg.adminUsername) return null;
    const info: AdminInfo = { username: cfg.adminUsername, role: 'admin' };
    return info;
  }
  const customersRows = await db()
    .select()
    .from(customers)
    .where(eq(customers.email, row.principalId))
    .limit(1);
  const customer = customersRows[0];
  if (!customer) return null;
  const user: AuthUser = {
    id: customer.id,
    email: customer.email,
    name: customer.name,
    isPremium: customer.isPremium,
    role: 'customer',
  };
  return user;
}

/** Live premium check — reads the customer row on every protected request. */
export function isPremiumSession(principal: SessionPrincipal | null): principal is AuthUser & { isPremium: true } {
  return principal !== null && principal.role === 'customer' && principal.isPremium;
}

export function isAdminSession(principal: SessionPrincipal | null): principal is AdminInfo {
  return principal !== null && principal.role === 'admin';
}