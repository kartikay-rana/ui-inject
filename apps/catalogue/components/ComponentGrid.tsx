import Link from 'next/link';
import type { ComponentMeta } from '../lib/api';

const CATEGORY_LABELS: Record<string, string> = {
  action: 'Actions',
  content: 'Content',
  input: 'Inputs',
  navigation: 'Navigation',
  feedback: 'Feedback',
  layout: 'Layout',
  data: 'Data display',
};

export function CategoryGrid({ items }: { items: ComponentMeta[] }) {
  const categories = [...new Set(items.map((i) => i.category))];

  return (
    <div className="flex flex-col gap-6">
      {categories.map((cat) => {
        const comps = items.filter((i) => i.category === cat);
        return (
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
                  <p style={{ margin: '0.45rem 0 0', fontSize: '0.83rem', lineHeight: 1.45, opacity: 0.72 }}>{item.description}</p>
                </Link>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export { CATEGORY_LABELS };