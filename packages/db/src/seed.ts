import 'dotenv/config';
import { createHash } from 'node:crypto';
import { componentDefinitions, buildBundle } from '@tech-inject/ui/registry';
import { eq } from 'drizzle-orm';
import { db } from './client.js';
import { customers, components } from './schema.js';
import { hashPassword } from './security.js';
import { fixtureCustomers, FIXTURE_PASSWORD } from './fixtures.js';

function contentHash(bundle: { slug: string; version: string; files: Record<string, string> }): string {
  const canonical = JSON.stringify({ slug: bundle.slug, version: bundle.version, files: bundle.files });
  return createHash('sha256').update(canonical).digest('hex');
}

async function seedCustomers() {
  for (const c of fixtureCustomers) {
    const existing = await db().select().from(customers).where(eq(customers.email, c.email)).limit(1);
    if (existing.length === 0) {
      await db().insert(customers).values({
        email: c.email,
        name: c.name,
        isPremium: c.isPremium,
        passwordHash: hashPassword(FIXTURE_PASSWORD),
      });
      console.log(`  + customer ${c.email} (${c.isPremium ? 'premium' : 'free'})`);
    } else {
      console.log(`  = customer ${c.email} already present`);
    }
  }
}

async function seedComponents() {
  for (const def of componentDefinitions) {
    const bundle = buildBundle(def);
    const hash = contentHash(bundle);
    const existing = await db()
      .select({ id: components.id, contentHash: components.contentHash })
      .from(components)
      .where(eq(components.slug, def.slug))
      .limit(1);
    if (existing.length > 0) {
      if (existing[0].contentHash === hash) {
        console.log(`  = component ${def.slug} up to date`);
        continue;
      }
      await db()
        .update(components)
        .set({ bundle, contentHash: hash, name: def.name, description: def.description, category: def.category, version: def.version, updatedAt: new Date() })
        .where(eq(components.slug, def.slug));
      console.log(`  ~ component ${def.slug} re-seeded`);
      continue;
    }
    await db().insert(components).values({
      slug: def.slug,
      name: def.name,
      description: def.description,
      category: def.category,
      version: def.version,
      accessLevel: def.accessLevel,
      status: 'published',
      bundle,
      contentHash: hash,
    });
    console.log(`  + component ${def.slug} (${def.accessLevel})`);
  }
}

async function main() {
  console.log('Seeding Tech Inject database…');
  await seedCustomers();
  await seedComponents();
  console.log('Done.');
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  });