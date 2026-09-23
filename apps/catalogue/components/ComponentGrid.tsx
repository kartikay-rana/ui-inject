'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import type { ComponentMeta } from '../lib/api';

const CATEGORY_LABELS: Record<string, string> = {
  action: 'Actions',
  content: 'Content',
  form: 'Form',
  input: 'Inputs',
  navigation: 'Navigation',
  feedback: 'Feedback',
  layout: 'Layout',
  'data-display': 'Data display',
  data: 'Data display',
};

export function CategoryGrid({ items }: { items: ComponentMeta[] }) {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | 'free' | 'premium'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => {
    return Array.from(new Set(items.map((i) => i.category))).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesSearch =
        search === '' ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase()) ||
        item.slug.toLowerCase().includes(search.toLowerCase());

      const matchesTier =
        tierFilter === 'all' || item.accessLevel === tierFilter;

      const matchesCategory =
        categoryFilter === 'all' || item.category === categoryFilter;

      return matchesSearch && matchesTier && matchesCategory;
    });
  }, [items, search, tierFilter, categoryFilter]);

  const freeCount = items.filter((i) => i.accessLevel === 'free').length;
  const premiumCount = items.filter((i) => i.accessLevel === 'premium').length;

  // Group filtered items by category if no specific category is selected
  const displayedCategories = useMemo(() => {
    if (categoryFilter !== 'all') {
      return [categoryFilter];
    }
    return Array.from(new Set(filteredItems.map((i) => i.category))).sort();
  }, [filteredItems, categoryFilter]);

  function clearFilters() {
    setSearch('');
    setTierFilter('all');
    setCategoryFilter('all');
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Filter Toolbar */}
      <div className="toolbar-section">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            className="search-input"
            placeholder="Search 12 components (e.g. Button, Table, Tabs)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="filter-pills-group">
          <button
            className={`filter-btn ${tierFilter === 'all' ? 'active' : ''}`}
            onClick={() => setTierFilter('all')}
          >
            All ({items.length})
          </button>
          <button
            className={`filter-btn ${tierFilter === 'free' ? 'active' : ''}`}
            onClick={() => setTierFilter('free')}
          >
            Free ({freeCount})
          </button>
          <button
            className={`filter-btn ${tierFilter === 'premium' ? 'active' : ''}`}
            onClick={() => setTierFilter('premium')}
          >
            Premium ({premiumCount})
          </button>
        </div>
      </div>

      {/* Category Pills (Secondary row) */}
      <div className="filter-pills-group" style={{ marginTop: '-0.75rem', marginBottom: '0.5rem' }}>
        <button
          className={`filter-btn ${categoryFilter === 'all' ? 'active' : ''}`}
          onClick={() => setCategoryFilter('all')}
        >
          All Categories
        </button>
        {categories.map((cat) => {
          const count = items.filter((i) => i.category === cat).length;
          return (
            <button
              key={cat}
              className={`filter-btn ${categoryFilter === cat ? 'active' : ''}`}
              onClick={() => setCategoryFilter(cat)}
            >
              {CATEGORY_LABELS[cat] ?? cat} ({count})
            </button>
          );
        })}
      </div>

      {/* Zero State */}
      {filteredItems.length === 0 && (
        <div className="empty-state">
          <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔎</div>
          <div className="empty-state-title">No components found</div>
          <div className="empty-state-text">
            No components matched &ldquo;{search}&rdquo; with the selected filters.
          </div>
          <button className="filter-btn active" onClick={clearFilters}>
            Clear all filters
          </button>
        </div>
      )}

      {/* Categorized Component Grid */}
      {displayedCategories.map((cat) => {
        const comps = filteredItems.filter((i) => i.category === cat);
        if (comps.length === 0) return null;

        return (
          <section key={cat} style={{ marginBottom: '1rem' }}>
            <div className="category-heading">
              <h2 className="category-title">
                {CATEGORY_LABELS[cat] ?? cat}
              </h2>
              <span className="category-count">
                {comps.length} {comps.length === 1 ? 'component' : 'components'}
              </span>
            </div>

            <div className="comp-grid">
              {comps.map((item) => (
                <Link
                  key={item.slug}
                  href={`/components/${item.slug}`}
                  className="comp-card"
                >
                  <div>
                    <div className="comp-card-header">
                      <span className="comp-card-name">{item.name}</span>
                      {item.accessLevel === 'premium' ? (
                        <span className="badge badge-premium">
                          <span className="badge-dot" />
                          PREMIUM
                        </span>
                      ) : (
                        <span className="badge badge-free">
                          <span className="badge-dot" />
                          FREE
                        </span>
                      )}
                    </div>
                    <p className="comp-card-desc">{item.description}</p>
                  </div>

                  <div className="comp-card-footer">
                    <span>
                      <code>{item.slug}</code> • v{item.version}
                    </span>
                    <span className="comp-card-action">
                      View <span>→</span>
                    </span>
                  </div>
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