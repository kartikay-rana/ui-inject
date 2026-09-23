import Link from 'next/link';
import { apiBase, listComponents } from '../../lib/api';
import { CategoryGrid } from '../../components/ComponentGrid';

export const dynamic = 'force-dynamic';

export default async function ComponentsPage() {
  let items: Awaited<ReturnType<typeof listComponents>> = [];
  let error: string | null = null;
  try {
    items = await listComponents();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  return (
    <main className="min-h-screen" style={{ maxWidth: 1120, margin: '0 auto', padding: '2rem 1.5rem 5rem' }}>
      <header className="flex items-center justify-between" style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div className="font-semibold" style={{ fontSize: '1.3rem' }}>
            Tech Inject
          </div>
          <div className="muted" style={{ fontSize: '0.85rem', display: 'grid', placeItems: 'center', opacity: 0.6 }}>
            themed design library
          </div>
        </div>
        <nav className="flex items-center gap-3" style={{ fontSize: '0.9rem' }}>
          <Link href="/" style={{ opacity: 0.85 }}>
            Home
          </Link>
          <Link href="/get-started">Get Started</Link>
        </nav>
      </header>

      <section style={{ padding: '3rem 0 2rem' }}>
        <h1 style={{ fontSize: '1.9rem', margin: 0 }}>Components</h1>
        <p style={{ opacity: 0.75, maxWidth: 640, margin: '0.6rem 0 0' }}>
          Every snippet mirrors a cell of the reference Sales CRM screen. Premium components require a
          <code> TECH_INJECT_TOKEN</code> to preview and install.
        </p>
      </section>

      {error && (
        <div className="alert" style={{ border: '1px solid #7a1f1f', borderRadius: 8, padding: '0.9rem 1rem', color: '#ff9d9d' }}>
          Catalogue API unreachable: {error} (API={apiBase()}). Start it with <code>pnpm --filter @tech-inject/api dev</code>.
        </div>
      )}

      <CategoryGrid items={items} />
    </main>
  );
}