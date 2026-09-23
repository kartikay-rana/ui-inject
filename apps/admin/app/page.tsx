'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { api, type AdminComponent, type AdminCustomer, type AuditEvent } from '../lib/api';

const TOKEN_KEY = 'techinject_admin_token';

type Tab = 'components' | 'customers' | 'audit' | 'publish';

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
    setDraftStatus('validating…');
    try {
      const payload = JSON.parse(draft);
      const res = await api.validate(token, payload);
      setDraftStatus(res.ok ? 'VALID ✓' : 'INVALID:\n' + res.errors.join('\n'));
    } catch (e) {
      if (e instanceof SyntaxError) setDraftStatus('JSON parse error: ' + e.message);
      else setDraftStatus(String(e));
    }
  }

  async function createDraft() {
    if (!token || !draft.trim()) return;
    setDraftStatus('creating…');
    try {
      const payload = JSON.parse(draft);
      await api.create(token, payload);
      setDraftStatus('CREATED ✓');
      setDraft('');
      await refresh(token);
    } catch (e) {
      setDraftStatus(String(e));
    }
  }

  const recentAudit = useMemo(() => audit.slice(0, 100), [audit]);

  if (!token) {
    return (
      <main style={{ maxWidth: 420, margin: '0 auto', padding: '6rem 1.5rem' }}>
        <h1 style={{ fontSize: '1.6rem' }}>Tech Inject — Admin</h1>
        <form onSubmit={submitLogin} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', marginTop: '1.5rem' }}>
          <input
            placeholder="username"
            value={login.username}
            autoComplete="username"
            onChange={(e) => setLogin({ ...login, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="password"
            value={login.password}
            autoComplete="current-password"
            onChange={(e) => setLogin({ ...login, password: e.target.value })}
          />
          <button className="btn primary" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
          {loginError && <small style={{ color: '#ff9d9d' }}>{loginError}</small>}
          <small style={{ color: '#6b7280' }}>single administrator, configured via environment</small>
        </form>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1120, margin: '0 auto', padding: '1.5rem 1.5rem 5rem' }}>
      <header className="flex items-center justify-between" style={{ paddingBottom: '1rem', borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <h1 style={{ fontSize: '1.4rem', margin: 0 }}>Admin</h1>
          <span style={{ opacity: 0.5, fontSize: '0.85rem' }}>{user || 'admin'}</span>
        </div>
        <button className="btn" onClick={signOut}>
          Sign out
        </button>
      </header>

      <nav className="flex gap-1" style={{ margin: '1rem 0', fontSize: '0.9rem' }}>
        {(['components', 'customers', 'audit', 'publish'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? 'rgba(255,255,255,0.08)' : 'none',
              border: 0,
              color: 'inherit',
              padding: '0.4rem 0.85rem',
              borderRadius: 6,
              cursor: 'pointer',
            }}
          >
            {t}
          </button>
        ))}
      </nav>

      {loginError && (
        <div style={{ border: '1px solid #7a1f1f', borderRadius: 8, padding: '0.7rem 1rem', color: '#ff9d9d', marginBottom: '1rem' }}>
          {loginError}
        </div>
      )}

      {tab === 'components' && (
        <div className="overflow-auto">
          <table>
            <thead>
              <tr>
                <th>slug</th>
                <th>name</th>
                <th>tier</th>
                <th>status</th>
                <th>version</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {comps.map((c) => (
                <tr key={c.slug}>
                  <td>
                    <code>{c.slug}</code>
                  </td>
                  <td>{c.name}</td>
                  <td>
                    <span className={`pill ${c.accessLevel}`}>{c.accessLevel}</span>
                  </td>
                  <td>
                    <span className={`pill ${c.status === 'published' ? 'published' : 'draft'}`}>{c.status}</span>
                  </td>
                  <td>
                    <code>{c.version}</code>
                  </td>
                  <td>
                    <button className="btn primary" disabled={publish === c.slug} onClick={() => togglePublish(c)}>
                      {c.status === 'published' ? 'Unpublish' : 'Publish'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'customers' && (
        <div className="overflow-auto">
          <table>
            <thead>
              <tr>
                <th>email</th>
                <th>name</th>
                <th>premium</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.email}</td>
                  <td>{c.name ?? '—'}</td>
                  <td>
                    <span className={`pill ${c.isPremium ? 'premium' : 'free'}`}>{c.isPremium ? 'premium' : 'free'}</span>
                  </td>
                  <td>
                    <button className="btn" onClick={() => togglePremium(c)}>
                      {c.isPremium ? 'Revoke' : 'Grant'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'audit' && (
        <div className="overflow-auto">
          <table>
            <thead>
              <tr>
                <th>when</th>
                <th>actor</th>
                <th>action</th>
                <th>detail</th>
              </tr>
            </thead>
            <tbody>
              {recentAudit.map((a) => (
                <tr key={a.id}>
                  <td>
                    <code style={{ fontSize: '0.8rem' }}>{a.createdAt ? new Date(a.createdAt).toLocaleString() : '—'}</code>
                  </td>
                  <td>{a.actor}</td>
                  <td>
                    <span className="pill">{a.action}</span>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.8rem' }}>{a.detail ? JSON.stringify(a.detail) : '—'}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === 'publish' && (
        <div>
          <p style={{ opacity: 0.7, fontSize: '0.88rem', marginTop: 0 }}>
            Paste a full <code>ComponentBundle</code> JSON (slug, name, description, category, version, accessLevel,
            dependencies, files, preview, props, usage) to validate and/or publish it. The registry schema and import audit
            run server-side.
          </p>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={16}
            placeholder='{"slug":"my-widget","name":"My Widget","description":"…","category":"content","version":"1.0.0","accessLevel":"free","dependencies":[],"files":{"components/my-widget/MyWidget.tsx":"/* … */","components/my-widget/MyWidget.css":"/* … */"},"preview":{"story":"components/my-widget/MyWidget.story.tsx","sample":{}},"props":{},"usage":"<MyWidget />"}'
            style={{ width: '100%', fontFamily: 'ui-monospace, monospace', fontSize: '0.82rem' }}
          />
          <div className="flex gap-2" style={{ marginTop: '0.8rem' }}>
            <button className="btn" onClick={() => void validateDraft()}>
              Validate
            </button>
            <button className="btn primary" onClick={() => void createDraft()}>
              Create draft
            </button>
          </div>
          {draftStatus && (
            <pre
              style={{
                marginTop: '1rem',
                whiteSpace: 'pre-wrap',
                fontSize: '0.85rem',
                color: draftStatus.startsWith('INVALID') || draftStatus.startsWith('JSON parse') ? '#ff9d9d' : '#6fd08c',
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