/**
 * Review fixtures — the free + premium customer accounts created by `db:seed`.
 *
 * These are demo accounts for the reviewer and are deliberately NOT printed in
 * the README or any frontend bundle (Assignment §9: credentials are shared via
 * the interview channel). `SEED_FIXTURE_PASSWORD` overrides the default if the
 * operator wants a private value before seeding.
 */

export interface FixtureCustomer {
  email: string;
  name: string;
  isPremium: boolean;
}

export const FIXTURE_PASSWORD = process.env.SEED_FIXTURE_PASSWORD ?? 'password123';

export const fixtureCustomers: FixtureCustomer[] = [
  { email: 'demo@techinject.dev', name: 'Demo User', isPremium: false },
  { email: 'premium@techinject.dev', name: 'Premium User', isPremium: true },
];

/** Seed-only helpers reused by the CLI verify harness. */
export function fixturePassword(): string {
  return FIXTURE_PASSWORD;
}

export function fixtureFreeCustomer(): FixtureCustomer {
  return fixtureCustomers[0];
}

export function fixturePremiumCustomer(): FixtureCustomer {
  return fixtureCustomers[1];
}