'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, type AdminComponent, type AdminCustomer, type AuditEvent } from '../lib/api';

const TOKEN_KEY = 'techinject_admin_token';

type Tab = 'components' | 'customers' | 'audit' | 'publish';

const SAMPLE_BUTTON_JSON = JSON.stringify(
  {
    slug: 'badge',
    name: 'Badge',
    description: 'Status indicator badge for categorizing items.',
    category: 'feedback',
    version: '1.0.0',
    accessLevel: 'free',
    dependencies: [],
    files: {
      'components/badge/Badge.tsx': 'export function Badge({ children }: { children: React.ReactNode }) { return <span className="ti-badge">{children}</span>; }',
      'components/badge/Badge.css': '.ti-badge { display: inline-flex; padding: 2px 8px; border-radius: 999px; }',
    },
    preview: {
      story: 'components/badge/Badge.story.tsx',
      sample: {},
    },
    props: {},
    usage: '<Badge>Active</Badge>',
  },
  null,
  2
);

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<string>('');
  const [login, setLogin] = useState({ username: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [busy, setBusy] = useState(false);

  const [tab, setTab] = useState<Tab>('components');
  const [comps, setComps] = useState<AdminComponent[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [audit, setAudit] = useState<AuditEvent[]>([]);
  const [publish, setPublish] = useState<string | null>(null);

  const [componentFilter, setComponentFilter] = useState('');
  const [draft, setDraft] = useState('');
  const [draftStatus, setDraftStatus] = useState('');

  const loadAll = useCallback(
    async (t: string) => {
      const [c, cu, a] = await Promise.all([api.listComponents(t), api.listCustomers(t), api.listAudit(t)]);
      setComps(c.items);
      setCustomers(cu.items);
      setAudit(a.items);
    },
    []
  );

  useEffect(() => {
    const stored = window.localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      loadAll(stored).catch((e) => {
        setLoginError(String(e));
        setToken(null);
      });
    }
  }, [loadAll]);

  async function submitLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setLoginError('');
    try {
      const res = await api.login(login.username, login.password);
      window.localStorage.setItem(TOKEN_KEY, res.token);
      setToken(res.token);
      setUser(res.user.username);
      setLogin({ username: '', password: '' });
      await loadAll(res.token);
    } catch (err) {
      setLoginError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  function signOut() {
    window.localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setComps([]);
    setCustomers([]);
    setAudit([]);
  }

  const refresh = useCallback(
    async (t: string | null) => {
      if (!t) return;
      try {
        const [c, cu, a] = await Promise.all([api.listComponents(t), api.listCustomers(t), api.listAudit(t)]);
        setComps(c.items);
        setCustomers(cu.items);
        setAudit(a.items);
      } catch (e) {
        setLoginError(String(e));
      }
    },
    []
  );

  async function togglePublish(comp: AdminComponent) {
    if (!token) return;
    setPublish(comp.slug);
    try {
      if (comp.status === 'published') await api.unpublish(token, comp.slug);
      else await api.publish(token, comp.slug);
      await refresh(token);
    } catch (e) {
      setLoginError(String(e));
    } finally {
      setPublish(null);
    }
  }

  async function togglePremium(customer: AdminCustomer) {
    if (!token) return;
    setCustomers((prev) => prev.map((c) => (c.id === customer.id ? { ...c, isPremium: !c.isPremium } : c)));
    try {
      await api.setPremium(token, customer.id, !customer.isPremium);
      await refresh(token);
    } catch (e) {
      setLoginError(String(e));
    }
  }

  async function validateDraft() {
    if (!token || !draft.trim()) return;
    setDraftStatus('Validating bundle schema & imports…');
    try {
      const payload = JSON.parse(draft);
      const res = await api.validate(token, payload);
      setDraftStatus(res.ok ? 'VALID ✓ Schema and safe path verification passed.' : 'INVALID:\n' + res.errors.join('\n'));
    } catch (e) {
      if (e instanceof SyntaxError) setDraftStatus('JSON parse error: ' + e.message);
      else setDraftStatus(String(e));
    }
  }

  async function createDraft() {
    if (!token || !draft.trim()) return;
    setDraftStatus('Creating draft in registry…');
    try {
      const payload = JSON.parse(draft);
      await api.create(token, payload);
      setDraftStatus('CREATED ✓ Component draft successfully added to database.');
      setDraft('');
      await refresh(token);
    } catch (e) {
      setDraftStatus(String(e));
    }
  }

  const recentAudit = useMemo(() => audit.slice(0, 100), [audit]);

  const filteredComps = useMemo(() => {
    if (!componentFilter.trim()) return comps;
    const q = componentFilter.toLowerCase();
    return comps.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.accessLevel.toLowerCase().includes(q)
    );
  }, [comps, componentFilter]);

  // Calculated Stats
  const publishedCount = comps.filter((c) => c.status === 'published').length;
  const draftCount = comps.length - publishedCount;
  const freeCompsCount = comps.filter((c) => c.accessLevel === 'free').length;
  const premiumCompsCount = comps.length - freeCompsCount;
  const premiumCustCount = customers.filter((c) => c.isPremium).length;

  if (!token) {
    return (
      <main className="login-card-container">
        <div className="login-card">
          <div className="flex items-center gap-3" style={{ marginBottom: '1.25rem' }}>
            <div className="admin-logo-mark">⚡</div>
            <div>
              <h1 className="admin-title" style={{ fontSize: '1.2rem' }}>
                Tech Inject Admin
              </h1>
              <div style={{ fontSize: '0.78rem', color: '#8c93a1' }}>Component System Management</div>
            </div>
          </div>

          <form onSubmit={submitLogin} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.8rem', color: '#8c93a1' }}>Username</label>
              <input
                placeholder="admin"
                value={login.username}
                autoComplete="username"
                onChange={(e) => setLogin({ ...login, username: e.target.value })}
                required
              />
            </div>

            <div className="flex flex-col gap-1">
              <label style={{ fontSize: '0.8rem', color: '#8c93a1' }}>Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={login.password}
                autoComplete="current-password"
                onChange={(e) => setLogin({ ...login, password: e.target.value })}
                required
              />
            </div>

            <button className="btn primary" type="submit" disabled={busy} style={{ marginTop: '0.5rem', padding: '0.65rem' }}>
              {busy ? 'Signing in…' : 'Sign In to Dashboard'}
            </button>

            {loginError && (
              <div
                style={{
                  border: '1px solid #7a1f1f',
                  borderRadius: 6,
                  padding: '0.6rem 0.8rem',
                  color: '#ff9d9d',
                  background: 'rgba(122, 31, 31, 0.15)',
                  fontSize: '0.82rem',
                }}
              >
                {loginError}
              </div>
            )}

            <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginTop: '0.5rem' }}>
              Configured via environment variables on the API server.
            </div>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-container">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-brand">
          <div className="admin-logo-mark">⚡</div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="admin-title">Admin Console</h1>
              <span className="admin-user-badge">👤 {user || 'admin'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="http://localhost:3010"
            target="_blank"
            rel="noreferrer"
            className="btn"
            style={{ fontSize: '0.8rem', opacity: 0.85 }}
          >
            Catalogue ↗
          </a>
          <button className="btn" onClick={signOut}>
            Sign out
          </button>
        </div>
      </header>

      {/* Metrics Overview Cards */}
      <div className="stat-grid" style={{ marginTop: '1.5rem' }}>
        <div className="stat-card">
          <div className="stat-card-label">
            <span>Components</span>
            <span>📦</span>
          </div>
          <div className="stat-card-value">{comps.length}</div>
          <div className="stat-card-sub">
            <strong style={{ color: '#60a5fa' }}>{publishedCount}</strong> published • <strong style={{ color: '#9aa0ab' }}>{draftCount}</strong> drafts
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            <span>Access Tiers</span>
            <span>💎</span>
          </div>
          <div className="stat-card-value">{premiumCompsCount}</div>
          <div className="stat-card-sub">
            <strong style={{ color: '#fbbf24' }}>{premiumCompsCount}</strong> premium • <strong style={{ color: '#4ade80' }}>{freeCompsCount}</strong> free
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            <span>Customers</span>
            <span>👥</span>
          </div>
          <div className="stat-card-value">{customers.length}</div>
          <div className="stat-card-sub">
            <strong style={{ color: '#fbbf24' }}>{premiumCustCount}</strong> premium accounts
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-card-label">
            <span>Audit Events</span>
            <span>📋</span>
          </div>
          <div className="stat-card-value">{audit.length}</div>
          <div className="stat-card-sub">Server events recorded</div>
        </div>
      </div>

      {/* Segmented Tab Navigation */}
      <nav className="tab-nav">
        <button
          className={`tab-btn ${tab === 'components' ? 'active' : ''}`}
          onClick={() => setTab('components')}
        >
          <span>Components</span>
          <span className="tab-count">{comps.length}</span>
        </button>
        <button
          className={`tab-btn ${tab === 'customers' ? 'active' : ''}`}
          onClick={() => setTab('customers')}
        >
          <span>Customers</span>
          <span className="tab-count">{customers.length}</span>
        </button>
        <button
          className={`tab-btn ${tab === 'audit' ? 'active' : ''}`}
          onClick={() => setTab('audit')}
        >
          <span>Audit Log</span>
          <span className="tab-count">{recentAudit.length}</span>
        </button>
        <button
          className={`tab-btn ${tab === 'publish' ? 'active' : ''}`}
          onClick={() => setTab('publish')}
        >
          <span>Publish Draft</span>
          <span style={{ fontSize: '0.8rem' }}>+</span>
        </button>
      </nav>

      {loginError && (
        <div
          style={{
            border: '1px solid #7a1f1f',
            borderRadius: 8,
            padding: '0.75rem 1rem',
            color: '#ff9d9d',
            background: 'rgba(122, 31, 31, 0.15)',
            marginBottom: '1.25rem',
            fontSize: '0.85rem',
          }}
        >
          {loginError}
        </div>
      )}

      {/* TAB: Components */}
      {tab === 'components' && (
        <div>
          <div className="flex items-center justify-between gap-3" style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Filter components by name, slug, tier..."
              value={componentFilter}
              onChange={(e) => setComponentFilter(e.target.value)}
              style={{ width: '100%', maxWidth: 360, padding: '0.5rem 0.8rem' }}
            />
            <span style={{ fontSize: '0.8rem', color: '#8c93a1' }}>
              Showing {filteredComps.length} of {comps.length}
            </span>
          </div>

          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Component</th>
                  <th>Category</th>
                  <th>Tier</th>
                  <th>Status</th>
                  <th>Version</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredComps.map((c) => (
                  <tr key={c.slug}>
                    <td>
                      <div className="flex flex-col">
                        <span style={{ fontWeight: 600, color: '#fff' }}>{c.name}</span>
                        <code style={{ fontSize: '0.75rem', color: '#8c93a1' }}>{c.slug}</code>
                      </div>
                    </td>
                    <td>
                      <span style={{ textTransform: 'capitalize', color: '#9aa0ab' }}>{c.category}</span>
                    </td>
                    <td>
                      <span className={`pill ${c.accessLevel}`}>{c.accessLevel}</span>
                    </td>
                    <td>
                      <span className={`pill ${c.status === 'published' ? 'published' : 'draft'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <code>v{c.version}</code>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button
                        className={`btn sm ${c.status === 'published' ? 'danger' : 'primary'}`}
                        disabled={publish === c.slug}
                        onClick={() => togglePublish(c)}
                      >
                        {publish === c.slug
                          ? 'Updating…'
                          : c.status === 'published'
                          ? 'Unpublish'
                          : 'Publish'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB: Customers */}
      {tab === 'customers' && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Tier</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Access Control</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <div className="flex flex-col">
                      <span style={{ fontWeight: 600, color: '#fff' }}>{c.name ?? 'Anonymous'}</span>
                      <code style={{ fontSize: '0.78rem', color: '#8c93a1' }}>{c.email}</code>
                    </div>
                  </td>
                  <td>
                    <span className={`pill ${c.isPremium ? 'premium' : 'free'}`}>
                      {c.isPremium ? 'premium' : 'free'}
                    </span>
                  </td>
                  <td>
                    <span style={{ fontSize: '0.8rem', color: '#8c93a1' }}>
                      {c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      className={`btn sm ${c.isPremium ? 'danger' : 'success'}`}
                      onClick={() => togglePremium(c)}
                    >
                      {c.isPremium ? 'Revoke Premium' : 'Grant Premium'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: Audit */}
      {tab === 'audit' && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Detail</th>
              </tr>
            </thead>
            <tbody>
              {recentAudit.map((a) => (
                <tr key={a.id}>
                  <td>
                    <code style={{ fontSize: '0.78rem' }}>
                      {a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}
                    </code>
                  </td>
                  <td>
                    <span style={{ fontWeight: 500 }}>{a.actor}</span>
                  </td>
                  <td>
                    <span className="pill published">{a.action}</span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.78rem', wordBreak: 'break-all' }}>
                      {a.detail ? JSON.stringify(a.detail) : '—'}
                    </code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB: Publish */}
      {tab === 'publish' && (
        <div style={{ background: '#18191c', border: '1px solid var(--border, #232323)', borderRadius: 10, padding: '1.5rem' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 600 }}>Publish Component Bundle</h2>
              <p style={{ opacity: 0.7, fontSize: '0.85rem', margin: '0.3rem 0 0' }}>
                Paste a full <code>ComponentBundle</code> JSON schema. Bundle imports and file safety are validated on the server.
              </p>
            </div>
            <button
              className="btn"
              onClick={() => setDraft(SAMPLE_BUTTON_JSON)}
              style={{ fontSize: '0.78rem' }}
            >
              Load Sample Template
            </button>
          </div>

          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={15}
            placeholder='{"slug":"my-widget","name":"My Widget","description":"…","category":"content","version":"1.0.0","accessLevel":"free","dependencies":[],"files":{"components/my-widget/MyWidget.tsx":"/* … */"},"preview":{"story":"components/my-widget/MyWidget.story.tsx","sample":{}},"props":{},"usage":"<MyWidget />"}'
            style={{ width: '100%', fontFamily: 'ui-monospace, monospace', fontSize: '0.82rem', resize: 'vertical' }}
          />

          <div className="flex items-center justify-between gap-2" style={{ marginTop: '1rem' }}>
            <div className="flex gap-2">
              <button className="btn" onClick={() => void validateDraft()}>
                🔍 Validate Bundle
              </button>
              <button className="btn primary" onClick={() => void createDraft()}>
                🚀 Create &amp; Save Draft
              </button>
            </div>
            {draft && (
              <button className="btn" onClick={() => setDraft('')} style={{ fontSize: '0.78rem', color: '#ff9d9d' }}>
                Clear
              </button>
            )}
          </div>

          {draftStatus && (
            <pre
              style={{
                marginTop: '1.25rem',
                padding: '0.85rem 1rem',
                borderRadius: 8,
                background: '#141517',
                border: '1px solid var(--border, #232323)',
                whiteSpace: 'pre-wrap',
                fontSize: '0.85rem',
                color:
                  draftStatus.startsWith('INVALID') || draftStatus.startsWith('JSON parse')
                    ? '#ff9d9d'
                    : '#4ade80',
              }}
            >
              {draftStatus}
            </pre>
          )}
        </div>
      )}
    </main>
  );
}