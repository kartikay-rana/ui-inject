import { desc, eq } from 'drizzle-orm';
import { components, customers, db } from '@tech-inject/db';
import type { ComponentRecord, Customer, PublicComponentView } from '@tech-inject/registry';

type ComponentRow = typeof components.$inferSelect;

/** Widen a DB row (bundle nested) into the flat ComponentRecord shape. */
export function rowToRecord(r: ComponentRow): ComponentRecord {
  const b = r.bundle as Record<string, unknown>;
  return {
    ...b,
    id: r.id,
    status: r.status,
    contentHash: r.contentHash,
    thumbnail: r.thumbnail ?? undefined,
    createdAt: r.createdAt.toISOString(),
    updatedAt: r.updatedAt.toISOString(),
    publishedAt: r.publishedAt ? r.publishedAt.toISOString() : null,
  } as ComponentRecord;
}

export function toPublicView(rec: ComponentRecord): PublicComponentView {
  return {
    slug: rec.slug,
    name: rec.name,
    description: rec.description,
    category: rec.category,
    version: rec.version,
    accessLevel: rec.accessLevel,
    status: rec.status,
    thumbnail: rec.thumbnail,
    publishedAt: rec.publishedAt,
  };
}

/** Published components only — premium rows never carry source in this list. */
export async function listPublished(): Promise<PublicComponentView[]> {
  const rows = await db().select().from(components).where(eq(components.status, 'published')).orderBy(desc(components.publishedAt));
  return rows.map((r) => toPublicView(rowToRecord(r)));
}

export async function getComponent(slug: string): Promise<ComponentRecord | undefined> {
  const rows = await db().select().from(components).where(eq(components.slug, slug)).limit(1);
  return rows[0] ? rowToRecord(rows[0]) : undefined;
}

export async function listAllForAdmin(): Promise<ComponentRecord[]> {
  const rows = await db().select().from(components).orderBy(desc(components.updatedAt));
  return rows.map(rowToRecord);
}

export async function listCustomers(): Promise<Customer[]> {
  const rows = await db().select().from(customers);
  return rows.map((c) => ({
    id: String(c.id),
    email: c.email,
    name: c.name,
    isPremium: c.isPremium,
    createdAt: c.createdAt.toISOString(),
  }));
}