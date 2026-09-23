import Link from 'next/link';
import { apiBase, listComponents } from '../lib/api';
import { FALLBACK_COMPONENTS } from '../lib/fallback';
import { CategoryGrid } from '../components/ComponentGrid';

export const dynamic = 'force-dynamic';

export default async function Home() {
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

  const freeCount = items.filter((i) => i.accessLevel === 'free').length;
  const premiumCount = items.filter((i) => i.accessLevel === 'premium').length;

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

      <section className="hero-section">
        <div className="hero-badge">
          <span className="hero-badge-dot" />
          <span>Sales CRM Design System Reference</span>
        </div>
        <h1 className="hero-title">
          A themed component library for the Sales CRM interface.
        </h1>
        <p className="hero-subtitle">
          Production-ready React &amp; TypeScript components extracted directly from the
          Sales CRM interface. {freeCount || 7} components are free forever; CRM-specific
          composites unlock with a premium account. Every component ships with live sandbox
          previews, copy-ready source code, and AI-agent prompts.
        </p>

        <div className="stats-bar">
          <div className="stat-pill">
            📦 <strong>{items.length}</strong> Components
          </div>
          <div className="stat-pill">
            ✨ <strong>{freeCount}</strong> Free Forever
          </div>
          <div className="stat-pill">
            💎 <strong>{premiumCount}</strong> Premium Composites
          </div>
          <div className="stat-pill">
            ⚡ <strong>100%</strong> Zero Runtime Lock-in
          </div>
        </div>
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
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>
            API offline at <code>{apiBase()}</code>. Serving built-in library snapshot. Start API with{' '}
            <code>pnpm dev</code> for live updates.
          </span>
        </div>
      )}

      <CategoryGrid items={items} />
    </main>
  );
}