import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getComponent } from '../../../lib/api';
import { PreviewPanel } from '../../../components/PreviewPanel';
import { CodePanel } from '../../../components/CodePanel';

export const dynamic = 'force-dynamic';

export default async function ComponentPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let item;
  try {
    item = await getComponent(slug);
  } catch {
    notFound();
  }

  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '1.5rem 1.5rem 5rem' }}>
      <div style={{ fontSize: '0.85rem', marginBottom: '1.2rem' }}>
        <Link href="/" style={{ opacity: 0.6 }}>
          ← Back
        </Link>
      </div>

      <header className="flex items-start justify-between gap-4" style={{ paddingBottom: '1.5rem', borderBottom: '1px solid var(--border)' }}>
        <div>
          <div className="flex items-center gap-2">
            <h1 style={{ margin: 0, fontSize: '1.9rem' }}>{item.name}</h1>
            {item.accessLevel === 'premium' ? (
              <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: 999, border: '1px solid #8a6d00', color: '#e5c23f' }}>PREMIUM</span>
            ) : (
              <span style={{ fontSize: '0.7rem', padding: '0.25rem 0.6rem', borderRadius: 999, border: '1px solid #2a5640', color: '#6fd08c' }}>FREE</span>
            )}
          </div>
          <p style={{ opacity: 0.75, maxWidth: 640, margin: '0.6rem 0 0' }}>{item.description}</p>
        </div>
        <code style={{ opacity: 0.5, fontSize: '0.8rem', whiteSpace: 'nowrap' }}>v{item.version}</code>
      </header>

      <div style={{ display: 'grid', gap: '1.5rem', marginTop: '1.5rem' }}>
        <PreviewPanel slug={item.slug} accessLevel={item.accessLevel} />
        <CodePanel slug={item.slug} accessLevel={item.accessLevel} />

        <div style={{ border: '1px solid var(--border)', borderRadius: '0.5rem', padding: '1rem 1.2rem' }}>
          <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem' }}>Install</h3>
          <p style={{ margin: '0 0 0.7rem', opacity: 0.7, fontSize: '0.88rem' }}>
            Runs on your own host so you own the code. Premium components need <code>TECH_INJECT_TOKEN</code>.
          </p>
          <pre
            style={{
              margin: 0,
              padding: '0.8rem 1rem',
              borderRadius: 8,
              background: '#0d0d0d',
              border: '1px solid var(--border)',
              fontSize: '0.85rem',
              overflow: 'auto',
            }}
          >
{`npx @kartikay-rana/techinject-cli@latest add ${item.slug}`}
          </pre>
        </div>
      </div>
    </main>
  );
}