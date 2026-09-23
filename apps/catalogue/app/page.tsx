import Link from 'next/link';
import { listComponents } from '../lib/api';

export const dynamic = 'force-dynamic';

const CATEGORY_LABELS: Record<string, string> = {
  action: 'Actions',
  content: 'Content',
  input: 'Inputs',
  navigation: 'Navigation',
  feedback: 'Feedback',
  layout: 'Layout',
  data: 'Data display',
};

export default async function Home() {
  let items: Awaited<ReturnType<typeof listComponents>> = [];
  let error: string | null = null;
  try {
    items = await listComponents();
  } catch (e) {
    error = e instanceof Error ? e.message : String(e);
  }

  const categories = [...new Set(items.map((i) => i.category))];
  const byCategory = Object.fromEntries(categories.map((c) => [c, items.filter((i) => i.category === c)]));

  const freeCount = items.filter((i) => i.accessLevel === 'free').length;

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
          <Link href="/components">Components</Link>
          <Link href="/get-started">Get Started</Link>
        </nav>
      </header>

      <section style={{ padding: '4rem 0 2.5rem', maxWidth: 680 }}>
        <h1 style={{ fontSize: '2.4rem', lineHeight: 1.15, margin: 0 }}>
          A themed component library for the Sales CRM interface.
        </h1>
        <p style={{ opacity: 0.75, marginTop: '0.9rem', fontSize: '1.05rem' }}>
          {freeCount} components are free forever; the rest unlock with a premium account. Every component ships with a live
          preview, copy-able source and an AI-agent prompt.
        </p>
      </section>

      {error && (
        <div className="alert" style={{ border: '1px solid #7a1f1f', borderRadius: 8, padding: '0.9rem 1rem', color: '#ff9d9d' }}>
          Catalogue API unreachable: {error}. Start it with <code>pnpm --filter @tech-inject/api dev</code>.
        </div>
      )}

      <div className="flex flex-col gap-6">
        {Object.entries(byCategory).map(([cat, comps]) => (
          <section key={cat}>
            <h2 className="muted" style={{ fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.09em' }}>
              {CATEGORY_LABELS[cat] ?? cat}
            </h2>
            <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
              {comps.map((item) => (
                <Link
                  key={item.slug}
                  href={`/components/${item.slug}`}
                  className="block"
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: '0.5rem',
                    padding: '1rem 1.1rem',
                    background: '#1b1b1b',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{item.name}</span>
                    {item.accessLevel === 'premium' ? (
                      <span style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: 999, border: '1px solid #8a6d00', color: '#e5c23f' }}>
                        PREMIUM
                      </span>
                    ) : (
                      <span style={{ fontSize: '0.68rem', padding: '0.2rem 0.5rem', borderRadius: 999, border: '1px solid #2a5640', color: '#6fd08c' }}>
                        FREE
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}