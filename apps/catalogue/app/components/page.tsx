import Link from 'next/link';
import { apiBase, listComponents } from '../../lib/api';
import { FALLBACK_COMPONENTS } from '../../lib/fallback';
import { CategoryGrid } from '../../components/ComponentGrid';

export const dynamic = 'force-dynamic';

export default async function ComponentsPage() {
  let items: Awaited<ReturnType<typeof listComponents>> = [];
  let error: string | null = null;
  try {
    items = await listComponents();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
    items = FALLBACK_COMPONENTS;
  }

  if (!items || items.length === 0) {
    items = FALLBACK_COMPONENTS;
  }

  return (
    <main className="page-container min-h-screen">
      <header className="site-header">
        <Link href="/" className="brand-wrapper">
          <div className="brand-logo">⚡</div>
          <div className="flex flex-col">
            <span className="brand-text">Tech Inject</span>
          </div>
          <span className="brand-subchip">Themed Design Library</span>
        </Link>
        <nav className="nav-links">
          <Link href="/" className="nav-link">
            Home
          </Link>
          <Link href="/components" className="nav-link active">
            Components
          </Link>
          <Link href="/get-started" className="nav-link">
            Get Started
          </Link>
          <a
            href="http://localhost:3011"
            target="_blank"
            rel="noreferrer"
            className="nav-link"
            style={{ opacity: 0.8 }}
          >
            Admin ↗
          </a>
        </nav>
      </header>

      <section style={{ padding: '2.5rem 0 1.5rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, margin: 0, letterSpacing: '-0.02em' }}>
          Components
        </h1>
        <p style={{ opacity: 0.75, maxWidth: 640, margin: '0.6rem 0 0', fontSize: '0.95rem', lineHeight: 1.6 }}>
          Every snippet mirrors a cell of the reference Sales CRM screen. Premium components require a{' '}
          <code>TECH_INJECT_TOKEN</code> to preview and install.
        </p>
      </section>

      {error && (
        <div
          className="alert"
          style={{
            border: '1px solid rgba(251, 191, 36, 0.3)',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            color: '#fbbf24',
            background: 'rgba(251, 191, 36, 0.08)',
            marginBottom: '1.5rem',
            fontSize: '0.85rem',
          }}
        >
          API offline at <code>{apiBase()}</code>. Serving built-in library snapshot. Start API with{' '}
          <code>pnpm dev</code> for live updates.
        </div>
      )}

      <CategoryGrid items={items} />
    </main>
  );
}